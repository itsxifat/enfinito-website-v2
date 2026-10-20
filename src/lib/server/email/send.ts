import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import sharp from "sharp";
import { decryptSecret } from "../crypto";
import { recordConfirmation } from "../data/messages";
import { isEmailConfigured, loadContactSettings, loadEmailSettings } from "../data/settings";
import { getEnv } from "../env";
import type { EmailSettings } from "../models";
import { contactConfirmationEmail, type EnquiryDetails, LOGO_CID, newEnquiryNotification, testEmail } from "./templates";

// The logo PNG has transparent padding; trim it once and cache at 2× size.
let logo: Promise<Buffer> | undefined;
function emailLogo(): Promise<Buffer> {
  logo ??= readFile(path.join(process.cwd(), "public", "en-logo.png")).then((png) =>
    sharp(png).trim().resize({ width: 280 }).png().toBuffer(),
  );
  return logo;
}

/** The trimmed logo as a data URL, for previewing emails in the browser. */
export async function emailLogoDataUrl(): Promise<string> {
  return `data:image/png;base64,${(await emailLogo()).toString("base64")}`;
}

function transport(settings: EmailSettings) {
  const pass = settings.passwordEnc ? decryptSecret(settings.passwordEnc) : null;
  if (settings.user && settings.passwordEnc && pass === null) {
    throw new Error("The saved SMTP password can't be decrypted (APP_SECRET changed). Re-enter it in Settings → Email.");
  }
  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    ...(settings.user ? { auth: { user: settings.user, pass: pass ?? "" } } : {}),
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
}

type Outgoing = { to: string; subject: string; html: string; text: string; replyTo?: string };

async function send(settings: EmailSettings, mail: Outgoing): Promise<void> {
  await transport(settings).sendMail({
    from: { name: settings.fromName || "Enfinito", address: settings.fromEmail },
    to: mail.to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
    attachments: [{ filename: "enfinito.png", content: await emailLogo(), cid: LOGO_CID, contentType: "image/png" }],
  });
}

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err)).slice(0, 300);

/** Sends the confirmation to the enquirer (and the optional team alert),
 *  then records the outcome on the message. Never throws. */
export async function deliverEnquiryEmails(messageId: ObjectId, enquiry: EnquiryDetails): Promise<void> {
  try {
    const [settings, contact] = await Promise.all([loadEmailSettings(), loadContactSettings()]);
    const { SITE_URL } = getEnv();
    const ready = isEmailConfigured(settings);

    if (!settings.enabled || !ready) {
      await recordConfirmation(messageId, { status: "skipped" });
    } else {
      try {
        await send(settings, {
          to: enquiry.email,
          replyTo: settings.replyTo || contact.email || undefined,
          ...contactConfirmationEmail(enquiry, contact, SITE_URL),
        });
        await recordConfirmation(messageId, { status: "sent" });
      } catch (err) {
        console.error("[email] confirmation failed:", err);
        await recordConfirmation(messageId, { status: "failed", error: errorMessage(err) });
      }
    }

    if (ready && settings.notifyEmail) {
      const adminUrl = new URL(`/admin/messages/${messageId.toHexString()}`, SITE_URL).toString();
      await send(settings, {
        to: settings.notifyEmail,
        replyTo: enquiry.email,
        ...newEnquiryNotification(enquiry, adminUrl, contact, SITE_URL),
      }).catch((err) => console.error("[email] team notification failed:", err));
    }
  } catch (err) {
    console.error("[email] delivery error:", err);
  }
}

/** Sends a test message with the saved settings; throws a readable error. */
export async function sendTestEmail(to: string): Promise<void> {
  const [settings, contact] = await Promise.all([loadEmailSettings(), loadContactSettings()]);
  if (!isEmailConfigured(settings)) throw new Error("Save the SMTP host, port and from address first.");
  try {
    await send(settings, { to, ...testEmail(contact, getEnv().SITE_URL) });
  } catch (err) {
    throw new Error(errorMessage(err));
  }
}
