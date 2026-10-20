"use client";

import { useState } from "react";
import { ServicePreview } from "@/components/home/ServicesShowcase";
import { ProductTile } from "@/components/offerings/ProductTile";
import type { ImageAsset } from "@/content/types";
import type { FormState } from "@/lib/form-state";
import type { OfferingLabels } from "./offering-labels";
import { ButtonLink } from "./ui/Button";
import { Field, FormActions, FormMessage, TextArea, TextInput, Toggle } from "./ui/Form";
import { ImageInput, type ImagePreview } from "./ui/ImageInput";
import { Card, SplitLayout } from "./ui/Layout";
import { SubmitButton } from "./ui/SubmitButton";
import { useActionForm } from "./ui/useActionForm";
import styles from "./OfferingForm.module.css";

type Offering = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  visible: boolean;
  inNav: boolean;
  image: ImageAsset;
};

const DESCRIPTION_MAX = 240;

/** Prefixes https:// like the server does, so the preview shows the host. */
const previewUrl = (value: string) => {
  const v = value.trim();
  if (!v) return undefined;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

export function OfferingForm({
  action,
  labels,
  offering,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  labels: OfferingLabels;
  offering?: Offering;
}) {
  const { state, pending, onSubmit } = useActionForm(action);
  const errors = state.errors ?? {};
  const [name, setName] = useState(offering?.name ?? "");
  const [tagline, setTagline] = useState(offering?.tagline ?? "");
  const [description, setDescription] = useState(offering?.description ?? "");
  const [url, setUrl] = useState(offering?.url ?? "");
  const [image, setImage] = useState<ImagePreview | null>(offering ? { ...offering.image } : null);
  const { placeholders, singular } = labels;
  const previewItem = {
    name: name.trim(),
    tagline: tagline.trim(),
    description: description.trim(),
    url: previewUrl(url),
    image: image ?? { src: "", width: 1600, height: 1000 },
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <SplitLayout
        main={
          <Card title={`${singular[0]!.toUpperCase()}${singular.slice(1)} details`}>
            <div className={styles.fields}>
              {state.message ? <FormMessage ok={state.ok}>{state.message}</FormMessage> : null}
              <Field label="Banner image" htmlFor="offering-image">
                <ImageInput
                  id="offering-image"
                  name="image"
                  variant="cover"
                  current={offering?.image}
                  maxBytes={8 * 1024 * 1024}
                  error={errors.image}
                  onPreviewChange={setImage}
                />
              </Field>
              <Field label="Name" htmlFor="offering-name" error={errors.name}>
                <TextInput
                  id="offering-name"
                  name="name"
                  defaultValue={offering?.name}
                  placeholder={placeholders.name}
                  maxLength={60}
                  error={errors.name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                />
              </Field>
              <Field label="Tagline" htmlFor="offering-tagline" error={errors.tagline} hint="A short line under the name.">
                <TextInput
                  id="offering-tagline"
                  name="tagline"
                  defaultValue={offering?.tagline}
                  placeholder={placeholders.tagline}
                  maxLength={90}
                  error={errors.tagline}
                  hasHint
                  onChange={(e) => setTagline(e.target.value)}
                  autoComplete="off"
                />
              </Field>
              <Field
                label="Short description"
                htmlFor="offering-description"
                error={errors.description}
                hint={`One or two sentences on what it offers. ${description.length}/${DESCRIPTION_MAX}`}
              >
                <TextArea
                  id="offering-description"
                  name="description"
                  defaultValue={offering?.description}
                  placeholder={placeholders.description}
                  maxLength={DESCRIPTION_MAX}
                  rows={3}
                  error={errors.description}
                  hasHint
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
              <Field
                label="Website"
                htmlFor="offering-url"
                optional
                error={errors.url}
                hint="Where the card leads. Opens in a new tab. Leave empty if it doesn't have a site yet."
              >
                <TextInput
                  id="offering-url"
                  name="url"
                  type="url"
                  inputMode="url"
                  placeholder={placeholders.url}
                  defaultValue={offering?.url}
                  error={errors.url}
                  hasHint
                  onChange={(e) => setUrl(e.target.value)}
                  autoComplete="off"
                />
              </Field>
              <Toggle
                id="offering-visible"
                name="visible"
                label="Show on the website"
                description={`Hidden ${labels.plural} stay here but don't appear on the website.`}
                defaultChecked={offering?.visible ?? true}
              />
              <Toggle
                id="offering-nav"
                name="inNav"
                label="Show in the navbar menu"
                description={`Lists it in the ${labels.title} dropdown at the top of every page, while it's shown on the website.`}
                defaultChecked={offering?.inNav ?? true}
              />
            </div>
          </Card>
        }
        aside={
          <>
            <Card
              title="Preview"
              description={labels.kind === "service" ? "As it appears on the home page." : "As it appears on the Products page."}
            >
              <div className={styles.preview}>
                {labels.kind === "service" ? <ServicePreview item={previewItem} /> : <ProductTile item={previewItem} preview />}
              </div>
            </Card>
            <FormActions>
              <ButtonLink href={labels.path} variant="ghost">
                Cancel
              </ButtonLink>
              <SubmitButton pending={pending} pendingLabel="Saving…">
                {offering ? "Save changes" : `Add ${singular}`}
              </SubmitButton>
            </FormActions>
          </>
        }
      />
    </form>
  );
}
