"use client";

import { useState } from "react";
import { NewsCard } from "@/components/news/NewsCard";
import type { ImageAsset } from "@/content/types";
import type { FormState } from "@/lib/form-state";
import { ButtonLink } from "./ui/Button";
import { Field, FormActions, FormMessage, TextArea, TextInput, Toggle } from "./ui/Form";
import { ImageInput, type ImagePreview } from "./ui/ImageInput";
import { Card, SplitLayout } from "./ui/Layout";
import { SubmitButton } from "./ui/SubmitButton";
import { useActionForm } from "./ui/useActionForm";
import styles from "./NewsForm.module.css";

type Article = {
  title: string;
  subtitle: string;
  url: string;
  publishedAt: Date;
  visible: boolean;
  image: ImageAsset;
};

export function NewsForm({
  action,
  article,
  today,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  article?: Article;
  /** YYYY-MM-DD, computed on the server. */
  today: string;
}) {
  const { state, pending, onSubmit } = useActionForm(action);
  const errors = state.errors ?? {};
  const [title, setTitle] = useState(article?.title ?? "");
  const [subtitle, setSubtitle] = useState(article?.subtitle ?? "");
  const [date, setDate] = useState(article ? article.publishedAt.toISOString().slice(0, 10) : today);
  const [image, setImage] = useState<ImagePreview | null>(article ? { ...article.image } : null);

  const previewDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : new Date(`${today}T00:00:00Z`);

  return (
    <form onSubmit={onSubmit} noValidate>
      <SplitLayout
        main={
          <Card title="Article">
            <div className={styles.fields}>
              {state.message ? <FormMessage ok={state.ok}>{state.message}</FormMessage> : null}
              <Field label="Cover image" htmlFor="news-image">
                <ImageInput
                  id="news-image"
                  name="image"
                  variant="cover"
                  current={article?.image}
                  maxBytes={8 * 1024 * 1024}
                  error={errors.image}
                  onPreviewChange={setImage}
                />
              </Field>
              <Field label="Headline" htmlFor="news-title" error={errors.title}>
                <TextInput
                  id="news-title"
                  name="title"
                  defaultValue={article?.title}
                  maxLength={140}
                  error={errors.title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoComplete="off"
                />
              </Field>
              <Field label="Sub-headline" htmlFor="news-subtitle" error={errors.subtitle} hint="One or two sentences that sum up the article.">
                <TextArea
                  id="news-subtitle"
                  name="subtitle"
                  defaultValue={article?.subtitle}
                  maxLength={280}
                  rows={3}
                  error={errors.subtitle}
                  hasHint
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </Field>
              <div className={styles.row}>
                <Field label="Article link" htmlFor="news-url" error={errors.url} hint="The full article on the blog. Opens in a new tab.">
                  <TextInput
                    id="news-url"
                    name="url"
                    type="url"
                    inputMode="url"
                    placeholder="https://blog.enfinito.com/…"
                    defaultValue={article?.url}
                    error={errors.url}
                    hasHint
                    autoComplete="off"
                  />
                </Field>
                <Field label="Publish date" htmlFor="news-date" error={errors.publishedAt}>
                  <TextInput
                    id="news-date"
                    name="publishedAt"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    error={errors.publishedAt}
                  />
                </Field>
              </div>
              <Toggle
                id="news-visible"
                name="visible"
                label="Published"
                description="Unpublished articles are saved here but hidden from the News page."
                defaultChecked={article?.visible ?? true}
              />
            </div>
          </Card>
        }
        aside={
          <>
            <Card title="Preview" description="As it appears on the News page.">
              <div className={styles.preview}>
                <NewsCard
                  preview
                  item={{
                    title,
                    subtitle,
                    url: "#",
                    publishedAt: previewDate,
                    image: image ?? { src: "", width: 1600, height: 1000 },
                  }}
                />
              </div>
            </Card>
            <FormActions>
              <ButtonLink href="/admin/news" variant="ghost">
                Cancel
              </ButtonLink>
              <SubmitButton pending={pending} pendingLabel="Saving…">
                {article ? "Save changes" : "Publish article"}
              </SubmitButton>
            </FormActions>
          </>
        }
      />
    </form>
  );
}
