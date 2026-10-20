import "server-only";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/auth-cookie";
import { randomToken, sha256 } from "./crypto";
import { collections } from "./db";
import { isProduction } from "./env";
import type { Role } from "./models";
import { requestMeta } from "./rate-limit";

export type SessionUser = {
  id: string;
  _id: ObjectId;
  name: string;
  email: string;
  role: Role;
};

export type Session = { user: SessionUser; sessionId: ObjectId };

const cookieOptions = (expires: Date) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
  expires,
});

/** Starts a session: a random token in an httpOnly cookie, its hash in the
 *  database. A fresh token on every sign-in prevents session fixation. */
export async function createSession(userId: ObjectId): Promise<void> {
  const token = randomToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  const { ip, userAgent } = await requestMeta();
  const { sessions } = await collections();
  await sessions.insertOne({
    _id: new ObjectId(),
    tokenHash: sha256(token),
    userId,
    createdAt: now,
    lastSeenAt: now,
    expiresAt,
    ip,
    userAgent,
  });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

/** The signed-in admin for this request, or null. Deduplicated per render. */
export const getSession = cache(async (): Promise<Session | null> => {
  // Request-time only: never part of a prerender (the DB driver reads clocks).
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { sessions, users } = await collections();
  const session = await sessions.findOne({ tokenHash: sha256(token) });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  const user = await users.findOne({ _id: session.userId }, { projection: { passwordHash: 0 } });
  if (!user) return null;
  if (Date.now() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
    await sessions.updateOne({ _id: session._id }, { $set: { lastSeenAt: new Date() } });
  }
  return {
    user: { id: user._id.toHexString(), _id: user._id, name: user.name, email: user.email, role: user.role },
    sessionId: session._id,
  };
});

/** Use at the top of every admin page and Server Action. */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session.user;
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const { sessions } = await collections();
    await sessions.deleteOne({ tokenHash: sha256(token) });
  }
  // Overwrite with matching attributes; required for `__Host-` cookies.
  jar.set(SESSION_COOKIE, "", { ...cookieOptions(new Date(0)), maxAge: 0 });
}

export type ActiveSession = {
  id: string;
  current: boolean;
  createdAt: Date;
  lastSeenAt: Date;
  ip?: string;
  userAgent?: string;
};

export async function listSessions(session: Session): Promise<ActiveSession[]> {
  const { sessions } = await collections();
  const docs = await sessions
    .find({ userId: session.user._id, expiresAt: { $gt: new Date() } })
    .sort({ lastSeenAt: -1 })
    .toArray();
  return docs.map((s) => ({
    id: s._id.toHexString(),
    current: s._id.equals(session.sessionId),
    createdAt: s.createdAt,
    lastSeenAt: s.lastSeenAt,
    ip: s.ip,
    userAgent: s.userAgent,
  }));
}

export async function endOtherSessions(session: Session): Promise<number> {
  const { sessions } = await collections();
  const result = await sessions.deleteMany({ userId: session.user._id, _id: { $ne: session.sessionId } });
  return result.deletedCount;
}
