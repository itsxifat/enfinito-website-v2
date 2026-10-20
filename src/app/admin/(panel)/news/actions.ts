"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fieldErrors, type FormState, formString } from "@/lib/form-state";
import { requireUser } from "@/lib/server/auth";
import { createNews, deleteNews, NEWS_TAG, setNewsVisibility, updateNews } from "@/lib/server/data/news";
import { deleteImage, isFilePresent, storeImage, UploadError } from "@/lib/server/media";
import type { StoredImage } from "@/lib/server/models";
import { httpUrl, normalizeUrl } from "@/lib/server/validation";

const schema = z.object({
  title: z.string().min(1, "Enter a headline.").max(140, "Keep the headline under 140 characters."),
  subtitle: z.string().min(1, "Enter a sub-headline.").max(280, "Keep the sub-headline under 280 characters."),
  url: httpUrl("Enter the full address of the article, like https://blog.enfinito.com/post"),
  publishedAt: z.iso.date("Choose a publish date.").transform((d) => new Date(`${d}T00:00:00.000Z`)),
  visible: z.boolean(),
});

function refresh() {
  updateTag(NEWS_TAG); // public News page
  revalidatePath("/admin", "layout");
}

/** Create (id = null) or update an article. */
export async function saveNews(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = schema.safeParse({
    title: formString(formData, "title"),
    subtitle: formString(formData, "subtitle"),
    url: normalizeUrl(formString(formData, "url")),
    publishedAt: formString(formData, "publishedAt"),
    visible: formData.get("visible") === "on",
  });
  const file = formData.get("image");
  const errors = parsed.success ? {} : fieldErrors(parsed.error);
  if (!id && !isFilePresent(file)) errors.image = "Upload a cover image.";
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
    if (!(await updateNews(id, parsed.data, image))) {
      await deleteImage(image?.fileId);
      return { message: "This article no longer exists." };
    }
  } else {
    await createNews(parsed.data, image!);
  }

  refresh();
  redirect("/admin/news?saved=1");
}

export async function toggleNewsAction(id: string, visible: boolean): Promise<void> {
  await requireUser();
  await setNewsVisibility(id, visible);
  refresh();
}

export async function deleteNewsAction(id: string, redirectToList = false): Promise<void> {
  await requireUser();
  await deleteNews(id);
  refresh();
  if (redirectToList) redirect("/admin/news");
}
