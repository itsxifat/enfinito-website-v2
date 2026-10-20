"use client";

import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";
import styles from "./Button.module.css";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pendingLabel?: ReactNode;
  /** For forms submitted via useActionForm, which useFormStatus can't see. */
  pending?: boolean;
};

/** Submit button that shows a spinner while its form's action runs. */
export function SubmitButton({ variant = "primary", size, children, pendingLabel, disabled, pending: pendingProp, ...props }: Props) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <Button type="submit" variant={variant} size={size} disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending ? (
        <>
          <LoaderCircle size={16} className={styles.spin} aria-hidden="true" />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
