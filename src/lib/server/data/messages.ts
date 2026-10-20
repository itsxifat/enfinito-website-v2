import "server-only";
import { ObjectId } from "mongodb";
import { collections } from "../db";
import type { DeliveryStatus, MessageDoc, MessageStatus } from "../models";
import { toObjectId } from "./ids";

export type AdminMessage = {
  id: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  message: string;
  status: MessageStatus;
  createdAt: Date;
  confirmation: { status: DeliveryStatus | "pending"; error?: string };
};

const toAdmin = (d: MessageDoc): AdminMessage => ({
  id: d._id.toHexString(),
  fullName: d.fullName,
  businessName: d.businessName,
  email: d.email,
  phone: d.phone,
  message: d.message,
  status: d.status,
  createdAt: d.createdAt,
  confirmation: d.confirmation
    ? { status: d.confirmation.status, ...(d.confirmation.error ? { error: d.confirmation.error } : {}) }
    : { status: "pending" },
});

export type NewMessage = Pick<MessageDoc, "fullName" | "businessName" | "email" | "phone" | "message"> & {
  ip: string;
  userAgent: string;
};

export async function createMessage(input: NewMessage): Promise<ObjectId> {
  const { messages } = await collections();
  const _id = new ObjectId();
  // `confirmation` is filled in once the email has been attempted.
  await messages.insertOne({ _id, ...input, status: "new", createdAt: new Date() } as MessageDoc);
  return _id;
}

export async function recordConfirmation(
  _id: ObjectId,
  confirmation: { status: DeliveryStatus; error?: string },
): Promise<void> {
  const { messages } = await collections();
  await messages.updateOne({ _id }, { $set: { confirmation: { ...confirmation, at: new Date() } } });
}

export type MessageFilter = "inbox" | "new" | "archived";

const FILTERS: Record<MessageFilter, object> = {
  inbox: { status: { $ne: "archived" } },
  new: { status: "new" },
  archived: { status: "archived" },
};

export const PAGE_SIZE = 25;

export async function listMessages(
  filter: MessageFilter,
  page: number,
): Promise<{ items: AdminMessage[]; total: number }> {
  const { messages } = await collections();
  const query = FILTERS[filter];
  const [docs, total] = await Promise.all([
    messages
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray(),
    messages.countDocuments(query),
  ]);
  return { items: docs.map(toAdmin), total };
}

export async function recentMessages(limit: number): Promise<AdminMessage[]> {
  const { messages } = await collections();
  return (await messages.find({ status: { $ne: "archived" } }).sort({ createdAt: -1 }).limit(limit).toArray()).map(toAdmin);
}

export async function messageCounts(): Promise<Record<MessageFilter, number>> {
  const { messages } = await collections();
  const [inbox, unread, archived] = await Promise.all([
    messages.countDocuments(FILTERS.inbox),
    messages.countDocuments(FILTERS.new),
    messages.countDocuments(FILTERS.archived),
  ]);
  return { inbox, new: unread, archived };
}

export async function countNewMessages(): Promise<number> {
  const { messages } = await collections();
  return messages.countDocuments({ status: "new" });
}

export async function getMessage(id: string): Promise<AdminMessage | null> {
  const _id = toObjectId(id);
  if (!_id) return null;
  const { messages } = await collections();
  const doc = await messages.findOne({ _id });
  return doc ? toAdmin(doc) : null;
}

export async function setMessageStatus(id: string, status: MessageStatus): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;
  const { messages } = await collections();
  await messages.updateOne(
    { _id },
    status === "new" ? { $set: { status }, $unset: { readAt: "" } } : { $set: { status, readAt: new Date() } },
  );
}

/** Marks a new message as read (opening it in the admin panel). */
export async function markRead(id: string): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;
  const { messages } = await collections();
  await messages.updateOne({ _id, status: "new" }, { $set: { status: "read", readAt: new Date() } });
}

export async function deleteMessage(id: string): Promise<void> {
  const _id = toObjectId(id);
  if (!_id) return;
  const { messages } = await collections();
  await messages.deleteOne({ _id });
}
