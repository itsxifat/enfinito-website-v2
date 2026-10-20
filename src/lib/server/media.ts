import "server-only";
import { once } from "node:events";
import { Readable } from "node:stream";
import { ObjectId } from "mongodb";
import sharp from "sharp";
import { mediaBucket } from "./db";
import type { StoredImage } from "./models";

const RASTER_TYPES: Record<string, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
};
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export class UploadError extends Error {}

type Purpose = "logo" | "cover";

const LIMITS: Record<Purpose, { maxBytes: number; maxWidth: number }> = {
  logo: { maxBytes: 2 * 1024 * 1024, maxWidth: 1200 },
  cover: { maxBytes: 10 * 1024 * 1024, maxWidth: 2400 },
};

export const ACCEPTED_IMAGE_TYPES = Object.keys(EXTENSIONS).join(",");

export function isFilePresent(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && value.size > 0;
}

// ---------- SVG ----------

// Uploads come from signed-in admins and are only ever shown through <img>
// (where scripts never run) and served with a sandboxing CSP. This rejects
// active content anyway, as defence in depth.
const SVG_DENYLIST = /<script|<foreignObject|\son[a-z]+\s*=|javascript:|<iframe|<embed|<object/i;

function svgSize(svg: string): { width: number; height: number } | null {
  const root = svg.match(/<svg\b[^>]*>/i)?.[0];
  if (!root) return null;
  const viewBox = root.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (viewBox) return { width: Number(viewBox[1]), height: Number(viewBox[2]) };
  const w = root.match(/\swidth\s*=\s*["']\s*([\d.]+)(px)?\s*["']/i);
  const h = root.match(/\sheight\s*=\s*["']\s*([\d.]+)(px)?\s*["']/i);
  if (w && h) return { width: Number(w[1]), height: Number(h[1]) };
  return null;
}

// ---------- Store / read / delete ----------

/** Validates an uploaded image, normalises it for its purpose and stores it
 *  in GridFS. Logos have transparent/solid padding trimmed so they size
 *  consistently; large images are scaled down. */
export async function storeImage(file: File, purpose: Purpose): Promise<StoredImage> {
  const limits = LIMITS[purpose];
  if (file.size > limits.maxBytes) {
    throw new UploadError(`Image is too large (max ${Math.round(limits.maxBytes / 1024 / 1024)} MB).`);
  }

  let data: Buffer = Buffer.from(await file.arrayBuffer());
  let contentType: string;
  let width: number;
  let height: number;

  const head = data.subarray(0, 1024).toString("utf8").trimStart();
  if (file.type === "image/svg+xml" || /^(<\?xml|<svg)/i.test(head)) {
    const svg = data.toString("utf8");
    if (SVG_DENYLIST.test(svg)) throw new UploadError("This SVG contains scripts or embedded content and can't be used.");
    const size = svgSize(svg);
    if (!size || !size.width || !size.height) throw new UploadError("This SVG has no size. Add a viewBox or width/height.");
    contentType = "image/svg+xml";
    ({ width, height } = size);
  } else {
    const meta = await sharp(data).metadata().catch(() => null);
    if (!meta) throw new UploadError("That file isn't a supported image.");
    const type = meta.format ? RASTER_TYPES[meta.format] : undefined;
    if (!type || !meta.width || !meta.height) {
      throw new UploadError("Use a PNG, JPG, WebP, AVIF, GIF or SVG image.");
    }
    contentType = type;

    if ((meta.pages ?? 1) > 1) {
      // Animated: keep as uploaded.
      width = meta.width;
      height = meta.height;
    } else {
      // Re-encoding applies EXIF rotation and strips metadata (e.g. GPS).
      let pipeline = sharp(data).rotate();
      if (purpose === "logo") pipeline = pipeline.trim({ threshold: 4 });
      pipeline = pipeline.resize({ width: limits.maxWidth, withoutEnlargement: true });
      if (type === "image/jpeg") pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
      else if (type === "image/webp") pipeline = pipeline.webp({ quality: 90 });
      else if (type === "image/avif") pipeline = pipeline.avif({ quality: 70 });
      const out = await pipeline.toBuffer({ resolveWithObject: true });
      data = out.data;
      width = out.info.width;
      height = out.info.height;
    }
  }

  const bucket = await mediaBucket();
  const fileId = new ObjectId();
  const ext = EXTENSIONS[contentType];
  const upload = bucket.openUploadStreamWithId(fileId, `${fileId.toHexString()}.${ext}`, {
    metadata: { contentType, width, height, purpose, originalName: file.name.slice(0, 200) },
  });
  upload.end(data);
  await once(upload, "finish");

  return { fileId, src: `/media/${fileId.toHexString()}.${ext}`, width, height, contentType };
}

export async function deleteImage(fileId: ObjectId | undefined): Promise<void> {
  if (!fileId) return;
  try {
    await (await mediaBucket()).delete(fileId);
  } catch {
    // Already gone; nothing to clean up.
  }
}

export async function readImage(
  id: string,
): Promise<{ body: ReadableStream; contentType: string; length: number } | null> {
  if (!ObjectId.isValid(id)) return null;
  const bucket = await mediaBucket();
  const _id = new ObjectId(id);
  const file = await bucket.find({ _id }).next();
  if (!file) return null;
  const stream = bucket.openDownloadStream(_id);
  return {
    body: Readable.toWeb(stream) as ReadableStream,
    contentType: (file.metadata?.contentType as string) ?? "application/octet-stream",
    length: file.length,
  };
}
