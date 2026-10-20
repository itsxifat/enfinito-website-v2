"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { fieldErrors, type FormState, formString } from "@/lib/form-state";
import { requireUser } from "@/lib/server/auth";
import { CONTACT_TAG, saveContactSettings } from "@/lib/server/data/settings";
import { normalizeUrl, optionalHttpUrl } from "@/lib/server/validation";

const schema = z.object({
  heading: z.string().min(1, "Enter a heading for the page.").max(80, "Keep the heading under 80 characters."),
  intro: z.string().max(400, "Keep the introduction under 400 characters."),
  email: z.union([z.literal(""), z.email("Enter a valid email address.").max(200)]),
  phone: z.string().max(40, "That phone number is too long."),
  hours: z.string().max(120, "Keep the hours under 120 characters."),
  tradeLicense: z.string().max(60, "Keep the trade license number under 60 characters."),
  addresses: z
    .array(
      z.object({
        label: z.string().max(60, "Keep the label under 60 characters."),
        lines: z.string().min(1, "Enter the address.").max(300, "That address is too long."),
        postalCode: z.string().min(1, "Enter the postal code.").max(12, "That postal code is too long."),
        mapUrl: optionalHttpUrl("Enter a valid map link, like https://maps.google.com/…"),
      }),
    )
    .max(10, "You can add up to 10 addresses."),
});

export async function saveContact(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const labels = formData.getAll("addressLabel").map(String);
  const lines = formData.getAll("addressLines").map(String);
  const maps = formData.getAll("addressMap").map(String);
  const postalCodes = formData.getAll("addressPostal").map(String);

  const addresses = labels
    .map((label, i) => ({
      label: label.trim(),
      lines: (lines[i] ?? "").trim().replace(/\r\n/g, "\n"),
      postalCode: (postalCodes[i] ?? "").trim(),
      mapUrl: normalizeUrl(maps[i] ?? ""),
    }))
    // Blank rows are ignored rather than rejected.
    .filter((a) => a.label || a.lines || a.postalCode || a.mapUrl);

  const parsed = schema.safeParse({
    heading: formString(formData, "heading"),
    intro: formString(formData, "intro"),
    email: formString(formData, "email").toLowerCase(),
    phone: formString(formData, "phone"),
    hours: formString(formData, "hours"),
    tradeLicense: formString(formData, "tradeLicense"),
    addresses,
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Please fix the highlighted fields." };

  await saveContactSettings({
    ...parsed.data,
    addresses: parsed.data.addresses.map((a) => ({
      label: a.label,
      lines: a.lines,
      postalCode: a.postalCode,
      ...(a.mapUrl ? { mapUrl: a.mapUrl } : {}),
    })),
  });
  updateTag(CONTACT_TAG);
  return { ok: true, message: "Contact page updated." };
}
