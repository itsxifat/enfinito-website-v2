"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fieldErrors, type FormState, formString } from "@/lib/form-state";
import { requireUser } from "@/lib/server/auth";
import { createUser, DuplicateEmailError, deleteUser, listTeam } from "@/lib/server/data/users";
import { MIN_PASSWORD_LENGTH } from "@/lib/server/password";

const schema = z.object({
  name: z.string().min(1, "Enter their name.").max(80),
  email: z.email("Enter a valid email address.").max(200),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
    .max(200, "That password is too long."),
});

export async function addTeamMember(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (user.role !== "owner") return { message: "Only the owner can add team members." };

  const parsed = schema.safeParse({
    name: formString(formData, "name"),
    email: formString(formData, "email").toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  try {
    await createUser({ ...parsed.data, role: "admin" });
  } catch (err) {
    if (err instanceof DuplicateEmailError) return { errors: { email: "Someone with this email already has access." } };
    throw err;
  }
  revalidatePath("/admin/team");
  return { ok: true, message: `${parsed.data.name} can now sign in. Share the temporary password with them securely.` };
}

export async function removeTeamMember(id: string): Promise<void> {
  const user = await requireUser();
  if (user.role !== "owner" || id === user.id) return;
  const target = (await listTeam()).find((m) => m.id === id);
  if (!target || target.role === "owner") return;
  await deleteUser(id);
  revalidatePath("/admin/team");
}
