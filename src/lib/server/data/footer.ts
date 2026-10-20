import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { FooterContent } from "@/content/types";
import { collections } from "../db";

export const FOOTER_TAG = "footer";

const DEFAULT_FOOTER: FooterContent = {
  tagline: "Marketing, content production and technology for growing businesses, under one roof.",
  ctaTitle: "Have a project in mind?",
  ctaLabel: "Let's talk",
  socials: [],
  note: "",
};

/** Uncached read, for the admin panel. */
export async function loadFooter(): Promise<FooterContent> {
  const { footerSettings } = await collections();
  const doc = await footerSettings.findOne({ _id: "footer" });
  if (!doc) return DEFAULT_FOOTER;
  return {
    tagline: doc.tagline ?? "",
    ctaTitle: doc.ctaTitle || DEFAULT_FOOTER.ctaTitle,
    ctaLabel: doc.ctaLabel || DEFAULT_FOOTER.ctaLabel,
    socials: (doc.socials ?? []).map(({ label, url }) => ({ label, url })),
    note: doc.note ?? "",
  };
}

/** Cached read for the public site, with the year for the copyright line
 *  (worked out here, inside the cache, so pages can still be prerendered). */
export async function getFooter(): Promise<FooterContent & { year: number }> {
  "use cache";
  cacheLife("hours");
  cacheTag(FOOTER_TAG);
  return { ...(await loadFooter()), year: new Date().getFullYear() };
}

export async function saveFooter(value: FooterContent): Promise<void> {
  const { footerSettings } = await collections();
  await footerSettings.updateOne({ _id: "footer" }, { $set: { ...value, updatedAt: new Date() } }, { upsert: true });
}
