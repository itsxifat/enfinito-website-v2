import { CircleAlert, CircleCheck } from "lucide-react";
import type { ComponentProps, InputHTMLAttributes, ReactNode } from "react";
import styles from "./Form.module.css";

type FieldProps = {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
};

export function Field({ label, htmlFor, hint, error, optional, children, className }: FieldProps) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")} data-invalid={error ? "" : undefined}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {optional ? <span className={styles.optional}>Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p className={styles.error} id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint} id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const describedBy = (id: string | undefined, error?: string, hint?: boolean) =>
  id ? (error ? `${id}-error` : hint ? `${id}-hint` : undefined) : undefined;

type Extra = { error?: string; hasHint?: boolean };

export function TextInput({ error, hasHint, className, ...props }: ComponentProps<"input"> & Extra) {
  return (
    <input
      className={[styles.control, className].filter(Boolean).join(" ")}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(props.id, error, hasHint)}
      {...props}
    />
  );
}

export function TextArea({ error, hasHint, className, ...props }: ComponentProps<"textarea"> & Extra) {
  return (
    <textarea
      className={[styles.control, styles.textarea, className].filter(Boolean).join(" ")}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy(props.id, error, hasHint)}
      {...props}
    />
  );
}

export function Select({ error, className, children, ...props }: ComponentProps<"select"> & Extra) {
  return (
    <select
      className={[styles.control, styles.select, className].filter(Boolean).join(" ")}
      aria-invalid={error ? true : undefined}
      {...props}
    >
      {children}
    </select>
  );
}

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  description?: ReactNode;
};

/** A checkbox styled as a switch. Unchecked boxes aren't submitted, so read
 *  it on the server as `formData.get(name) === "on"`. */
export function Toggle({ label, description, id, ...props }: ToggleProps) {
  return (
    <label className={styles.toggle} htmlFor={id}>
      <span className={styles.toggleText}>
        <span className={styles.toggleLabel}>{label}</span>
        {description ? <span className={styles.toggleDescription}>{description}</span> : null}
      </span>
      <input id={id} type="checkbox" role="switch" className={styles.switch} {...props} />
    </label>
  );
}

export function FormMessage({ ok, children }: { ok?: boolean; children: ReactNode }) {
  return (
    <p className={styles.message} data-tone={ok ? "success" : "error"} role={ok ? "status" : "alert"}>
      {ok ? <CircleCheck size={17} aria-hidden="true" /> : <CircleAlert size={17} aria-hidden="true" />}
      <span>{children}</span>
    </p>
  );
}

/** Sticky footer row for a form's actions. */
export function FormActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}

export function FormGrid({ children, columns = 2 }: { children: ReactNode; columns?: 1 | 2 }) {
  return (
    <div className={styles.grid} data-columns={columns}>
      {children}
    </div>
  );
}
