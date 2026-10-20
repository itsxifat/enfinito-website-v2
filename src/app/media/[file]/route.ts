import { readImage } from "@/lib/server/media";

// Serves uploaded images from GridFS. Each upload gets a new id, so responses
// can be cached forever.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const match = /^([a-f\d]{24})\.(png|jpg|webp|avif|gif|svg)$/i.exec(file);
  const image = match ? await readImage(match[1]) : null;
  if (!image) return new Response("Not found", { status: 404 });

  const headers = new Headers({
    "Content-Type": image.contentType,
    "Content-Length": String(image.length),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });
  if (image.contentType === "image/svg+xml") {
    // Opened directly, an SVG can't run scripts or load anything.
    headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  }
  return new Response(image.body, { headers });
}
