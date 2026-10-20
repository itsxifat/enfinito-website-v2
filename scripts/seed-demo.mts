// Fills a local database with demo content so every part of the site and
// admin panel has something to show. Only adds to empty collections.
//
//   npm run seed:demo             add demo brands, services, products, news
//                                 and contact details
//   npm run seed:demo -- --remove delete everything this script added
//
// Demo documents are tagged `demo: true`. The services and products are the
// real ones, with generated placeholder banners to replace in the admin.
import { readFile, readdir } from "node:fs/promises";
import { once } from "node:events";
import path from "node:path";
import { parseArgs } from "node:util";
import { GridFSBucket, MongoClient, ObjectId, type Db } from "mongodb";
import sharp from "sharp";
import { MARK_PATH } from "../src/components/brand/markShape.ts";

const { values } = parseArgs({ options: { remove: { type: "boolean", default: false } } });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Add it to .env.local.");
  process.exit(1);
}

const BRAND_NAMES: Record<string, string> = {
  lumora: "Lumora",
  veltrix: "Veltrix",
  kairo: "Kairo",
  orbital: "Orbital",
  fieldstone: "Fieldstone",
  nimbus: "Nimbus",
  arcwell: "Arcwell",
  halden: "Halden",
};

async function upload(db: Db, data: Buffer, contentType: string, ext: string, width: number, height: number) {
  const bucket = new GridFSBucket(db, { bucketName: "media" });
  const fileId = new ObjectId();
  const stream = bucket.openUploadStreamWithId(fileId, `${fileId.toHexString()}.${ext}`, {
    metadata: { contentType, width, height, demo: true },
  });
  stream.end(data);
  await once(stream, "finish");
  return { fileId, src: `/media/${fileId.toHexString()}.${ext}`, width, height, contentType };
}

// ---------- Generated cover art ----------

const W = 1600;
const H = 1000;

