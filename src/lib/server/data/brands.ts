import "server-only";
import { ObjectId } from "mongodb";
import { cacheLife, cacheTag } from "next/cache";
import type { Brand, ImageAsset } from "@/content/types";
import { collections } from "../db";
import { deleteImage } from "../media";
import type { BrandDoc, StoredImage } from "../models";
import { toObjectId } from "./ids";

export const BRANDS_TAG = "brands";

const asset = ({ src, width, height }: StoredImage): ImageAsset => ({ src, width, height });

/** Visible brands in display order, for the home page. */
export async function getPublicBrands(): Promise<Brand[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(BRANDS_TAG);
  const { brands } = await collections();
  const docs = await brands.find({ visible: true }).sort({ order: 1, _id: 1 }).toArray();
  return docs.map((d) => ({ name: d.name, logo: asset(d.logo), ...(d.url ? { url: d.url } : {}) }));
}

// ---------- Admin ----------

export type AdminBrand = {
  id: string;
  name: string;
  url: string;
  visible: boolean;
  logo: ImageAsset;
  updatedAt: Date;
};

const toAdmin = (d: BrandDoc): AdminBrand => ({
  id: d._id.toHexString(),
  name: d.name,
  url: d.url ?? "",
  visible: d.visible,
  logo: asset(d.logo),
  updatedAt: d.updatedAt,
});

export async function listBrands(): Promise<AdminBrand[]> {
  const { brands } = await collections();
  return (await brands.find().sort({ order: 1, _id: 1 }).toArray()).map(toAdmin);
}

export async function getBrand(id: string): Promise<AdminBrand | null> {
  const _id = toObjectId(id);
  if (!_id) return null;
  const { brands } = await collections();
  const doc = await brands.findOne({ _id });
  return doc ? toAdmin(doc) : null;
}

export async function countBrands(): Promise<{ total: number; visible: number }> {
  const { brands } = await collections();
  const [total, visible] = await Promise.all([brands.countDocuments(), brands.countDocuments({ visible: true })]);
  return { total, visible };
}

type BrandInput = { name: string; url: string; visible: boolean };

export async function createBrand(input: BrandInput, logo: StoredImage): Promise<string> {
  const { brands } = await collections();
  const last = await brands.find().sort({ order: -1 }).limit(1).next();
  const now = new Date();
  const _id = new ObjectId();
  await brands.insertOne({
    _id,
    name: input.name,
    ...(input.url ? { url: input.url } : {}),
    visible: input.visible,
    logo,
    order: (last?.order ?? 0) + 1,
    createdAt: now,
    updatedAt: now,
  });
  return _id.toHexString();
}

/** Replaces the logo when one is given (and deletes the old file). */
export async function updateBrand(id: string, input: BrandInput, logo?: StoredImage): Promise<boolean> {
  const _id = toObjectId(id);
  if (!_id) return false;
  const { brands } = await collections();
  const existing = await brands.findOne({ _id });
  if (!existing) return false;
  const set = {
    name: input.name,
    visible: input.visible,
    updatedAt: new Date(),
    ...(input.url ? { url: input.url } : {}),
    ...(logo ? { logo } : {}),
  };
  await brands.updateOne({ _id }, input.url ? { $set: set } : { $set: set, $unset: { url: "" } });
  if (logo) await deleteImage(existing.logo.fileId);
  return true;
}

export async function setBrandVisibility(id: string, visible: boolean): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;
  const { brands } = await collections();
  await brands.updateOne({ _id }, { $set: { visible, updatedAt: new Date() } });
}

export async function deleteBrand(id: string): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;
  const { brands } = await collections();
  const doc = await brands.findOneAndDelete({ _id });
  if (doc) await deleteImage(doc.logo.fileId);
}

/** Swaps a brand with its neighbour above (-1) or below (1). */
export async function moveBrand(id: string, direction: -1 | 1): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;
  const { brands } = await collections();
  const all = await brands.find({}, { projection: { _id: 1 } }).sort({ order: 1, _id: 1 }).toArray();
  const index = all.findIndex((b) => b._id.equals(_id));
  const target = index + direction;
  if (index < 0 || target < 0 || target >= all.length) return;
  [all[index], all[target]] = [all[target], all[index]];
  // Renumber everything so orders stay dense and unique.
  await brands.bulkWrite(
    all.map((b, i) => ({ updateOne: { filter: { _id: b._id }, update: { $set: { order: i + 1 } } } })),
  );
}
