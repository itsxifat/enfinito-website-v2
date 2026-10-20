"use client";

import { ImagePlus, RotateCcw, Trash2, Upload } from "lucide-react";
import { type ChangeEvent, type DragEvent, useEffect, useRef, useState } from "react";
import type { ImageAsset } from "@/content/types";
import styles from "./ImageInput.module.css";

export type ImagePreview = { src: string; width: number; height: number };

const ACCEPT = "image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml";

type Props = {
  id: string;
  name: string;
  /** Existing image (edit forms). */
  current?: ImageAsset | null;
  variant: "logo" | "cover";
  maxBytes: number;
  error?: string;
  /** Offer to remove the image; the form then gets `<name>Remove=on`. */
  removable?: boolean;
  onPreviewChange?: (preview: ImagePreview | null) => void;
};

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB`;

function load(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Crops uniform edges (colour of the top-left pixel), like the server does
 *  for logos, so the preview shows what will actually be stored. */
function trim(img: HTMLImageElement): Promise<ImagePreview | null> {
  const { naturalWidth: w, naturalHeight: h } = img;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx || !w || !h) return Promise.resolve(null);
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);
  const [r, g, b, a] = [data[0], data[1], data[2], data[3]];
  const differs = (i: number) =>
    Math.abs(data[i + 3] - a) > 10 ||
    (a > 0 && Math.abs(data[i] - r) + Math.abs(data[i + 1] - g) + Math.abs(data[i + 2] - b) > 30);

  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (differs((y * w + x) * 4)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return Promise.resolve(null);
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  if (cw === w && ch === h) return Promise.resolve(null);

  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  out.getContext("2d")!.drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
  return new Promise((resolve) =>
    out.toBlob((blob) => resolve(blob ? { src: URL.createObjectURL(blob), width: cw, height: ch } : null)),
  );
}

async function previewFor(file: File, variant: "logo" | "cover"): Promise<ImagePreview> {
  const src = URL.createObjectURL(file);
  const img = await load(src);
  if (!img) return { src, width: 400, height: 200 };
  if (variant === "logo" && file.type !== "image/svg+xml") {
    const trimmed = await trim(img);
    if (trimmed) {
      URL.revokeObjectURL(src);
      return trimmed;
    }
  }
  return { src, width: img.naturalWidth || 400, height: img.naturalHeight || 200 };
}

export function ImageInput({ id, name, current, variant, maxBytes, error, removable = false, onPreviewChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<{ file: File; preview: ImagePreview } | null>(null);
  const [removed, setRemoved] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Release object URLs when replaced or unmounted.
  useEffect(() => () => {
    if (selected) URL.revokeObjectURL(selected.preview.src);
  }, [selected]);

  const shown: ImagePreview | null = removed
    ? null
    : (selected?.preview ?? (current ? { src: current.src, width: current.width, height: current.height } : null));

  async function accept(file: File | undefined) {
    setLocalError(null);
    if (!file) return;
    if (!ACCEPT.split(",").includes(file.type)) {
      setLocalError("Use a PNG, JPG, WebP, AVIF, GIF or SVG image.");
      if (input.current) input.current.value = "";
      return;
    }
    if (file.size > maxBytes) {
      setLocalError(`That image is ${mb(file.size)}. The maximum is ${mb(maxBytes)}.`);
      if (input.current) input.current.value = "";
      return;
    }
    const preview = await previewFor(file, variant);
    setSelected({ file, preview });
    setRemoved(false);
    onPreviewChange?.(preview);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    void accept(e.target.files?.[0]);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !input.current) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.current.files = transfer.files;
    void accept(file);
  }

  function undo() {
    if (input.current) input.current.value = "";
    setSelected(null);
    setRemoved(false);
    setLocalError(null);
    onPreviewChange?.(current ? { src: current.src, width: current.width, height: current.height } : null);
  }

  function remove() {
    if (input.current) input.current.value = "";
    setSelected(null);
    setRemoved(true);
    setLocalError(null);
    onPreviewChange?.(null);
  }

  const message = localError ?? error;

  return (
    <div className={styles.wrap}>
      <div
        className={styles.zone}
        data-variant={variant}
        data-filled={shown ? "" : undefined}
        data-dragging={dragging ? "" : undefined}
        data-invalid={message ? "" : undefined}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob/preview image
          <img src={shown.src} alt="" className={styles.preview} />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon} aria-hidden="true">
              <ImagePlus size={22} strokeWidth={1.75} />
            </span>
            <span className={styles.placeholderTitle}>Drop an image here</span>
            <span className={styles.placeholderText}>
              PNG, JPG, WebP, AVIF, GIF or SVG, up to {mb(maxBytes)}
              {variant === "logo" ? ". Transparent PNG or SVG works best." : ". Landscape, at least 1600 px wide."}
            </span>
          </div>
        )}
        <input
          ref={input}
          id={id}
          name={name}
          type="file"
          accept={ACCEPT}
          onChange={onChange}
          className={styles.file}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? `${id}-error` : undefined}
        />
      </div>

      <div className={styles.bar}>
        <span className={styles.fileName}>
          {selected
            ? `${selected.file.name} · ${mb(selected.file.size)}`
            : removed && current
              ? "The current image will be removed when you save"
              : shown
                ? "Current image"
                : "No image selected"}
        </span>
        <span className={styles.barActions}>
          {removable && shown ? (
            <button type="button" className={styles.link} onClick={remove}>
              <Trash2 size={14} aria-hidden="true" /> Remove
            </button>
          ) : null}
          {(selected || removed) && current ? (
            <button type="button" className={styles.link} onClick={undo}>
              <RotateCcw size={14} aria-hidden="true" /> Keep current
            </button>
          ) : null}
          <label htmlFor={id} className={styles.browse}>
            <Upload size={14} aria-hidden="true" /> {shown ? "Replace" : "Browse"}
          </label>
        </span>
      </div>

      {removed && current ? <input type="hidden" name={`${name}Remove`} value="on" /> : null}

      {message ? (
        <p className={styles.error} id={`${id}-error`} role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
