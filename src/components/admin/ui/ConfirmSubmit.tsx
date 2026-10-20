"use client";

import { type ReactNode, useRef } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";
import styles from "./ConfirmSubmit.module.css";
import { SubmitButton } from "./SubmitButton";

type Props = {
  /** Trigger contents. */
  children: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  "aria-label"?: string;
};

/** Place inside a <form>: asks for confirmation in a modal, then submits it. */
export function ConfirmSubmit({
  children,
  title,
  description,
  confirmLabel = "Delete",
  variant = "danger",
  size,
  "aria-label": ariaLabel,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <Button variant={variant} size={size} aria-label={ariaLabel} onClick={() => dialog.current?.showModal()}>
        {children}
      </Button>
      <dialog
        ref={dialog}
        className={styles.dialog}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className={styles.panel}>
          <h2 className={styles.title}>{title}</h2>
          {description ? <p className={styles.description}>{description}</p> : null}
          <div className={styles.actions}>
            <Button onClick={() => dialog.current?.close()} autoFocus>
              Cancel
            </Button>
            <SubmitButton variant="danger">{confirmLabel}</SubmitButton>
          </div>
        </div>
      </dialog>
    </>
  );
}
