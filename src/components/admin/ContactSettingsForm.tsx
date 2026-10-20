"use client";

import { ArrowDown, ArrowUp, ArrowUpRight, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ContactInfo } from "@/content/types";
import type { FormState } from "@/lib/form-state";
import { Button, ButtonLink } from "./ui/Button";
import { Field, FormActions, FormGrid, FormMessage, TextArea, TextInput } from "./ui/Form";
import { Card, EmptyState } from "./ui/Layout";
import { SubmitButton } from "./ui/SubmitButton";
import { useActionForm } from "./ui/useActionForm";
import styles from "./ContactSettingsForm.module.css";

type Row = { key: number; label: string; lines: string; postalCode: string; mapUrl: string };

export function ContactSettingsForm({
  action,
  initial,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  initial: ContactInfo;
}) {
  const { state, pending, onSubmit } = useActionForm(action);
  const errors = state.errors ?? {};
  const [rows, setRows] = useState<Row[]>(() =>
    initial.addresses.map((a, i) => ({ key: i, label: a.label, lines: a.lines, postalCode: a.postalCode, mapUrl: a.mapUrl ?? "" })),
  );
  const [nextKey, setNextKey] = useState(initial.addresses.length);

  const update = (key: number, patch: Partial<Row>) =>
    setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const move = (index: number, by: -1 | 1) =>
    setRows((list) => {
      const next = [...list];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });
  const add = () => {
    setRows((list) => [...list, { key: nextKey, label: "", lines: "", postalCode: "", mapUrl: "" }]);
    setNextKey((k) => k + 1);
  };

  return (
    <form onSubmit={onSubmit} noValidate className={styles.form}>
      {state.message ? <FormMessage ok={state.ok}>{state.message}</FormMessage> : null}

      <Card title="Page text" description="The heading and introduction at the top of the Contact page.">
        <div className={styles.stack}>
          <Field label="Heading" htmlFor="contact-heading" error={errors.heading}>
            <TextInput id="contact-heading" name="heading" defaultValue={initial.heading} maxLength={80} error={errors.heading} />
          </Field>
          <Field label="Introduction" htmlFor="contact-intro" optional error={errors.intro}>
            <TextArea id="contact-intro" name="intro" defaultValue={initial.intro} rows={3} maxLength={400} error={errors.intro} />
          </Field>
        </div>
      </Card>

      <Card title="Contact details" description="Shown on the Contact page and in the footer of confirmation emails.">
        <FormGrid>
          <Field label="Email" htmlFor="contact-email" optional error={errors.email}>
            <TextInput
              id="contact-email"
              name="email"
              type="email"
              inputMode="email"
              placeholder="hello@enfinito.com"
              defaultValue={initial.email}
              error={errors.email}
            />
          </Field>
          <Field label="Phone" htmlFor="contact-phone" optional error={errors.phone}>
            <TextInput id="contact-phone" name="phone" type="tel" inputMode="tel" defaultValue={initial.phone} error={errors.phone} />
          </Field>
          <Field label="Opening hours" htmlFor="contact-hours" optional error={errors.hours} className="span-2">
            <TextInput
              id="contact-hours"
              name="hours"
              placeholder="Monday to Friday, 9:00 to 18:00"
              defaultValue={initial.hours}
              error={errors.hours}
            />
          </Field>
        </FormGrid>
      </Card>

      <Card title="Business details" description="Shown in the footer of every page and on the Contact page.">
        <Field label="Trade license number" htmlFor="contact-trade-license" optional error={errors.tradeLicense}>
          <TextInput
            id="contact-trade-license"
            name="tradeLicense"
            defaultValue={initial.tradeLicense}
            maxLength={60}
            error={errors.tradeLicense}
            autoComplete="off"
          />
        </Field>
      </Card>

      <Card
        title="Addresses"
        description="Offices or studios, in the order they should appear."
        actions={
          <Button size="sm" onClick={add} disabled={rows.length >= 10}>
            <Plus size={15} aria-hidden="true" /> Add address
          </Button>
        }
        flush
      >
        {rows.length ? (
          <ol className={styles.addresses}>
            {rows.map((row, i) => (
              <li key={row.key} className={styles.address}>
                <div className={styles.addressHead}>
                  <span className={styles.addressIndex}>Address {i + 1}</span>
                  <span className={styles.addressActions}>
                    <Button variant="ghost" size="icon" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                      <ArrowUp size={16} aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>
                      <ArrowDown size={16} aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove address"
                      onClick={() => setRows((list) => list.filter((r) => r.key !== row.key))}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </span>
                </div>
                <FormGrid>
                  <Field label="Label" htmlFor={`addr-label-${row.key}`} optional error={errors[`addresses.${i}.label`]}>
                    <TextInput
                      id={`addr-label-${row.key}`}
                      name="addressLabel"
                      placeholder="Head office"
                      value={row.label}
                      onChange={(e) => update(row.key, { label: e.target.value })}
                      error={errors[`addresses.${i}.label`]}
                    />
                  </Field>
                  <Field
                    label="Postal code"
                    htmlFor={`addr-postal-${row.key}`}
                    error={errors[`addresses.${i}.postalCode`]}
                    hint="Shown on its own line under the address."
                  >
                    <TextInput
                      id={`addr-postal-${row.key}`}
                      name="addressPostal"
                      placeholder="1212"
                      value={row.postalCode}
                      maxLength={12}
                      onChange={(e) => update(row.key, { postalCode: e.target.value })}
                      error={errors[`addresses.${i}.postalCode`]}
                      hasHint
                    />
                  </Field>
                  <Field
                    label="Address"
                    htmlFor={`addr-lines-${row.key}`}
                    error={errors[`addresses.${i}.lines`]}
                    hint="Street, area and city, each part on its own line."
                    className="span-2"
                  >
                    <TextArea
                      id={`addr-lines-${row.key}`}
                      name="addressLines"
                      rows={3}
                      value={row.lines}
                      onChange={(e) => update(row.key, { lines: e.target.value })}
                      error={errors[`addresses.${i}.lines`]}
                      hasHint
                    />
                  </Field>
                  <Field
                    label="Map link"
                    htmlFor={`addr-map-${row.key}`}
                    optional
                    error={errors[`addresses.${i}.mapUrl`]}
                    className="span-2"
                  >
                    <TextInput
                      id={`addr-map-${row.key}`}
                      name="addressMap"
                      type="url"
                      inputMode="url"
                      placeholder="https://maps.google.com/…"
                      value={row.mapUrl}
                      onChange={(e) => update(row.key, { mapUrl: e.target.value })}
                      error={errors[`addresses.${i}.mapUrl`]}
                    />
                  </Field>
                </FormGrid>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState icon={<MapPin size={22} strokeWidth={1.75} />} title="No addresses">
            Add your office or studio so visitors know where to find you.
          </EmptyState>
        )}
      </Card>

      <div className={styles.footer}>
        <a href="/contact" target="_blank" rel="noopener noreferrer" className={styles.view}>
          View contact page <ArrowUpRight size={15} aria-hidden="true" />
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
