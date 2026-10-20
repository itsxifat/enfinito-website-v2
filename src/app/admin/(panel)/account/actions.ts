"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fieldErrors, type FormState, formString } from "@/lib/form-state";
import { endOtherSessions, requireSession } from "@/lib/server/auth";
import { findUserById, updateUserName, updateUserPassword } from "@/lib/server/data/users";
import { MIN_PASSWORD_LENGTH, verifyPassword } from "@/lib/server/password";
import { consume } from "@/lib/server/rate-limit";

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireSession();
  const parsed = z.string().min(1, "Enter your name.").max(80, "Keep your name under 80 characters.").safeParse(formString(formData, "name"));
  if (!parsed.success) return { errors: { name: parsed.error.issues[0].message } };
  await updateUserName(user._id, parsed.data);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Profile updated." };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`).max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "The passwords don't match." })
  .refine((v) => v.next !== v.current, { path: ["next"], message: "Choose a password you haven't used here." });

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();
  const parsed = passwordSchema.safeParse({
    current: String(formData.get("current") ?? ""),
    next: String(formData.get("next") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  if (!(await consume(`password-change:${session.user.id}`, 5, 15 * 60 * 1000))) {
    return { message: "Too many attempts. Please wait 15 minutes and try again." };
  }
  const user = await findUserById(session.user._id);
  if (!user || !(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return { errors: { current: "That isn't your current password." } };
  }

  await updateUserPassword(user._id, parsed.data.next);
  const ended = await endOtherSessions(session);
  revalidatePath("/admin/account");
  return {
    ok: true,
    message: ended ? `Password changed. ${ended} other ${ended === 1 ? "session was" : "sessions were"} signed out.` : "Password changed.",
  };
}

export async function signOutOtherSessions(): Promise<void> {
  const session = await requireSession();
  await endOtherSessions(session);
  revalidatePath("/admin/account");
}
