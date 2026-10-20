import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { ContactInfo } from "@/content/types";
import { collections } from "../db";
import type { EmailSettings } from "../models";

export const CONTACT_TAG = "contact";

const DEFAULT_CONTACT: ContactInfo = {
  heading: "Let's talk",
  intro: "Tell us about your business and what you need. A member of our team will get back to you shortly.",
  email: "",
  phone: "",
  hours: "",
  tradeLicense: "",
  addresses: [],
};

const DEFAULT_EMAIL: EmailSettings = {
  enabled: false,
  host: "",
  port: 587,
  secure: false,
  user: "",
  fromName: "Enfinito",
  fromEmail: "",
  replyTo: "",
  notifyEmail: "",
};

// ---------- Contact page ----------

/** Uncached read, for the admin panel and emails. */
export async function loadContactSettings(): Promise<ContactInfo> {
  const { contactSettings } = await collections();
  const doc = await contactSettings.findOne({ _id: "contact" });
  if (!doc) return DEFAULT_CONTACT;
  return {
    heading: doc.heading || DEFAULT_CONTACT.heading,
    intro: doc.intro ?? DEFAULT_CONTACT.intro,
    email: doc.email ?? "",
    phone: doc.phone ?? "",
    hours: doc.hours ?? "",
    tradeLicense: doc.tradeLicense ?? "",
    addresses: (doc.addresses ?? []).map((a) => ({
      label: a.label,
      lines: a.lines,
      postalCode: a.postalCode ?? "",
      ...(a.mapUrl ? { mapUrl: a.mapUrl } : {}),
    })),
  };
}

/** Cached read for the public site; invalidated via CONTACT_TAG on save. */
export async function getContactInfo(): Promise<ContactInfo> {
  "use cache";
  cacheLife("hours");
  cacheTag(CONTACT_TAG);
  return loadContactSettings();
}

export async function saveContactSettings(value: ContactInfo): Promise<void> {
  const { contactSettings } = await collections();
  await contactSettings.updateOne(
    { _id: "contact" },
    { $set: { ...value, updatedAt: new Date() } },
    { upsert: true },
  );
}

// ---------- Email (never cached: holds credentials) ----------

export async function loadEmailSettings(): Promise<EmailSettings> {
  const { emailSettings } = await collections();
  const doc = await emailSettings.findOne({ _id: "email" });
  if (!doc) return DEFAULT_EMAIL;
  const { _id, updatedAt, ...settings } = doc;
  void _id;
  void updatedAt;
  return { ...DEFAULT_EMAIL, ...settings };
}

/** `password`: a new password to store, or undefined to keep the saved one. */
export async function saveEmailSettings(
  value: Omit<EmailSettings, "passwordEnc">,
  passwordEnc: string | undefined,
): Promise<void> {
  const { emailSettings } = await collections();
  await emailSettings.updateOne(
    { _id: "email" },
    { $set: { ...value, ...(passwordEnc !== undefined ? { passwordEnc } : {}), updatedAt: new Date() } },
    { upsert: true },
  );
}

export function isEmailConfigured(settings: EmailSettings): boolean {
  return Boolean(settings.host && settings.port && settings.fromEmail);
}
