"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession } from "@/lib/server/auth";
import { findUserByEmail, normalizeEmail, recordLogin } from "@/lib/server/data/users";
import { getDummyHash, verifyPassword } from "@/lib/server/password";
import { consume, requestMeta, reset } from "@/lib/server/rate-limit";

export type SignInState = { error?: string; email?: string };

const credentials = z.object({
  email: z.email().max(200),
  password: z.string().min(1).max(200),
});

const WINDOW_MS = 15 * 60 * 1000;

/** Only same-site admin paths; anything else falls back to the dashboard. */
function safeNext(value: FormDataEntryValue | null): string {
  return typeof value === "string" && /^\/admin(\/|$|\?)/.test(value) && !value.startsWith("//") ? value : "/admin";
}

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const parsed = credentials.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { error: "Enter your email address and password.", email };

  const { ip } = await requestMeta();
  const accountKey = `login:account:${email}`;
  const [ipAllowed, accountAllowed] = await Promise.all([
    consume(`login:ip:${ip}`, 30, WINDOW_MS),
    consume(accountKey, 8, WINDOW_MS),
  ]);
  if (!ipAllowed || !accountAllowed) {
    return { error: "Too many sign-in attempts. Please wait 15 minutes and try again.", email };
  }

  const user = await findUserByEmail(email);
  // Always run the hash check so unknown emails take as long as wrong passwords.
  const valid = await verifyPassword(parsed.data.password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid) return { error: "That email and password don't match an account.", email };

  await reset(accountKey);
  await createSession(user._id);
  await recordLogin(user._id);
  redirect(safeNext(formData.get("next")));
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
