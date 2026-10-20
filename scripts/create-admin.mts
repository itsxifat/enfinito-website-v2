// Creates an admin account (or resets an existing one's password).
//
//   npm run admin:create -- --email you@company.com --name "Your Name"
//   npm run admin:create -- --email you@company.com --reset
//
// Prompts for the password (hidden). Defaults come from ADMIN_EMAIL,
// ADMIN_NAME and ADMIN_PASSWORD in .env.local. The first account is the
// owner, who can add and remove other admins.
import { createInterface } from "node:readline";
import { parseArgs } from "node:util";
import { MongoClient, ObjectId } from "mongodb";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../src/lib/server/password.ts";

function fail(message: string): never {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

function promptHidden(question: string): Promise<string> {
  process.stdout.write(question);
  const stdin = process.stdin;
  if (!stdin.isTTY) {
    return new Promise((resolve) => {
      const rl = createInterface({ input: stdin });
      rl.once("line", (line) => {
        rl.close();
        resolve(line);
      });
    });
  }
  return new Promise((resolve) => {
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (ch === "\u0003") process.exit(130);
        value = ch === "\u007f" || ch === "\b" ? value.slice(0, -1) : value + ch;
      }
    };
    stdin.on("data", onData);
  });
}

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string" },
    reset: { type: "boolean", default: false },
  },
});

const uri = process.env.MONGODB_URI;
if (!uri) fail("MONGODB_URI is not set. Add it to .env.local.");

const email = (values.email ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const name = (values.name ?? process.env.ADMIN_NAME ?? "").trim();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Pass a valid --email.");

const client = new MongoClient(uri);
try {
  await client.connect();
  const users = client.db(process.env.MONGODB_DB || "enfinito").collection("users");
  await users.createIndex({ email: 1 }, { unique: true });
  const existing = await users.findOne({ email });

  if (existing && !values.reset) fail(`${email} already exists. Use --reset to set a new password.`);
  if (!existing && !name) fail("Pass --name for a new account.");

  let password = process.env.ADMIN_PASSWORD ?? "";
  if (!password) {
    password = await promptHidden(`  Password for ${email}: `);
    const again = await promptHidden("  Repeat password: ");
    if (password !== again) fail("Passwords don't match.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) fail(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);

  const passwordHash = await hashPassword(password);
  const now = new Date();

  if (existing) {
    await users.updateOne({ _id: existing._id }, { $set: { passwordHash, updatedAt: now } });
    await client.db(process.env.MONGODB_DB || "enfinito").collection("sessions").deleteMany({ userId: existing._id });
    console.log(`\n  ✔ Password reset for ${email}. All their sessions were signed out.\n`);
  } else {
    const role = values.role === "admin" ? "admin" : (await users.countDocuments()) === 0 ? "owner" : (values.role ?? "admin");
    await users.insertOne({ _id: new ObjectId(), email, name, passwordHash, role, createdAt: now, updatedAt: now });
    console.log(`\n  ✔ Created ${role} ${name} <${email}>. Sign in at /admin/login\n`);
  }
} finally {
  await client.close();
}
