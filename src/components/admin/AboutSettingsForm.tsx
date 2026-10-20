"use client";

import { ArrowUpRight, Hash, Plus, Sparkles } from "lucide-react";
import type { AboutContent, AboutStat, AboutValue } from "@/content/types";
import type { FormState } from "@/lib/form-state";
import { RowItem, RowList, useRows } from "./RepeatableRows";
import { Button, ButtonLink } from "./ui/Button";
import { Field, FormActions, FormGrid, FormMessage, TextArea, TextInput } from "./ui/Form";
import { ImageInput } from "./ui/ImageInput";
import { Card, EmptyState } from "./ui/Layout";
import { SubmitButton } from "./ui/SubmitButton";
import { useActionForm } from "./ui/useActionForm";
import styles from "./SettingsForm.module.css";

const MAX_VALUES = 8;
const MAX_STATS = 4;

export function AboutSettingsForm({
  action,
  initial,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  initial: AboutContent;
}) {
  const { state, pending, onSubmit } = useActionForm(action);
  const errors = state.errors ?? {};
  const values = useRows<AboutValue>(initial.values);
  const stats = useRows<AboutStat>(initial.stats);

  return (
    <form onSubmit={onSubmit} noValidate className={styles.form}>
      {state.message ? <FormMessage ok={state.ok}>{state.message}</FormMessage> : null}

      <Card title="Home page" description="The About section on the home page.">
        <div className={styles.stack}>
          <Field
            label="Statement"
            htmlFor="about-statement"
            error={errors.statement}
            hint="Shown large on the home page. Wrap words in *asterisks* to highlight them in blue."
          >
            <TextArea
              id="about-statement"
              name="statement"
              defaultValue={initial.statement}
              rows={3}
              maxLength={320}
              error={errors.statement}
              hasHint
            />
          </Field>
          <Field label="Summary" htmlFor="about-summary" optional error={errors.summary} hint="A sentence or two under the statement.">
            <TextArea
              id="about-summary"
              name="summary"
              defaultValue={initial.summary}
              rows={3}
              maxLength={400}
              error={errors.summary}
              hasHint
            />
          </Field>
        </div>
      </Card>

      <Card title="About page" description="The introduction, photo and story at the top of the About page.">
        <div className={styles.stack}>
          <Field label="Introduction" htmlFor="about-intro" optional error={errors.intro}>
            <TextArea id="about-intro" name="intro" defaultValue={initial.intro} rows={2} maxLength={400} error={errors.intro} />
          </Field>
          <Field
            label="Photo"
            htmlFor="about-image"
            optional
            hint="A wide photo of your team or workplace, shown under the introduction."
          >
            {/* Remounts after a save, so it shows the newly stored photo. */}
            <ImageInput
              key={initial.image?.src ?? "none"}
              id="about-image"
              name="image"
              variant="cover"
              current={initial.image}
              maxBytes={8 * 1024 * 1024}
              error={errors.image}
              removable
            />
          </Field>
          <Field label="Story title" htmlFor="about-story-title" error={errors.storyTitle}>
            <TextInput
              id="about-story-title"
              name="storyTitle"
              defaultValue={initial.storyTitle}
              maxLength={60}
              error={errors.storyTitle}
            />
          </Field>
          <Field label="Story" htmlFor="about-story" optional error={errors.story} hint="Leave a blank line between paragraphs.">
            <TextArea
              id="about-story"
              name="story"
              defaultValue={initial.story}
              rows={9}
              maxLength={4000}
              error={errors.story}
              hasHint
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Values"
        description="The principles behind your work, on the About page. Hidden while there are none."
        actions={
          <Button size="sm" onClick={() => values.add({ title: "", text: "" })} disabled={values.rows.length >= MAX_VALUES}>
            <Plus size={15} aria-hidden="true" /> Add value
          </Button>
        }
        flush
      >
        <div className={styles.cardTop}>
          <Field label="Section title" htmlFor="about-values-title" error={errors.valuesTitle}>
            <TextInput
              id="about-values-title"
              name="valuesTitle"
              defaultValue={initial.valuesTitle}
              maxLength={60}
              error={errors.valuesTitle}
            />
          </Field>
        </div>
        {values.rows.length ? (
          <RowList>
            {values.rows.map((row, i) => (
              <RowItem
                key={row.key}
                title={`Value ${i + 1}`}
                noun="value"
                index={i}
                count={values.rows.length}
                onMove={(by) => values.move(i, by)}
                onRemove={() => values.remove(row.key)}
              >
                <div className={styles.stack}>
                  <Field label="Title" htmlFor={`value-title-${row.key}`} error={errors[`values.${i}.title`]}>
                    <TextInput
                      id={`value-title-${row.key}`}
                      name="valueTitle"
                      value={row.title}
                      maxLength={60}
                      onChange={(e) => values.update(row.key, { title: e.target.value })}
                      error={errors[`values.${i}.title`]}
                    />
                  </Field>
                  <Field label="Description" htmlFor={`value-text-${row.key}`} error={errors[`values.${i}.text`]}>
                    <TextArea
                      id={`value-text-${row.key}`}
                      name="valueText"
                      rows={2}
                      value={row.text}
                      maxLength={300}
                      onChange={(e) => values.update(row.key, { text: e.target.value })}
                      error={errors[`values.${i}.text`]}
                    />
                  </Field>
                </div>
              </RowItem>
            ))}
          </RowList>
        ) : (
          <EmptyState icon={<Sparkles size={22} strokeWidth={1.75} />} title="No values">
            Add the principles that guide your work.
          </EmptyState>
        )}
      </Card>

      <Card
        title="Key figures"
        description="Optional numbers, shown on the home page and the About page."
        actions={
          <Button size="sm" onClick={() => stats.add({ value: "", label: "" })} disabled={stats.rows.length >= MAX_STATS}>
            <Plus size={15} aria-hidden="true" /> Add figure
          </Button>
        }
        flush
      >
        {stats.rows.length ? (
          <RowList>
            {stats.rows.map((row, i) => (
              <RowItem
                key={row.key}
                title={`Figure ${i + 1}`}
                noun="figure"
                index={i}
                count={stats.rows.length}
                onMove={(by) => stats.move(i, by)}
                onRemove={() => stats.remove(row.key)}
              >
                <FormGrid>
                  <Field label="Figure" htmlFor={`stat-value-${row.key}`} error={errors[`stats.${i}.value`]}>
                    <TextInput
                      id={`stat-value-${row.key}`}
                      name="statValue"
                      placeholder="120+"
                      value={row.value}
                      maxLength={12}
                      onChange={(e) => stats.update(row.key, { value: e.target.value })}
                      error={errors[`stats.${i}.value`]}
                    />
                  </Field>
                  <Field label="Label" htmlFor={`stat-label-${row.key}`} error={errors[`stats.${i}.label`]}>
                    <TextInput
                      id={`stat-label-${row.key}`}
                      name="statLabel"
                      placeholder="Projects delivered"
                      value={row.label}
                      maxLength={60}
                      onChange={(e) => stats.update(row.key, { label: e.target.value })}
                      error={errors[`stats.${i}.label`]}
                    />
                  </Field>
                </FormGrid>
              </RowItem>
            ))}
          </RowList>
        ) : (
          <EmptyState icon={<Hash size={22} strokeWidth={1.75} />} title="No figures">
            Add up to four numbers you can stand behind, like projects delivered or years in business.
          </EmptyState>
        )}
      </Card>

      <div className={styles.footer}>
        <a href="/about" target="_blank" rel="noopener noreferrer" className={styles.view}>
          View About page <ArrowUpRight size={15} aria-hidden="true" />
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
