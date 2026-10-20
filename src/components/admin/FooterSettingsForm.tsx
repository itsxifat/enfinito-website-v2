"use client";

import { ArrowUpRight, Link2, Plus } from "lucide-react";
import type { FooterContent, SocialLink } from "@/content/types";
import type { FormState } from "@/lib/form-state";
import { RowItem, RowList, useRows } from "./RepeatableRows";
import { Button, ButtonLink } from "./ui/Button";
import { Field, FormActions, FormGrid, FormMessage, TextArea, TextInput } from "./ui/Form";
import { Card, EmptyState } from "./ui/Layout";
import { SubmitButton } from "./ui/SubmitButton";
import { useActionForm } from "./ui/useActionForm";
import styles from "./SettingsForm.module.css";

const MAX_SOCIALS = 8;
const SOCIAL_SUGGESTIONS = ["LinkedIn", "Instagram", "Facebook", "X", "YouTube", "TikTok", "Behance", "Dribbble"];

export function FooterSettingsForm({
  action,
  initial,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  initial: FooterContent;
}) {
  const { state, pending, onSubmit } = useActionForm(action);
  const errors = state.errors ?? {};
  const socials = useRows<SocialLink>(initial.socials);

  return (
    <form onSubmit={onSubmit} noValidate className={styles.form}>
      {state.message ? <FormMessage ok={state.ok}>{state.message}</FormMessage> : null}

      <Card title="Call to action" description="The large line at the top of the footer. Its button opens the Contact page.">
        <FormGrid>
          <Field label="Heading" htmlFor="footer-cta-title" error={errors.ctaTitle} className="span-2">
            <TextInput
              id="footer-cta-title"
              name="ctaTitle"
              defaultValue={initial.ctaTitle}
              maxLength={80}
              error={errors.ctaTitle}
            />
          </Field>
          <Field label="Button label" htmlFor="footer-cta-label" error={errors.ctaLabel}>
            <TextInput
              id="footer-cta-label"
              name="ctaLabel"
              defaultValue={initial.ctaLabel}
              maxLength={30}
              error={errors.ctaLabel}
            />
          </Field>
        </FormGrid>
      </Card>

      <Card title="Brand" description="A line about Enfinito under the logo.">
        <Field label="Tagline" htmlFor="footer-tagline" optional error={errors.tagline}>
          <TextArea id="footer-tagline" name="tagline" defaultValue={initial.tagline} rows={2} maxLength={200} error={errors.tagline} />
        </Field>
      </Card>

      <Card
        title="Social links"
        description="Shown under the tagline, in this order."
        actions={
          <Button size="sm" onClick={() => socials.add({ label: "", url: "" })} disabled={socials.rows.length >= MAX_SOCIALS}>
            <Plus size={15} aria-hidden="true" /> Add link
          </Button>
        }
        flush
      >
        <datalist id="social-suggestions">
          {SOCIAL_SUGGESTIONS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        {socials.rows.length ? (
          <RowList>
            {socials.rows.map((row, i) => (
              <RowItem
                key={row.key}
                title={`Link ${i + 1}`}
                noun="link"
                index={i}
                count={socials.rows.length}
                onMove={(by) => socials.move(i, by)}
                onRemove={() => socials.remove(row.key)}
              >
                <FormGrid>
                  <Field label="Name" htmlFor={`social-label-${row.key}`} error={errors[`socials.${i}.label`]}>
                    <TextInput
                      id={`social-label-${row.key}`}
                      name="socialLabel"
                      list="social-suggestions"
                      placeholder="LinkedIn"
                      value={row.label}
                      maxLength={30}
                      onChange={(e) => socials.update(row.key, { label: e.target.value })}
                      error={errors[`socials.${i}.label`]}
                      autoComplete="off"
                    />
                  </Field>
                  <Field label="Link" htmlFor={`social-url-${row.key}`} error={errors[`socials.${i}.url`]}>
                    <TextInput
                      id={`social-url-${row.key}`}
                      name="socialUrl"
                      type="url"
                      inputMode="url"
                      placeholder="https://linkedin.com/company/…"
                      value={row.url}
                      onChange={(e) => socials.update(row.key, { url: e.target.value })}
                      error={errors[`socials.${i}.url`]}
                      autoComplete="off"
                    />
                  </Field>
                </FormGrid>
              </RowItem>
            ))}
          </RowList>
        ) : (
          <EmptyState icon={<Link2 size={22} strokeWidth={1.75} />} title="No social links">
            Add your LinkedIn, Instagram or other profiles.
          </EmptyState>
        )}
      </Card>

      <Card title="Small print" description="Shown beside the copyright line, for example a company registration number.">
        <Field label="Text" htmlFor="footer-note" optional error={errors.note}>
          <TextInput id="footer-note" name="note" defaultValue={initial.note} maxLength={200} error={errors.note} />
        </Field>
      </Card>

      <div className={styles.footer}>
        <a href="/" target="_blank" rel="noopener noreferrer" className={styles.view}>
          View website <ArrowUpRight size={15} aria-hidden="true" />
        </a>
        <FormActions>
          <ButtonLink href="/admin" variant="ghost">
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
