import "server-only";
import { headers } from "next/headers";
import { collections } from "./db";

/** Fixed-window counter stored in MongoDB (expired windows are removed by a
 *  TTL index). Counts this attempt and reports whether it is within `limit`. */
export async function consume(key: string, limit: number, windowMs: number): Promise<boolean> {
  const { rateLimits } = await collections();
  const now = new Date();
  const live = { $gt: ["$expiresAt", now] };
  const doc = await rateLimits.findOneAndUpdate(
    { _id: key },
    [
      {
        $set: {
          count: { $cond: [live, { $add: ["$count", 1] }, 1] },
          expiresAt: { $cond: [live, "$expiresAt", new Date(now.getTime() + windowMs)] },
        },
      },
    ],
    { upsert: true, returnDocument: "after" },
  );
  return (doc?.count ?? 1) <= limit;
}

export async function reset(key: string): Promise<void> {
  const { rateLimits } = await collections();
  await rateLimits.deleteOne({ _id: key });
}

/** Best-effort client IP and user agent for the current request. */
export async function requestMeta(): Promise<{ ip: string; userAgent: string }> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return {
    ip: forwarded || h.get("x-real-ip") || "unknown",
    userAgent: (h.get("user-agent") ?? "").slice(0, 300),
  };
}
