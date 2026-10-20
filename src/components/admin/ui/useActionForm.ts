"use client";

import { type FormEvent, startTransition, useActionState } from "react";
import { type FormState, initialFormState } from "@/lib/form-state";

/** Runs a server action from onSubmit instead of the form's `action` prop.
 *  React resets `<form action>` forms after every submit, which would clear
 *  chosen files when validation fails; dispatching manually keeps the inputs
 *  as they were. */
export function useActionForm(action: (state: FormState, data: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState(action, initialFormState);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => dispatch(data));
  };
  return { state, pending, onSubmit };
}
