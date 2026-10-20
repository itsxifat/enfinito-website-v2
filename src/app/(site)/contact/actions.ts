"use server";

import { after } from "next/server";
import { z } from "zod";
import { createMessage } from "@/lib/server/data/messages";
import { deliverEnquiryEmails } from "@/lib/server/email/send";
import { consume, requestMeta } from "@/lib/server/rate-limit";

const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name.").max(120, "That name is too long."),
  businessName: z.string().min(1, "Please enter your business name.").max(160, "That name is too long."),
  email: z.email("Please enter a valid email address.").max(200),
  phone: z
    .string()
    .regex(/^\+?[\d\s().-]{7,20}$/, "Please enter a valid phone number.")
    .refine((v) => v.replace(/\D/g, "").length >= 7, "Please enter a valid phone number."),
  message: z
    .string()
    .min(10, "Please tell us a little more (at least 10 characters).")
    .max(5000, "Please keep your message under 5,000 characters."),
});

export type ContactField = keyof z.infer<typeof schema>;

export type ContactFormState =
  | { status: "idle" }
  | {
      status: "error";
      message?: string;
      fieldErrors: Partial<Record<ContactField, string>>;
      values: Partial<Record<ContactField, string>>;
    }
  | { status: "success"; firstName: string };

const FIELDS: ContactField[] = ["fullName", "businessName", "email", "phone", "message"];

export async function submitContact(_prev: ContactFormState, formData: FormData): Promise<ContactFormState> {
  // Bots fill the hidden "website" field; humans never see it.
  if (formData.get("website")) return { status: "success", firstName: "" };

  const values = Object.fromEntries(
    FIELDS.map((f) => [f, String(formData.get(f) ?? "").trim()]),
  ) as Record<ContactField, string>;

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      status: "error",
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]]),
      ) as Partial<Record<ContactField, string>>,
      values,
    };
  }

  const { ip, userAgent } = await requestMeta();
  if (!(await consume(`contact:${ip}`, 5, 60 * 60 * 1000))) {
    return {
      status: "error",
      message: "You've sent several messages in a short time. Please try again a little later.",
      fieldErrors: {},
      values,
    };
  }

  try {
    const enquiry = { ...parsed.data, email: parsed.data.email.toLowerCase() };
    const id = await createMessage({ ...enquiry, ip, userAgent });
    // Emails go out after the response, so the visitor isn't kept waiting.
    after(() => deliverEnquiryEmails(id, enquiry));
    return { status: "success", firstName: enquiry.fullName.split(/\s+/)[0] };
  } catch (err) {
    console.error("[contact] could not save message:", err);
    return {
      status: "error",
      message: "Something went wrong and your message wasn't sent. Please try again in a moment.",
      fieldErrors: {},
      values,
    };
  }
}
