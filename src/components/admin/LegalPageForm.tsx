"use client";

import { useState } from "react";
import { parseRichText, RichText } from "@/components/legal/RichText";
import type { LegalPage } from "@/content/types";
import type { FormState } from "@/lib/form-state";
import { ButtonLink } from "./ui/Button";
import { Field, FormActions, FormMessage, TextArea, TextInput } from "./ui/Form";
import { Card } from "./ui/Layout";
import { SubmitButton } from "./ui/SubmitButton";
import { useActionForm } from "./ui/useActionForm";
import styles from "./SettingsForm.module.css";

export function LegalPageForm({
  action,
  page,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  page: LegalPage;
}) {
  const { state, pending, onSubmit } = useActionForm(action);
  const errors = state.errors ?? {};
  const [body, setBody] = useState(page.body);

  return (
    <form onSubmit={onSubmit} noValidate className={styles.form}>
      {state.message ? <FormMessage ok={state.ok}>{state.message}</FormMessage> : null}

      <Card title="Content">
        <div className={styles.stack}>
          <Field label="Title" htmlFor="legal-title" error={errors.title}>
            <TextInput id="legal-title" name="title" defaultValue={page.title} maxLength={80} error={errors.title} />
          </Field>
          <Field
            label="Text"
            htmlFor="legal-body"
            error={errors.body}
            hint={
              <>
                Start a line with <code>## </code> for a heading or <code>- </code> for a list item. Use <code>**bold**</code>{" "}
                and <code>[link text](/contact)</code>. Leave a blank line between paragraphs.
              </>
            }
          >
            <TextArea
              id="legal-body"
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={22}
              maxLength={40000}
              error={errors.body}
              hasHint
              className={styles.code}
            />
          </Field>
        </div>
      </Card>

      <Card title="Preview" description="How the text reads on the website.">
        <RichText blocks={parseRichText(body)} />
      </Card>

      <div className={styles.footer}>
        <span />
        <FormActions>
          <ButtonLink href="/admin/legal" variant="ghost">
            Cancel
          </ButtonLink>
          <SubmitButton pending={pending} pendingLabel="Saving…">
            Save changes
          </SubmitButton>
        </FormActions>
      </div>
    </form>
  );
}
