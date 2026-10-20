import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { LEGAL_SLUGS } from "@/content/site";
import type { LegalPage, LegalSlug } from "@/content/types";
import { collections } from "../db";
import { LEGAL_TEMPLATES } from "./legal-templates";

export const LEGAL_TAG = "legal";

/** Uncached read, for the admin panel. Until a page is first saved it
 *  shows its starter text, with no date. */
export async function loadLegalPage(slug: LegalSlug): Promise<LegalPage> {
  const { legalPages } = await collections();
  const doc = await legalPages.findOne({ _id: slug });
  if (!doc) return { slug, ...LEGAL_TEMPLATES[slug], updatedAt: null };
  return { slug, title: doc.title, body: doc.body, updatedAt: doc.updatedAt };
}

/** Cached read for the public site; invalidated via LEGAL_TAG on save. */
export async function getLegalPage(slug: LegalSlug): Promise<LegalPage> {
  "use cache";
  cacheLife("hours");
  cacheTag(LEGAL_TAG);
  return loadLegalPage(slug);
}

export async function listLegalPages(): Promise<LegalPage[]> {
  return Promise.all(LEGAL_SLUGS.map(loadLegalPage));
}

export async function saveLegalPage(slug: LegalSlug, value: { title: string; body: string }): Promise<void> {
  const { legalPages } = await collections();
  await legalPages.updateOne({ _id: slug }, { $set: { ...value, updatedAt: new Date() } }, { upsert: true });
}