function cover(variant: number): string {
  const mark = (x: number, y: number, scale: number, fill: string, opacity = 1) =>
    `<path d="${MARK_PATH}" transform="translate(${x} ${y}) scale(${scale})" fill="${fill}" fill-opacity="${opacity}"/>`;
  const art = [
    // Blue field with a large white mark.
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2F66F0"/><stop offset="1" stop-color="#173FAE"/></linearGradient></defs>
     <rect width="${W}" height="${H}" fill="url(#g)"/>${mark(640, 260, 0.62, "#fff", 0.92)}`,
    // Ink with diagonal blue bands.
    `<rect width="${W}" height="${H}" fill="#0D111C"/>
     <g transform="rotate(-45 800 500)">${[0, 1, 2, 3, 4].map((i) => `<rect x="${-400 + i * 260}" y="-600" width="120" height="2200" rx="60" fill="#1F55DF" fill-opacity="${0.25 + i * 0.15}"/>`).join("")}</g>`,
    // Soft light with a blue mark.
    `<defs><radialGradient id="r" cx=".7" cy=".3" r=".9"><stop offset="0" stop-color="#E9EFFE"/><stop offset="1" stop-color="#F7F8FA"/></radialGradient></defs>
     <rect width="${W}" height="${H}" fill="url(#r)"/>${mark(170, 230, 0.44, "#1F55DF")}`,
    // Concentric rounded frames.
    `<rect width="${W}" height="${H}" fill="#F2F5FD"/>
     ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${200 + i * 70}" y="${110 + i * 55}" width="${1200 - i * 140}" height="${780 - i * 110}" rx="${120 - i * 14}" fill="none" stroke="#1F55DF" stroke-opacity="${0.15 + i * 0.13}" stroke-width="10"/>`).join("")}`,
  ][variant % 4];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${art}</svg>`;
}

// Banner art for services and products: abstract, on brand, no text.
function banner(variant: number): string {
  const art = [
    // Ink with a blue spotlight and lens rings.
    `<defs><radialGradient id="s" cx=".72" cy=".4" r=".7"><stop offset="0" stop-color="#2F66F0" stop-opacity=".9"/><stop offset=".6" stop-color="#1F55DF" stop-opacity=".16"/><stop offset="1" stop-color="#0D111C" stop-opacity="0"/></radialGradient></defs>
     <rect width="${W}" height="${H}" fill="#0D111C"/><rect width="${W}" height="${H}" fill="url(#s)"/>
     ${[110, 190, 270, 350, 430].map((r, i) => `<circle cx="1150" cy="400" r="${r}" fill="none" stroke="#fff" stroke-opacity="${0.5 - i * 0.09}" stroke-width="3"/>`).join("")}`,
    // Pale blue with rising bars.
    `<defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4F7FE"/><stop offset="1" stop-color="#DCE6FC"/></linearGradient></defs>
     <rect width="${W}" height="${H}" fill="url(#b)"/>
     ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${260 + i * 190}" y="${760 - (i + 1) * 95}" width="110" height="${(i + 1) * 95 + 400}" rx="55" fill="#1F55DF" fill-opacity="${0.2 + i * 0.16}"/>`).join("")}`,
    // Blue field with signal waves.
    `<defs><linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2F66F0"/><stop offset="1" stop-color="#173FAE"/></linearGradient></defs>
     <rect width="${W}" height="${H}" fill="url(#w)"/>
     <circle cx="420" cy="560" r="44" fill="#fff"/>
     ${[150, 270, 390, 510, 630, 750].map((r, i) => `<circle cx="420" cy="560" r="${r}" fill="none" stroke="#fff" stroke-opacity="${0.75 - i * 0.11}" stroke-width="${10 - i}"/>`).join("")}`,
    // Light grey with storefront tiles.
    `<rect width="${W}" height="${H}" fill="#F2F5FD"/>
     ${[0, 1, 2].flatMap((c) => [0, 1].map((r) => `<rect x="${290 + c * 360}" y="${190 + r * 330}" width="300" height="280" rx="36" fill="${c === 1 && r === 0 ? "#1F55DF" : "#fff"}" stroke="#D9DCE4" stroke-width="${c === 1 && r === 0 ? 0 : 3}"/>`)).join("")}`,
  ][variant % 4];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${art}</svg>`;
}

const DEMO_OFFERINGS = [
  {
    kind: "service",
    name: "Enfinito Studio",
    tagline: "Photo, film and content production",
    description: "Product photography, cinematography, ad campaigns with professional models and end-to-end content production.",
    url: "https://studio.enfinito.com",
  },
  {
    kind: "service",
    name: "Enmark",
    tagline: "Marketing that grows your business",
    description: "Strategy, campaigns and performance marketing that help businesses reach the right customers.",
    url: "https://enmark.enfinito.cloud",
  },
  {
    kind: "product",
    name: "Envo",
    tagline: "Cloud PBX and business numbers",
    description: "Hosted PBX and IP numbers for teams of any size, managed entirely in the cloud.",
  },
  {
    kind: "product",
    name: "Ncom",
    tagline: "The ecommerce platform for growing brands",
    description: "A SaaS platform to launch and run an online store, with products, orders and customers in one place.",
  },
] as const;

const DEMO_NEWS = [
  ["Enfinito launches a dedicated content studio", "Photo, video and motion production now under one roof for our clients."],
  ["How we approach brand strategy in 2026", "A look at the process behind the identities we build with growing businesses."],
  ["Five lessons from scaling a client's marketing", "What changed when a regional retailer moved to always-on campaigns."],
  ["Meet the team behind our technology practice", "The engineers and designers who build our clients' digital products."],
] as const;

// ---------- Run ----------

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "enfinito");
  const brands = db.collection("brands");
  const news = db.collection("news");
  const offerings = db.collection("offerings");
  const settings = db.collection<{ _id: string }>("settings");
  const files = db.collection("media.files");

  if (values.remove) {
    const bucket = new GridFSBucket(db, { bucketName: "media" });
    const demoFiles = await files.find({ "metadata.demo": true }, { projection: { _id: 1 } }).toArray();
    for (const f of demoFiles) await bucket.delete(f._id as ObjectId);
    const b = await brands.deleteMany({ demo: true });
    const o = await offerings.deleteMany({ demo: true });
    const n = await news.deleteMany({ demo: true });
    const s = await settings.deleteMany({ _id: "contact", demo: true } as object);
    console.log(
      `Removed ${b.deletedCount} brands, ${o.deletedCount} services and products, ${n.deletedCount} news, ` +
        `${s.deletedCount} contact settings, ${demoFiles.length} files.`,
    );
  } else {
    const now = new Date();

    if ((await brands.countDocuments()) === 0) {
      const dir = path.join(import.meta.dirname, "demo-assets", "brands");
      const slugs = Object.keys(BRAND_NAMES);
      const available = new Set(await readdir(dir));
      let order = 0;
      for (const slug of slugs) {
        if (!available.has(`${slug}.svg`)) continue;
        const svg = await readFile(path.join(dir, `${slug}.svg`));
        const [, w, h] = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg.toString())!;
        const logo = await upload(db, svg, "image/svg+xml", "svg", Number(w), Number(h));
        await brands.insertOne({ name: BRAND_NAMES[slug], logo, order: ++order, visible: true, demo: true, createdAt: now, updatedAt: now });
      }
      console.log(`Added ${order} demo brands.`);
    } else console.log("Brands already exist, skipped.");

    for (const kind of ["service", "product"] as const) {
      if ((await offerings.countDocuments({ kind })) > 0) {
        console.log(`${kind === "service" ? "Services" : "Products"} already exist, skipped.`);
        continue;
      }
      const items = DEMO_OFFERINGS.filter((o) => o.kind === kind);
      for (const [order, item] of items.entries()) {
        const jpg = await sharp(Buffer.from(banner(DEMO_OFFERINGS.indexOf(item)))).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
        const image = await upload(db, jpg, "image/jpeg", "jpg", W, H);
        await offerings.insertOne({ ...item, image, order: order + 1, visible: true, demo: true, createdAt: now, updatedAt: now });
      }
      console.log(`Added ${items.length} ${kind === "service" ? "services" : "products"}.`);
    }

    if ((await news.countDocuments()) === 0) {
      for (const [i, [title, subtitle]] of DEMO_NEWS.entries()) {
        const jpg = await sharp(Buffer.from(cover(i))).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
        const image = await upload(db, jpg, "image/jpeg", "jpg", W, H);
        const publishedAt = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i * 9));
        await news.insertOne({
          title,
          subtitle,
          image,
          url: `https://example.com/blog/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
          publishedAt,
          visible: true,
          demo: true,
          createdAt: now,
          updatedAt: now,
        });
      }
      console.log(`Added ${DEMO_NEWS.length} demo news articles.`);
    } else console.log("News already exists, skipped.");

    if (!(await settings.findOne({ _id: "contact" }))) {
      await settings.insertOne({
        _id: "contact",
        heading: "Let's talk",
        intro: "Tell us about your business and what you need. A member of our team will get back to you shortly.",
        email: "hello@example.com",
        phone: "+1 (555) 010-0199",
        hours: "Monday to Friday, 9:00 to 18:00",
        tradeLicense: "DEMO-0000000",
        addresses: [
          {
            label: "Head office",
            lines: "12 Example Street\nSuite 400\nSample City",
            postalCode: "10001",
            mapUrl: "https://maps.google.com/?q=Example+Street",
          },
          { label: "Studio", lines: "48 Placeholder Avenue\nSample City", postalCode: "10002" },
        ],
        demo: true,
        updatedAt: now,
      } as { _id: string });
      console.log("Added demo contact details.");
    } else console.log("Contact details already exist, skipped.");
  }
} finally {
  await client.close();
}
