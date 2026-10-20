import "server-only";
import { ObjectId } from "mongodb";
import { collections } from "../db";
import type { Role, UserDoc } from "../models";
import { hashPassword } from "../password";
import { toObjectId } from "./ids";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  lastLoginAt?: Date;
};

const toMember = (u: UserDoc): TeamMember => ({
  id: u._id.toHexString(),
  name: u.name,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt,
  ...(u.lastLoginAt ? { lastLoginAt: u.lastLoginAt } : {}),
});

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  const { users } = await collections();
  return users.findOne({ email: normalizeEmail(email) });
}

export async function findUserById(id: ObjectId): Promise<UserDoc | null> {
  const { users } = await collections();
  return users.findOne({ _id: id });
}

export async function listTeam(): Promise<TeamMember[]> {
  const { users } = await collections();
  return (await users.find().sort({ createdAt: 1 }).toArray()).map(toMember);
}

export class DuplicateEmailError extends Error {}

export async function createUser(input: { name: string; email: string; password: string; role: Role }): Promise<string> {
  const { users } = await collections();
  const now = new Date();
  const _id = new ObjectId();
  try {
    await users.insertOne({
      _id,
      name: input.name,
      email: normalizeEmail(input.email),
      passwordHash: await hashPassword(input.password),
      role: input.role,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) throw new DuplicateEmailError();
    throw err;
  }
  return _id.toHexString();
}

/** Removes a user and signs them out everywhere. */
export async function deleteUser(id: string): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;
  const { users, sessions } = await collections();
  await users.deleteOne({ _id });
  await sessions.deleteMany({ userId: _id });
}

export async function updateUserName(id: ObjectId, name: string): Promise<void> {
  const { users } = await collections();
  await users.updateOne({ _id: id }, { $set: { name, updatedAt: new Date() } });
}

export async function updateUserPassword(id: ObjectId, password: string): Promise<void> {
  const { users } = await collections();
  await users.updateOne({ _id: id }, { $set: { passwordHash: await hashPassword(password), updatedAt: new Date() } });
}

export async function recordLogin(id: ObjectId): Promise<void> {
  const { users } = await collections();
  await users.updateOne({ _id: id }, { $set: { lastLoginAt: new Date() } });
}
