"use client";

import { Check } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { type ContactField, type ContactFormState, submitContact } from "@/app/(site)/contact/actions";
import buttons from "@/components/ui/Button.module.css";
import styles from "./ContactForm.module.css";

const initialState: ContactFormState = { status: "idle" };

type FieldProps = {
  name: ContactField;
  label: string;
  state: ContactFormState;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  multiline?: boolean;
};

function Field({ name, label, state, type = "text", autoComplete, inputMode, multiline }: FieldProps) {
  const error = state.status === "error" ? state.fieldErrors[name] : undefined;
  const value = state.status === "error" ? state.values[name] : undefined;
  const id = `contact-${name}`;
  const common = {
    id,
    name,
    defaultValue: value,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
    "aria-required": true,
    className: styles.input,
  };
  return (
    <div className={styles.field} data-invalid={error ? "" : undefined}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea {...common} rows={6} className={`${styles.input} ${styles.textarea}`} />
      ) : (
        <input {...common} type={type} autoComplete={autoComplete} inputMode={inputMode} />
      )}
      {error ? (
        <p className={styles.error} id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Form({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitContact, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
    if (state.status === "error") formRef.current?.querySelector<HTMLElement>("[aria-invalid]")?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon} aria-hidden="true">
          <Check size={22} strokeWidth={2} />
        </span>
        <h2 className={styles.successTitle} ref={successRef} tabIndex={-1}>
          Thank you{state.firstName ? `, ${state.firstName}` : ""}.
        </h2>
        <p className={styles.successText}>
          We&apos;ve received your message and a member of our team will be in touch shortly.
        </p>
        <button type="button" className={styles.again} onClick={onReset}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className={styles.form} noValidate>
      <div className={styles.row}>
        <Field name="fullName" label="Full name" state={state} autoComplete="name" />
        <Field name="businessName" label="Business name" state={state} autoComplete="organization" />
      </div>
      <div className={styles.row}>
        <Field name="email" label="Email" state={state} type="email" autoComplete="email" inputMode="email" />
        <Field name="phone" label="Phone number" state={state} type="tel" autoComplete="tel" inputMode="tel" />
      </div>
      <Field name="message" label="How can we help?" state={state} multiline />

      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === "error" && state.message ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.footer}>
        <p className={styles.note}>We&apos;ll only use these details to respond to your enquiry.</p>
        <button type="submit" className={`${buttons.button} ${buttons.primary} ${styles.submit}`} disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

export function ContactForm() {
  // Remounting with a new key gives a fresh, empty form.
  const [key, setKey] = useState(0);
  return <Form key={key} onReset={() => setKey((k) => k + 1)} />;
}
