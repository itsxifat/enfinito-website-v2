import type { Metadata } from "next";
import { AboutSettingsForm } from "@/components/admin/AboutSettingsForm";
import { PageHeader } from "@/components/admin/ui/Layout";
import { requireUser } from "@/lib/server/auth";
import { loadAbout } from "@/lib/server/data/about";
import { saveAboutAction } from "./actions";

export const instant = false;
export const metadata: Metadata = { title: "About page" };

export default async function AboutSettingsPage() {
  await requireUser();
  const about = await loadAbout();
  return (
    <>
      <PageHeader
        title="About page"
        description="The About section on the home page and the About page itself. Changes go live as soon as you save."
      />
      <AboutSettingsForm action={saveAboutAction} initial={about} />
    </>
  );
}
