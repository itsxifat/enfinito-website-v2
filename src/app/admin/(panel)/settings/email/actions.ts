"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fieldErrors, type FormState, formString } from "@/lib/form-state";
import { requireUser } from "@/lib/server/auth";
import { encryptSecret } from "@/lib/server/crypto";
import { loadEmailSettings, saveEmailSettings } from "@/lib/server/data/settings";
import { sendTestEmail } from "@/lib/server/email/send";
import { consume } from "@/lib/server/rate-limit";

const optionalEmail = (message: string) => z.union([z.literal(""), z.email(message).max(200)]);

const schema = z
  .object({
    enabled: z.boolean(),
    host: z.string().max(200).regex(/^[a-z0-9.-]*$/i, "Enter a host name like smtp.gmail.com"),
    port: z.coerce.number().int("Enter a port number.").min(1, "Enter a port number.").max(65535, "Enter a valid port."),
    security: z.enum(["ssl", "starttls", "none"]),
    user: z.string().max(200),
    fromName: z.string().max(80, "Keep the name under 80 characters."),
    fromEmail: optionalEmail("Enter a valid email address."),
    replyTo: optionalEmail("Enter a valid email address."),
    notifyEmail: optionalEmail("Enter a valid email address."),
  })
  .superRefine((v, ctx) => {
    if (!v.enabled) return;
    if (!v.host) ctx.addIssue({ code: "custom", path: ["host"], message: "Required to send emails." });
    if (!v.fromEmail) ctx.addIssue({ code: "custom", path: ["fromEmail"], message: "Required to send emails." });
  });

export async function saveEmail(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = schema.safeParse({
    enabled: formData.get("enabled") === "on",
    host: formString(formData, "host").toLowerCase(),
    port: formString(formData, "port") || "587",
    security: formString(formData, "security"),
    user: formString(formData, "user"),
    fromName: formString(formData, "fromName"),
    fromEmail: formString(formData, "fromEmail").toLowerCase(),
    replyTo: formString(formData, "replyTo").toLowerCase(),
    notifyEmail: formString(formData, "notifyEmail").toLowerCase(),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };

  const { security, ...rest } = parsed.data;
  // Passwords aren't trimmed; blank means "keep the saved one".
  const password = String(formData.get("password") ?? "");
  const current = await loadEmailSettings();
  const passwordEnc = password ? encryptSecret(password) : undefined;
  if (rest.enabled && rest.user && !password && !current.passwordEnc) {
    return { errors: { password: "Enter the SMTP password." }, message: "Please fix the highlighted fields." };
  }

  await saveEmailSettings({ ...rest, secure: security === "ssl" }, passwordEnc);
  revalidatePath("/admin", "layout");
  return {
    ok: true,
    message: rest.enabled ? "Email settings saved. Send a test email to check they work." : "Email settings saved. Confirmation emails are turned off.",
  };
}

export async function sendTest(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const to = formString(formData, "to").toLowerCase();
  if (!z.email().safeParse(to).success) return { errors: { to: "Enter a valid email address." } };
  if (!(await consume(`email-test:${user.id}`, 10, 60 * 60 * 1000))) {
    return { message: "You've sent several test emails recently. Try again in a little while." };
  }
  try {
    await sendTestEmail(to);
    return { ok: true, message: `Test email sent to ${to}. Check the inbox (and the spam folder).` };
  } catch (err) {
    return { message: `Couldn't send: ${err instanceof Error ? err.message : "unknown error"}` };
  }
}
