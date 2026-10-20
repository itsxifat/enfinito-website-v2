import "server-only";
import { GridFSBucket, MongoClient, type Db } from "mongodb";
import { getEnv } from "./env";
import type {
  AboutSettingsDoc,
  BrandDoc,
  ContactSettingsDoc,
  EmailSettingsDoc,
  FooterSettingsDoc,
  LegalPageDoc,
  MessageDoc,
  NewsDoc,
  OfferingDoc,
  RateLimitDoc,
  SessionDoc,
  UserDoc,
} from "./models";

// One client per process; kept on globalThis so dev hot reloads reuse it.
const g = globalThis as typeof globalThis & {
  __mongo?: Promise<MongoClient>;
  __mongoIndexes?: Promise<void>;
};

function client(): Promise<MongoClient> {
  if (!g.__mongo) {
    const mongo = new MongoClient(getEnv().MONGODB_URI, {
      appName: "enfinito-web",
      serverSelectionTimeoutMS: 8000,
    });
    g.__mongo = mongo.connect().catch((err) => {
      g.__mongo = undefined;
      throw err;
    });
  }
  return g.__mongo;
}

async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
    db.collection("sessions").createIndex({ userId: 1 }),
    db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("rateLimits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("brands").createIndex({ order: 1 }),
    db.collection("offerings").createIndex({ kind: 1, order: 1 }),
    db.collection("news").createIndex({ publishedAt: -1 }),
    db.collection("messages").createIndex({ createdAt: -1 }),
    db.collection("messages").createIndex({ status: 1, createdAt: -1 }),
  ]);
}

export async function getDb(): Promise<Db> {
  const db = (await client()).db(getEnv().MONGODB_DB);
  g.__mongoIndexes ??= ensureIndexes(db).catch((err) => {
    g.__mongoIndexes = undefined;
    throw err;
  });
  await g.__mongoIndexes;
  return db;
}

export async function collections() {
  const db = await getDb();
  return {
    users: db.collection<UserDoc>("users"),
    sessions: db.collection<SessionDoc>("sessions"),
    rateLimits: db.collection<RateLimitDoc>("rateLimits"),
    brands: db.collection<BrandDoc>("brands"),
    offerings: db.collection<OfferingDoc>("offerings"),
    news: db.collection<NewsDoc>("news"),
    legalPages: db.collection<LegalPageDoc>("legalPages"),
    messages: db.collection<MessageDoc>("messages"),
    contactSettings: db.collection<ContactSettingsDoc>("settings"),
    emailSettings: db.collection<EmailSettingsDoc>("settings"),
    aboutSettings: db.collection<AboutSettingsDoc>("settings"),
    footerSettings: db.collection<FooterSettingsDoc>("settings"),
  };
}

export async function mediaBucket(): Promise<GridFSBucket> {
  return new GridFSBucket(await getDb(), { bucketName: "media" });
}
