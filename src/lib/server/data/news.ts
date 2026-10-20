import "server-only";
import { ObjectId } from "mongodb";
import { cacheLife, cacheTag } from "next/cache";
import type { ImageAsset, NewsItem } from "@/content/types";
import { collections } from "../db";
import { deleteImage } from "../media";
import type { NewsDoc, StoredImage } from "../models";
import { toObjectId } from "./ids";

export const NEWS_TAG = "news";

const asset = ({ src, width, height }: StoredImage): ImageAsset => ({ src, width, height });

/** Visible articles, newest first, for the News page. */
export async function getPublicNews(): Promise<NewsItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(NEWS_TAG);
  const { news } = await collections();
  const docs = await news.find({ visible: true }).sort({ publishedAt: -1, _id: -1 }).toArray();
  return docs.map((d) => ({
    id: d._id.toHexString(),
    title: d.title,
    subtitle: d.subtitle,
    image: asset(d.image),
    url: d.url,
    publishedAt: d.publishedAt,
  }));
}

// ---------- Admin ----------

export type AdminNews = NewsItem & { visible: boolean; updatedAt: Date };

const toAdmin = (d: NewsDoc): AdminNews => ({
  id: d._id.toHexString(),
  title: d.title,
  subtitle: d.subtitle,
  image: asset(d.image),
  url: d.url,
  publishedAt: d.publishedAt,
  visible: d.visible,
  updatedAt: d.updatedAt,
});

export async function listNews(): Promise<AdminNews[]> {
  const { news } = await collections();
  return (await news.find().sort({ publishedAt: -1, _id: -1 }).toArray()).map(toAdmin);
}

export async function getNews(id: string): Promise<AdminNews | null> {
  const _id = toObjectId(id);
  if (!_id) return null;
  const { news } = await collections();
  const doc = await news.findOne({ _id });
  return doc ? toAdmin(doc) : null;
}

export async function countNews(): Promise<{ total: number; visible: number }> {
  const { news } = await collections();
  const [total, visible] = await Promise.all([news.countDocuments(), news.countDocuments({ visible: true })]);
  return { total, visible };
}

type NewsInput = { title: string; subtitle: string; url: string; publishedAt: Date; visible: boolean };

export async function createNews(input: NewsInput, image: StoredImage): Promise<string> {
  const { news } = await collections();
  const now = new Date();
  const _id = new ObjectId();
  await news.insertOne({ _id, ...input, image, createdAt: now, updatedAt: now });
  return _id.toHexString();
}

/** Replaces the image when one is given (and deletes the old file). */
export async function updateNews(id: string, input: NewsInput, image?: StoredImage): Promise<boolean> {
  const _id = toObjectId(id);
  if (!_id) return false;
  const { news } = await collections();
  const existing = await news.findOne({ _id });
  if (!existing) return false;
  await news.updateOne({ _id }, { $set: { ...input, ...(image ? { image } : {}), updatedAt: new Date() } });
  if (image) await deleteImage(existing.image.fileId);
  return true;
}

export async function setNewsVisibility(id: string, visible: boolean): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;
  const { news } = await collections();
  await news.updateOne({ _id }, { $set: { visible, updatedAt: new Date() } });
}

export async function deleteNews(id: string): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;
  const { news } = await collections();
  const doc = await news.findOneAndDelete({ _id });
  if (doc) await deleteImage(doc.image.fileId);
}
