"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { fieldErrors, type FormState, formString } from "@/lib/form-state";
import { requireUser } from "@/lib/server/auth";
import { ABOUT_TAG, saveAbout } from "@/lib/server/data/about";
import { isFilePresent, storeImage, UploadError } from "@/lib/server/media";
import type { StoredImage } from "@/lib/server/models";

const schema = z.object({
  statement: z.string().min(1, "Enter the statement.").max(320, "Keep the statement under 320 characters."),
  summary: z.string().max(400, "Keep the summary under 400 characters."),
  intro: z.string().max(400, "Keep the introduction under 400 characters."),
  storyTitle: z.string().min(1, "Enter a title for the story.").max(60, "Keep the title under 60 characters."),
  story: z.string().max(4000, "Keep the story under 4,000 characters."),
  valuesTitle: z.string().min(1, "Enter a title for the values.").max(60, "Keep the title under 60 characters."),
  values: z
    .array(
      z.object({
        title: z.string().min(1, "Enter a title.").max(60, "Keep the title under 60 characters."),
        text: z.string().min(1, "Describe it in a sentence or two.").max(300, "Keep it under 300 characters."),
      }),
    )
    .max(8, "You can add up to 8 values."),
  stats: z
    .array(
      z.object({
        value: z.string().min(1, "Enter the figure.").max(12, "Keep it short, like 120+ or 98%."),
        label: z.string().min(1, "Enter what it counts.").max(60, "Keep the label under 60 characters."),
      }),
    )
    .max(4, "You can add up to 4 figures."),
});

/** Multi-line text with consistent line endings. */
const text = (data: FormData, name: string) => formString(data, name).replace(/\r\n/g, "\n");

/** The i-th value of each of a group of repeated fields. */
const column = (data: FormData, name: string) => data.getAll(name).map((v) => String(v).trim());

export async function saveAboutAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const valueTitles = column(formData, "valueTitle");
  const valueTexts = column(formData, "valueText");
  const statValues = column(formData, "statValue");
  const statLabels = column(formData, "statLabel");

  const parsed = schema.safeParse({
    statement: text(formData, "statement"),
    summary: text(formData, "summary"),
    intro: text(formData, "intro"),
    storyTitle: formString(formData, "storyTitle"),
    story: text(formData, "story"),
    valuesTitle: formString(formData, "valuesTitle"),
    // Rows left entirely blank are ignored rather than rejected.
    values: valueTitles
      .map((title, i) => ({ title, text: (valueTexts[i] ?? "").replace(/\r\n/g, "\n") }))
      .filter((v) => v.title || v.text),
    stats: statValues.map((value, i) => ({ value, label: statLabels[i] ?? "" })).filter((s) => s.value || s.label),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };

  // Only stored once everything else is valid, so a failed save leaves no
  // stray file behind.
  let image: StoredImage | null | undefined;
  const file = formData.get("image");
  if (isFilePresent(file)) {
    try {
      image = await storeImage(file, "cover");
    } catch (err) {
      if (err instanceof UploadError) return { errors: { image: err.message }, message: "Please fix the highlighted fields." };
      throw err;
    }
  } else if (formData.get("imageRemove") === "on") {
    image = null;
  }

  await saveAbout(parsed.data, image);
  updateTag(ABOUT_TAG); // home section and About page
  revalidatePath("/admin/about");
  return { ok: true, message: "About page updated." };
}
