"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { fieldErrors, type FormState, formString } from "@/lib/form-state";
import { requireUser } from "@/lib/server/auth";
import { FOOTER_TAG, saveFooter } from "@/lib/server/data/footer";
import { httpUrl, normalizeUrl } from "@/lib/server/validation";

const schema = z.object({
  ctaTitle: z.string().min(1, "Enter a heading.").max(80, "Keep the heading under 80 characters."),
  ctaLabel: z.string().min(1, "Enter the button's label.").max(30, "Keep the label under 30 characters."),
  tagline: z.string().max(200, "Keep the tagline under 200 characters."),
  socials: z
    .array(
      z.object({
        label: z.string().min(1, "Enter a name, like LinkedIn.").max(30, "Keep the name under 30 characters."),
        url: httpUrl("Enter the full address, like https://linkedin.com/company/enfinito"),
      }),
    )
    .max(8, "You can add up to 8 links."),
  note: z.string().max(200, "Keep the small print under 200 characters."),
});

export async function saveFooterAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const labels = formData.getAll("socialLabel").map((v) => String(v).trim());
  const urls = formData.getAll("socialUrl").map((v) => String(v).trim());

  const parsed = schema.safeParse({
    ctaTitle: formString(formData, "ctaTitle"),
    ctaLabel: formString(formData, "ctaLabel"),
    tagline: formString(formData, "tagline"),
    // Rows left entirely blank are ignored rather than rejected.
    socials: labels
      .map((label, i) => ({ label, url: normalizeUrl(urls[i] ?? "") }))
      .filter((s) => s.label || s.url),
    note: formString(formData, "note"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };

  await saveFooter(parsed.data);
  updateTag(FOOTER_TAG);
  return { ok: true, message: "Footer updated." };
}
