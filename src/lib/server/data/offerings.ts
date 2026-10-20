import "server-only";
import { ObjectId } from "mongodb";
import { cacheLife, cacheTag } from "next/cache";
import type { ImageAsset, Offering, OfferingKind } from "@/content/types";
import { collections } from "../db";
import { deleteImage } from "../media";
import type { OfferingDoc, StoredImage } from "../models";
import { toObjectId } from "./ids";

/** Cache tag for one kind's public list (home section and its page). */
export const offeringTag = (kind: OfferingKind) => (kind === "service" ? "services" : "products");

const asset = ({ src, width, height }: StoredImage): ImageAsset => ({ src, width, height });

const toPublic = (d: OfferingDoc): Offering => ({
  id: d._id.toHexString(),
  name: d.name,
  tagline: d.tagline,
  description: d.description,
  image: asset(d.image),
  ...(d.url ? { url: d.url } : {}),
});

/** Visible services or products in display order. */
export async function getPublicOfferings(kind: OfferingKind): Promise<Offering[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(offeringTag(kind));
  const { offerings } = await collections();
  const docs = await offerings.find({ kind, visible: true }).sort({ order: 1, _id: 1 }).toArray();
  return docs.map(toPublic);
}

/** The ones chosen for the navbar dropdown: visible and not opted out. */
export async function getMenuOfferings(kind: OfferingKind): Promise<Offering[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(offeringTag(kind));
  const { offerings } = await collections();
  const docs = await offerings
    .find({ kind, visible: true, inNav: { $ne: false } })
    .sort({ order: 1, _id: 1 })
    .toArray();
  return docs.map(toPublic);
}

// ---------- Admin ----------

export type AdminOffering = Omit<Offering, "url"> & {
  url: string;
  visible: boolean;
  inNav: boolean;
  updatedAt: Date;
};

const toAdmin = (d: OfferingDoc): AdminOffering => ({
  ...toPublic(d),
  url: d.url ?? "",
  visible: d.visible,
  inNav: d.inNav !== false,
  updatedAt: d.updatedAt,
});

export async function listOfferings(kind: OfferingKind): Promise<AdminOffering[]> {
  const { offerings } = await collections();
  return (await offerings.find({ kind }).sort({ order: 1, _id: 1 }).toArray()).map(toAdmin);
}

export async function getOffering(kind: OfferingKind, id: string): Promise<AdminOffering | null> {
  const _id = toObjectId(id);
  if (!_id) return null;
  const { offerings } = await collections();
  const doc = await offerings.findOne({ _id, kind });
  return doc ? toAdmin(doc) : null;
}

export async function countOfferings(kind: OfferingKind): Promise<{ total: number; visible: number }> {
  const { offerings } = await collections();
  const [total, visible] = await Promise.all([
    offerings.countDocuments({ kind }),
    offerings.countDocuments({ kind, visible: true }),
  ]);
  return { total, visible };
}

type OfferingInput = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  visible: boolean;
  inNav: boolean;
};

export async function createOffering(kind: OfferingKind, input: OfferingInput, image: StoredImage): Promise<string> {
  const { offerings } = await collections();
  const last = await offerings.find({ kind }).sort({ order: -1 }).limit(1).next();
  const now = new Date();
  const _id = new ObjectId();
  const { url, ...rest } = input;
  await offerings.insertOne({
    _id,
    kind,
    ...rest,
    ...(url ? { url } : {}),
    image,
    order: (last?.order ?? 0) + 1,
    createdAt: now,
    updatedAt: now,
  });
  return _id.toHexString();
}

/** Replaces the banner when one is given (and deletes the old file). */
export async function updateOffering(
  kind: OfferingKind,
  id: string,
  input: OfferingInput,
  image?: StoredImage,
): Promise<boolean> {
  const _id = toObjectId(id);
  if (!_id) return false;
  const { offerings } = await collections();
  const existing = await offerings.findOne({ _id, kind });
  if (!existing) return false;
  const { url, ...rest } = input;
  const set = { ...rest, updatedAt: new Date(), ...(url ? { url } : {}), ...(image ? { image } : {}) };
  await offerings.updateOne({ _id }, url ? { $set: set } : { $set: set, $unset: { url: "" } });
  if (image) await deleteImage(existing.image.fileId);
  return true;
}

export async function setOfferingVisibility(kind: OfferingKind, id: string, visible: boolean): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;
  const { offerings } = await collections();
  await offerings.updateOne({ _id, kind }, { $set: { visible, updatedAt: new Date() } });
}

export async function setOfferingInNav(kind: OfferingKind, id: string, inNav: boolean): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;
  const { offerings } = await collections();
  await offerings.updateOne({ _id, kind }, { $set: { inNav, updatedAt: new Date() } });
}

export async function deleteOffering(kind: OfferingKind, id: string): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;
  const { offerings } = await collections();
  const doc = await offerings.findOneAndDelete({ _id, kind });
  if (doc) await deleteImage(doc.image.fileId);
}

/** Swaps an item with its neighbour above (-1) or below (1). */
export async function moveOffering(kind: OfferingKind, id: string, direction: -1 | 1): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;
  const { offerings } = await collections();
  const all = await offerings.find({ kind }, { projection: { _id: 1 } }).sort({ order: 1, _id: 1 }).toArray();
  const index = all.findIndex((o) => o._id.equals(_id));
  const target = index + direction;
  if (index < 0 || target < 0 || target >= all.length) return;
  [all[index], all[target]] = [all[target], all[index]];
  // Renumber everything so orders stay dense and unique.
  await offerings.bulkWrite(
    all.map((o, i) => ({ updateOne: { filter: { _id: o._id }, update: { $set: { order: i + 1 } } } })),
  );
}
