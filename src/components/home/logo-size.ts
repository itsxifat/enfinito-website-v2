import type { ImageAsset } from "@/content/types";

// Logos are sized to a similar visual weight (equal area) rather than equal
// height, so wide wordmarks and compact marks look balanced side by side.
const LOGO_AREA = 4400;
const MAX_HEIGHT = 44;
const MAX_WIDTH = 164;

export function logoSize({ width, height }: Pick<ImageAsset, "width" | "height">) {
  const ratio = width / height;
  let h = Math.min(Math.sqrt(LOGO_AREA / ratio), MAX_HEIGHT);
  let w = h * ratio;
  if (w > MAX_WIDTH) {
    w = MAX_WIDTH;
    h = w / ratio;
  }
  return { width: Math.round(w), height: Math.round(h) };
}
