"use client";

import { ArrowUpRight, Send } from "lucide-react";
import { useState } from "react";
import type { FormState } from "@/lib/form-state";
import { Field, FormActions, FormGrid, FormMessage, Select, TextInput, Toggle } from "./ui/Form";
import { Card } from "./ui/Layout";
import { SubmitButton } from "./ui/SubmitButton";
import { useActionForm } from "./ui/useActionForm";
import styles from "./EmailSettingsForm.module.css";

export type EmailFormValues = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  hasPassword: boolean;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  notifyEmail: string;
};

type Action = (state: FormState, data: FormData) => Promise<FormState>;

const PORT_FOR = { ssl: 465, starttls: 587, none: 25 } as const;

export function EmailSettingsForm({ action, values }: { action: Action; values: EmailFormValues }) {
  const { state, pending, onSubmit } = useActionForm(action);
  const errors = state.errors ?? {};
  const [security, setSecurity] = useState<keyof typeof PORT_FOR>(
    values.secure ? "ssl" : values.port === 25 ? "none" : "starttls",
  );
  const [port, setPort] = useState(String(values.port || 587));

  return (
    <form onSubmit={onSubmit} noValidate className={styles.form}>
      {state.message ? <FormMessage ok={state.ok}>{state.message}</FormMessage> : null}

      <Toggle
        id="email-enabled"
        name="enabled"
        label="Send confirmation emails"
        description="Everyone who submits the contact form gets a branded confirmation with your logo and contact details."
        defaultChecked={values.enabled}
      />

      <Card title="SMTP server" description="The outgoing mail server of your email provider.">
        <FormGrid>
          <Field label="Host" htmlFor="smtp-host" error={errors.host} className="span-2">
            <TextInput id="smtp-host" name="host" placeholder="smtp.gmail.com" defaultValue={values.host} error={errors.host} autoComplete="off" spellCheck={false} />
          </Field>
          <Field label="Security" htmlFor="smtp-security">
            <Select
              id="smtp-security"
              name="security"
              value={security}
              onChange={(e) => {
                const next = e.target.value as keyof typeof PORT_FOR;
                setSecurity(next);
                setPort(String(PORT_FOR[next]));
              }}
            >
              <option value="ssl">SSL/TLS (usually port 465)</option>
              <option value="starttls">STARTTLS (usually port 587)</option>
              <option value="none">None (not recommended)</option>
            </Select>
          </Field>
          <Field label="Port" htmlFor="smtp-port" error={errors.port}>
            <TextInput id="smtp-port" name="port" inputMode="numeric" value={port} onChange={(e) => setPort(e.target.value)} error={errors.port} />
          </Field>
          <Field label="Username" htmlFor="smtp-user" optional hint="Usually your full email address.">
            <TextInput id="smtp-user" name="user" defaultValue={values.user} autoComplete="off" spellCheck={false} hasHint />
          </Field>
          <Field
            label="Password"
            htmlFor="smtp-password"
            optional={!values.hasPassword}
            error={errors.password}
            hint={values.hasPassword ? "Saved and encrypted. Leave blank to keep it." : "Stored encrypted. For Gmail, use an app password."}
          >
            <TextInput
              id="smtp-password"
              name="password"
              type="password"
              placeholder={values.hasPassword ? "••••••••••" : ""}
              autoComplete="new-password"
              error={errors.password}
              hasHint
            />
          </Field>
        </FormGrid>
      </Card>

      <Card title="Sender" description="How your emails appear in people's inboxes.">
        <FormGrid>
          <Field label="From name" htmlFor="from-name">
            <TextInput id="from-name" name="fromName" defaultValue={values.fromName} placeholder="Enfinito" error={errors.fromName} />
          </Field>
          <Field label="From email" htmlFor="from-email" error={errors.fromEmail} hint="Must be an address your SMTP account may send from.">
            <TextInput id="from-email" name="fromEmail" type="email" defaultValue={values.fromEmail} error={errors.fromEmail} hasHint />
          </Field>
          <Field label="Reply-to" htmlFor="reply-to" optional error={errors.replyTo} hint="Where replies go. Defaults to your contact email.">
            <TextInput id="reply-to" name="replyTo" type="email" defaultValue={values.replyTo} error={errors.replyTo} hasHint />
          </Field>
          <Field label="Notify team at" htmlFor="notify-email" optional error={errors.notifyEmail} hint="Get an email for every new enquiry.">
            <TextInput id="notify-email" name="notifyEmail" type="email" defaultValue={values.notifyEmail} error={errors.notifyEmail} hasHint />
          </Field>
        </FormGrid>
      </Card>

      <div className={styles.footer}>
        <a href="/admin/email-preview" target="_blank" rel="noopener noreferrer" className={styles.preview}>
          Preview confirmation email <ArrowUpRight size={15} aria-hidden="true" />
        </a>
        <FormActions>
          <SubmitButton pending={pending} pendingLabel="Saving…">
            Save settings
          </SubmitButton>
        </FormActions>
      </div>
    </form>
  );
}

export function TestEmailForm({ action, defaultTo }: { action: Action; defaultTo: string }) {
  const { state, pending, onSubmit } = useActionForm(action);
  return (
    <form onSubmit={onSubmit} noValidate className={styles.test}>
      {state.message ? <FormMessage ok={state.ok}>{state.message}</FormMessage> : null}
      <Field label="Send to" htmlFor="test-to" error={state.errors?.to}>
        <TextInput id="test-to" name="to" type="email" defaultValue={defaultTo} error={state.errors?.to} />
      </Field>
      <SubmitButton variant="secondary" pending={pending} pendingLabel="Sending…">
        <Send size={15} aria-hidden="true" /> Send test email
      </SubmitButton>
    </form>
  );
}
