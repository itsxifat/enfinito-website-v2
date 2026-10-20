import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { AboutContent } from "@/content/types";
import { collections } from "../db";
import { deleteImage } from "../media";
import type { StoredImage } from "../models";

export const ABOUT_TAG = "about";

/** Starter copy, used until the About page is first saved in the admin.
 *  Deliberately free of facts and figures that would need checking. */
const DEFAULT_ABOUT: AboutContent = {
  statement:
    "Enfinito brings *marketing, content production and technology* under one roof, so growing businesses get everything they need from one partner.",
  summary:
    "Our specialist teams and products work together, taking ideas from strategy to launch without the handoffs that slow businesses down.",
  intro: "We help businesses grow with marketing, content and technology, delivered by specialist teams that work as one.",
  storyTitle: "Our story",
  story: [
    "We believe growing businesses shouldn't have to juggle a dozen agencies, freelancers and tools to get things done.",
    "So we built Enfinito around specialist teams and products that work as one: content production, marketing and the technology that keeps a business running, from cloud telephony to ecommerce.",
    "Whether you need a campaign, a product shoot or a platform to sell online, you work with one partner that understands the whole picture.",
  ].join("\n\n"),
  valuesTitle: "What we stand for",
  values: [
    {
      title: "One team",
      text: "Strategy, production, marketing and technology under one roof, so nothing gets lost between handoffs.",
    },
    {
      title: "Craft in every detail",
      text: "We sweat the details others skip, because quality is what people remember.",
    },
    {
      title: "Clear and honest",
      text: "Plain language, realistic timelines and straight answers, from the first call to the final report.",
    },
    {
      title: "Built for the long run",
      text: "We measure success by the growth of the businesses we work with, not by one-off projects.",
    },
  ],
  stats: [],
};

/** Uncached read, for the admin panel. */
export async function loadAbout(): Promise<AboutContent> {
  const { aboutSettings } = await collections();
  const doc = await aboutSettings.findOne({ _id: "about" });
  if (!doc) return DEFAULT_ABOUT;
  return {
    statement: doc.statement || DEFAULT_ABOUT.statement,
    summary: doc.summary ?? "",
    intro: doc.intro ?? "",
    ...(doc.image ? { image: { src: doc.image.src, width: doc.image.width, height: doc.image.height } } : {}),
    storyTitle: doc.storyTitle || DEFAULT_ABOUT.storyTitle,
    story: doc.story ?? "",
    valuesTitle: doc.valuesTitle || DEFAULT_ABOUT.valuesTitle,
    values: (doc.values ?? []).map(({ title, text }) => ({ title, text })),
    stats: (doc.stats ?? []).map(({ value, label }) => ({ value, label })),
  };
}

/** Cached read for the public site; invalidated via ABOUT_TAG on save. */
export async function getAbout(): Promise<AboutContent> {
  "use cache";
  cacheLife("hours");
  cacheTag(ABOUT_TAG);
  return loadAbout();
}

/** `image`: a new photo, null to remove the current one, or undefined to
 *  keep it. A replaced or removed photo's file is deleted. */
export async function saveAbout(value: Omit<AboutContent, "image">, image: StoredImage | null | undefined): Promise<void> {
  const { aboutSettings } = await collections();
  const existing = await aboutSettings.findOne({ _id: "about" }, { projection: { image: 1 } });
  const set = { ...value, ...(image ? { image } : {}), updatedAt: new Date() };
  await aboutSettings.updateOne(
    { _id: "about" },
    image === null ? { $set: set, $unset: { image: "" } } : { $set: set },
    { upsert: true },
  );
  if (image !== undefined && existing?.image) await deleteImage(existing.image.fileId);
}

/** Splits text into paragraphs at blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
