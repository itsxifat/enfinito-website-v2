"use client";

import { RefreshCw, UserPlus } from "lucide-react";
import { useEffect, useRef } from "react";
import type { FormState } from "@/lib/form-state";
import { Button } from "./ui/Button";
import { Field, FormMessage, TextInput } from "./ui/Form";
import { SubmitButton } from "./ui/SubmitButton";
import { useActionForm } from "./ui/useActionForm";
import styles from "./TeamForm.module.css";

const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generatePassword(length = 16): string {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (n) => ALPHABET[n % ALPHABET.length]).join("");
}

export function TeamForm({ action }: { action: (state: FormState, data: FormData) => Promise<FormState> }) {
  const { state, pending, onSubmit } = useActionForm(action);
  const form = useRef<HTMLFormElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const errors = state.errors ?? {};

  // Clear the form once the member was added.
  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state]);

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className={styles.form}>
      {state.message ? <FormMessage ok={state.ok}>{state.message}</FormMessage> : null}
      <Field label="Name" htmlFor="member-name" error={errors.name}>
        <TextInput id="member-name" name="name" error={errors.name} autoComplete="off" />
      </Field>
      <Field label="Email" htmlFor="member-email" error={errors.email}>
        <TextInput id="member-email" name="email" type="email" error={errors.email} autoComplete="off" />
      </Field>
      <Field
        label="Temporary password"
        htmlFor="member-password"
        error={errors.password}
        hint="They can change it in Account after signing in."
      >
        <div className={styles.passwordRow}>
          <TextInput
            ref={passwordInput}
            id="member-password"
            name="password"
            type="text"
            error={errors.password}
            hasHint
            autoComplete="off"
            spellCheck={false}
            className={styles.mono}
          />
          <Button size="icon" aria-label="Generate a password" title="Generate" onClick={() => {
              if (passwordInput.current) passwordInput.current.value = generatePassword();
            }}
          >
            <RefreshCw size={16} aria-hidden="true" />
          </Button>
        </div>
      </Field>
      <SubmitButton pending={pending} pendingLabel="Adding…">
        <UserPlus size={16} aria-hidden="true" /> Add team member
      </SubmitButton>
    </form>
  );
}
