import type { Metadata } from "next";
import { ContactSettingsForm } from "@/components/admin/ContactSettingsForm";
import { PageHeader } from "@/components/admin/ui/Layout";
import { requireUser } from "@/lib/server/auth";
import { loadContactSettings } from "@/lib/server/data/settings";
import { saveContact } from "./actions";

export const instant = false;
export const metadata: Metadata = { title: "Contact page" };

export default async function ContactSettingsPage() {
  await requireUser();
  const contact = await loadContactSettings();
  return (
    <>
      <PageHeader
        title="Contact page"
        description="Your contact details and addresses. Changes go live on the website as soon as you save."
      />
      <ContactSettingsForm action={saveContact} initial={contact} />
    </>
  );
}
