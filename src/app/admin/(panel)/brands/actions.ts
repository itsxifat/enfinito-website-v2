"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fieldErrors, type FormState, formString } from "@/lib/form-state";
import { requireUser } from "@/lib/server/auth";
import {
  BRANDS_TAG,
  createBrand,
  deleteBrand,
  moveBrand,
  setBrandVisibility,
  updateBrand,
} from "@/lib/server/data/brands";
import { deleteImage, isFilePresent, storeImage, UploadError } from "@/lib/server/media";
import type { StoredImage } from "@/lib/server/models";
import { normalizeUrl, optionalHttpUrl } from "@/lib/server/validation";

const schema = z.object({
  name: z.string().min(1, "Enter the brand's name.").max(80, "Keep the name under 80 characters."),
  url: optionalHttpUrl("Enter a valid web address, like https://brand.com"),
  visible: z.boolean(),
});

function refresh() {
  updateTag(BRANDS_TAG); // home page strip
  revalidatePath("/admin", "layout");
}

/** Create (id = null) or update a brand. */
export async function saveBrand(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = schema.safeParse({
    name: formString(formData, "name"),
    url: normalizeUrl(formString(formData, "url")),
    visible: formData.get("visible") === "on",
  });
  const file = formData.get("logo");
  const errors = parsed.success ? {} : fieldErrors(parsed.error);
  if (!id && !isFilePresent(file)) errors.logo = "Upload the brand's logo.";
  if (!parsed.success || Object.keys(errors).length) return { errors };

  let logo: StoredImage | undefined;
  if (isFilePresent(file)) {
    try {
      logo = await storeImage(file, "logo");
    } catch (err) {
      if (err instanceof UploadError) return { errors: { logo: err.message } };
      throw err;
    }
  }

  if (id) {
    if (!(await updateBrand(id, parsed.data, logo))) {
      await deleteImage(logo?.fileId);
      return { message: "This brand no longer exists." };
    }
  } else {
    await createBrand(parsed.data, logo!);
  }

  refresh();
  redirect(`/admin/brands?saved=${encodeURIComponent(parsed.data.name)}`);
}

export async function moveBrandAction(id: string, direction: -1 | 1): Promise<void> {
  await requireUser();
  await moveBrand(id, direction === -1 ? -1 : 1);
  refresh();
}

export async function toggleBrandAction(id: string, visible: boolean): Promise<void> {
  await requireUser();
  await setBrandVisibility(id, visible);
  refresh();
}

export async function deleteBrandAction(id: string, redirectToList = false): Promise<void> {
  await requireUser();
  await deleteBrand(id);
  refresh();
  if (redirectToList) redirect("/admin/brands");
}
