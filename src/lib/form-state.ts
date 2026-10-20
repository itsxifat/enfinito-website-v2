import type { z } from "zod";

/** Result of an admin form action, rendered by the form via useActionState. */
export type FormState = {
  ok?: boolean;
  /** Banner text: success confirmation or a form-level error. */
  message?: string;
  /** First error per field name. */
  errors?: Record<string, string>;
};

export const initialFormState: FormState = {};

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function formString(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}
