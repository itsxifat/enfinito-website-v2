"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { type SignInState, signIn } from "@/app/admin/actions";
import { Field, FormMessage, TextInput } from "./ui/Form";
import { SubmitButton } from "./ui/SubmitButton";
import styles from "./LoginForm.module.css";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<SignInState, FormData>(signIn, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className={styles.form}>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}

      <Field label="Email" htmlFor="login-email">
        <TextInput
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          defaultValue={state.email}
          required
          autoFocus
          className={styles.input}
        />
      </Field>

      <Field label="Password" htmlFor="login-password">
        <div className={styles.passwordWrap}>
          <TextInput
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={styles.input}
          />
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
          </button>
        </div>
      </Field>

      <SubmitButton className={styles.submit} pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
