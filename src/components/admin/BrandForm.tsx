"use client";

import { useState } from "react";
import { logoSize } from "@/components/home/logo-size";
import type { ImageAsset } from "@/content/types";
import type { FormState } from "@/lib/form-state";
import { ButtonLink } from "./ui/Button";
import { Field, FormActions, FormMessage, TextInput, Toggle } from "./ui/Form";
import { ImageInput, type ImagePreview } from "./ui/ImageInput";
import { Card, SplitLayout } from "./ui/Layout";
import { SubmitButton } from "./ui/SubmitButton";
import { useActionForm } from "./ui/useActionForm";
import styles from "./BrandForm.module.css";

type Brand = { name: string; url: string; visible: boolean; logo: ImageAsset };

export function BrandForm({
  action,
  brand,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  brand?: Brand;
}) {
  const { state, pending, onSubmit } = useActionForm(action);
  const [preview, setPreview] = useState<ImagePreview | null>(brand ? { ...brand.logo } : null);
  const [name, setName] = useState(brand?.name ?? "");
  const errors = state.errors ?? {};
  const size = preview ? logoSize(preview) : null;

  return (
    <form onSubmit={onSubmit} noValidate>
      <SplitLayout
        main={
          <Card title="Brand details">
            <div className={styles.fields}>
              {state.message ? <FormMessage ok={state.ok}>{state.message}</FormMessage> : null}
              <Field label="Name" htmlFor="brand-name" error={errors.name} hint="Used as the logo's alt text for accessibility.">
                <TextInput
                  id="brand-name"
                  name="name"
                  defaultValue={brand?.name}
                  error={errors.name}
                  hasHint
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                />
              </Field>
              <Field
                label="Website"
                htmlFor="brand-url"
                optional
                error={errors.url}
                hint="If set, clicking the logo opens this site in a new tab."
              >
                <TextInput
                  id="brand-url"
                  name="url"
                  type="url"
                  inputMode="url"
                  placeholder="https://brand.com"
                  defaultValue={brand?.url}
                  error={errors.url}
                  hasHint
                  autoComplete="off"
                />
              </Field>
              <Field label="Logo" htmlFor="brand-logo" error={undefined}>
                <ImageInput
                  id="brand-logo"
                  name="logo"
                  variant="logo"
                  current={brand?.logo}
                  maxBytes={2 * 1024 * 1024}
                  error={errors.logo}
                  onPreviewChange={setPreview}
                />
              </Field>
              <Toggle
                id="brand-visible"
                name="visible"
                label="Show on the website"
                description="Hidden brands stay here but don't appear on the home page."
                defaultChecked={brand?.visible ?? true}
              />
            </div>
          </Card>
        }
        aside={
          <>
            <Card title="Preview" description="How the logo sits in the strip on the home page.">
              <div className={styles.strip}>
                {preview && size ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local preview
                  <img src={preview.src} alt={name} width={size.width} height={size.height} className={styles.logo} />
                ) : (
                  <span className={styles.empty}>Upload a logo to preview it</span>
                )}
              </div>
              <p className={styles.caption}>Shown muted in grey; full colour on hover. Hover the preview to see it.</p>
            </Card>
            <FormActions>
              <ButtonLink href="/admin/brands" variant="ghost">
                Cancel
              </ButtonLink>
              <SubmitButton pending={pending} pendingLabel="Saving…">
                {brand ? "Save changes" : "Add brand"}
              </SubmitButton>
            </FormActions>
          </>
        }
      />
    </form>
  );
}
