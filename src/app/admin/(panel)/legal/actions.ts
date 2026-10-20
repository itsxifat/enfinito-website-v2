"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import type { LegalSlug } from "@/content/types";
import { fieldErrors, type FormState, formString } from "@/lib/form-state";
import { requireUser } from "@/lib/server/auth";
import { LEGAL_TAG, saveLegalPage } from "@/lib/server/data/legal";

const schema = z.object({
  // Bound from the client, so checked like any other input.
  slug: z.enum(["terms", "refunds", "privacy", "delivery"]),
  title: z.string().min(1, "Enter a title.").max(80, "Keep the title under 80 characters."),
  body: z.string().min(1, "Enter the page's text.").max(40000, "That text is too long."),
});

export async function saveLegalAction(slug: LegalSlug, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = schema.safeParse({
    slug,
    title: formString(formData, "title"),
    body: formString(formData, "body").replace(/\r\n/g, "\n"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };

  await saveLegalPage(parsed.data.slug, { title: parsed.data.title, body: parsed.data.body });
  updateTag(LEGAL_TAG);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Saved. The page on the website is updated." };
}
