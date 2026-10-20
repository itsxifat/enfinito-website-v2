"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/auth";
import { deleteMessage, setMessageStatus } from "@/lib/server/data/messages";
import type { MessageStatus } from "@/lib/server/models";

const STATUSES: MessageStatus[] = ["new", "read", "archived"];

export async function updateMessageStatus(id: string, status: MessageStatus): Promise<void> {
  await requireUser();
  if (!STATUSES.includes(status)) return;
  await setMessageStatus(id, status);
  // Refresh the whole admin area so the sidebar's unread count updates too.
  revalidatePath("/admin", "layout");
}

export async function removeMessage(id: string): Promise<void> {
  await requireUser();
  await deleteMessage(id);
  revalidatePath("/admin", "layout");
  redirect("/admin/messages");
}
