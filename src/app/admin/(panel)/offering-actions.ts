"use server";

// Shared by the Services and Products sections. `kind` arrives from the
// client as a bound argument, so it is validated like any other input.

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { offeringLabels } from "@/components/admin/offering-labels";
import type { OfferingKind } from "@/content/types";
import { fieldErrors, type FormState, formString } from "@/lib/form-state";
import { requireUser } from "@/lib/server/auth";
import {
  createOffering,
  deleteOffering,
  moveOffering,
  offeringTag,
  setOfferingInNav,
  setOfferingVisibility,
  updateOffering,
} from "@/lib/server/data/offerings";
import { deleteImage, isFilePresent, storeImage, UploadError } from "@/lib/server/media";
import type { StoredImage } from "@/lib/server/models";
import { normalizeUrl, optionalHttpUrl } from "@/lib/server/validation";

const kindSchema = z.enum(["service", "product"]);

const schema = z.object({
  name: z.string().min(1, "Enter a name.").max(60, "Keep the name under 60 characters."),
  tagline: z.string().min(1, "Enter a tagline.").max(90, "Keep the tagline under 90 characters."),
  description: z
    .string()
    .min(1, "Enter a short description.")
    .max(240, "Keep the description under 240 characters."),
  url: optionalHttpUrl("Enter a valid web address, like https://studio.enfinito.com"),
  visible: z.boolean(),
  inNav: z.boolean(),
});

function parseKind(kind: unknown): OfferingKind {
  return kindSchema.parse(kind);
}

function refresh(kind: OfferingKind) {
  updateTag(offeringTag(kind)); // home section and its public page
  revalidatePath("/admin", "layout");
}

/** Create (id = null) or update a service or product. */
export async function saveOffering(
  kindInput: OfferingKind,
  id: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();
  const kind = parseKind(kindInput);
  const parsed = schema.safeParse({
    name: formString(formData, "name"),
    tagline: formString(formData, "tagline"),
    description: formString(formData, "description"),
    url: normalizeUrl(formString(formData, "url")),
    visible: formData.get("visible") === "on",
    inNav: formData.get("inNav") === "on",
  });
  const file = formData.get("image");
  const errors = parsed.success ? {} : fieldErrors(parsed.error);
  if (!id && !isFilePresent(file)) errors.image = "Upload a banner image.";
  if (!parsed.success || Object.keys(errors).length) return { errors };

  let image: StoredImage | undefined;
  if (isFilePresent(file)) {
    try {
      image = await storeImage(file, "cover");
    } catch (err) {
      if (err instanceof UploadError) return { errors: { image: err.message } };
      throw err;
    }
  }

  if (id) {
    if (!(await updateOffering(kind, id, parsed.data, image))) {
      await deleteImage(image?.fileId);
      return { message: `This ${offeringLabels[kind].singular} no longer exists.` };
    }
  } else {
    await createOffering(kind, parsed.data, image!);
  }

  refresh(kind);
  redirect(`${offeringLabels[kind].path}?saved=${encodeURIComponent(parsed.data.name)}`);
}

export async function moveOfferingAction(kindInput: OfferingKind, id: string, direction: -1 | 1): Promise<void> {
  await requireUser();
  const kind = parseKind(kindInput);
  await moveOffering(kind, id, direction === -1 ? -1 : 1);
  refresh(kind);
}

export async function toggleOfferingAction(kindInput: OfferingKind, id: string, visible: boolean): Promise<void> {
  await requireUser();
  const kind = parseKind(kindInput);
  await setOfferingVisibility(kind, id, visible === true);
  refresh(kind);
}

export async function toggleOfferingNavAction(kindInput: OfferingKind, id: string, inNav: boolean): Promise<void> {
  await requireUser();
  const kind = parseKind(kindInput);
  await setOfferingInNav(kind, id, inNav === true);
  refresh(kind);
}

export async function deleteOfferingAction(kindInput: OfferingKind, id: string, redirectToList = false): Promise<void> {
  await requireUser();
  const kind = parseKind(kindInput);
  await deleteOffering(kind, id);
  refresh(kind);
  if (redirectToList) redirect(offeringLabels[kind].path);
}
