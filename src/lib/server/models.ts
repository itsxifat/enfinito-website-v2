import type { ObjectId } from "mongodb";
import type { AboutContent, ContactInfo, FooterContent, LegalSlug, OfferingKind } from "@/content/types";

// ---------- Auth ----------

export type Role = "owner" | "admin";

export type UserDoc = {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
};

export type SessionDoc = {
  _id: ObjectId;
  /** SHA-256 of the cookie token; the raw token is never stored. */
  tokenHash: string;
  userId: ObjectId;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  ip?: string;
  userAgent?: string;
};

export type RateLimitDoc = {
  _id: string;
  count: number;
  expiresAt: Date;
};

// ---------- Content ----------

export type StoredImage = {
  fileId: ObjectId;
  src: string;
  width: number;
  height: number;
  contentType: string;
};

export type BrandDoc = {
  _id: ObjectId;
  name: string;
  logo: StoredImage;
  url?: string;
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Services and products share one collection, split by `kind`. */
export type OfferingDoc = {
  _id: ObjectId;
  kind: OfferingKind;
  name: string;
  tagline: string;
  description: string;
  image: StoredImage;
  url?: string;
  order: number;
  visible: boolean;
  /** Listed in the navbar dropdown (while visible). Missing means yes. */
  inNav?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NewsDoc = {
  _id: ObjectId;
  title: string;
  subtitle: string;
  image: StoredImage;
  url: string;
  publishedAt: Date;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type LegalPageDoc = {
  _id: LegalSlug;
  title: string;
  body: string;
  updatedAt: Date;
};

// ---------- Enquiries ----------

export type MessageStatus = "new" | "read" | "archived";
export type DeliveryStatus = "sent" | "failed" | "skipped";

export type MessageDoc = {
  _id: ObjectId;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  message: string;
  status: MessageStatus;
  createdAt: Date;
  readAt?: Date;
  ip?: string;
  userAgent?: string;
  confirmation: { status: DeliveryStatus; at: Date; error?: string };
};

// ---------- Settings (one document per _id in `settings`) ----------

export type ContactSettings = ContactInfo;

export type EmailSettings = {
  /** Send confirmation emails to people who submit the contact form. */
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  /** AES-GCM encrypted SMTP password. */
  passwordEnc?: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  /** Where to notify the team about new enquiries; empty = off. */
  notifyEmail: string;
};

export type ContactSettingsDoc = ContactSettings & { _id: "contact"; updatedAt: Date };
export type AboutSettingsDoc = Omit<AboutContent, "image"> & { _id: "about"; image?: StoredImage; updatedAt: Date };
export type FooterSettingsDoc = FooterContent & { _id: "footer"; updatedAt: Date };
export type EmailSettingsDoc = EmailSettings & { _id: "email"; updatedAt: Date };
