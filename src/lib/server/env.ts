import "server-only";
import { z } from "zod";

const schema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DB: z.string().min(1).default("enfinito"),
  APP_SECRET: z.string().min(32, "APP_SECRET must be at least 32 characters"),
  SITE_URL: z.url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/** Validated server environment. Parsed lazily so a missing variable fails
 *  with a clear message at the point of use, not at import. */
export function getEnv(): Env {
  if (cached) return cached;
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment configuration:\n  ${problems.join("\n  ")}`);
  }
  cached = result.data;
  return cached;
}

export const isProduction = process.env.NODE_ENV === "production";
