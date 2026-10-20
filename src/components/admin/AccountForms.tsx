"use client";

import { useEffect, useRef } from "react";
import type { FormState } from "@/lib/form-state";
import { Field, FormMessage, TextInput } from "./ui/Form";
import { SubmitButton } from "./ui/SubmitButton";
import { useActionForm } from "./ui/useActionForm";
import styles from "./AccountForms.module.css";

type Action = (state: FormState, data: FormData) => Promise<FormState>;

export function ProfileForm({ action, name, email }: { action: Action; name: string; email: string }) {
  const { state, pending, onSubmit } = useActionForm(action);
  return (
    <form onSubmit={onSubmit} noValidate className={styles.form}>
      {state.message ? <FormMessage ok={state.ok}>{state.message}</FormMessage> : null}
      <Field label="Name" htmlFor="profile-name" error={state.errors?.name}>
        <TextInput id="profile-name" name="name" defaultValue={name} error={state.errors?.name} autoComplete="name" />
      </Field>
      <Field label="Email" htmlFor="profile-email" hint="Your sign-in email. Ask the owner to change it.">
        <TextInput id="profile-email" value={email} disabled readOnly hasHint />
      </Field>
      <SubmitButton pending={pending} pendingLabel="Saving…">
        Save profile
      </SubmitButton>
    </form>
  );
}

export function PasswordForm({ action }: { action: Action }) {
  const { state, pending, onSubmit } = useActionForm(action);
  const form = useRef<HTMLFormElement>(null);
  const errors = state.errors ?? {};

  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state]);

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className={styles.form}>
      {state.message ? <FormMessage ok={state.ok}>{state.message}</FormMessage> : null}
      {/* Lets password managers associate the new password with the account. */}
      <input type="text" name="username" autoComplete="username" hidden readOnly />
      <Field label="Current password" htmlFor="pw-current" error={errors.current}>
        <TextInput id="pw-current" name="current" type="password" autoComplete="current-password" error={errors.current} />
      </Field>
      <Field label="New password" htmlFor="pw-next" error={errors.next} hint="At least 10 characters. A long passphrase is best.">
        <TextInput id="pw-next" name="next" type="password" autoComplete="new-password" error={errors.next} hasHint />
      </Field>
      <Field label="Confirm new password" htmlFor="pw-confirm" error={errors.confirm}>
        <TextInput id="pw-confirm" name="confirm" type="password" autoComplete="new-password" error={errors.confirm} />
      </Field>
      <SubmitButton pending={pending} pendingLabel="Updating…">
        Change password
      </SubmitButton>
    </form>
  );
}
