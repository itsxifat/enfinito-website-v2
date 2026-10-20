import type { Metadata } from "next";
import { FooterSettingsForm } from "@/components/admin/FooterSettingsForm";
import { PageHeader } from "@/components/admin/ui/Layout";
import { requireUser } from "@/lib/server/auth";
import { loadFooter } from "@/lib/server/data/footer";
import { saveFooterAction } from "./actions";

export const instant = false;
export const metadata: Metadata = { title: "Footer" };

export default async function FooterSettingsPage() {
  await requireUser();
  const footer = await loadFooter();
  return (
    <>
      <PageHeader
        title="Footer"
        description="The footer at the bottom of every page. Services, products and contact details are filled in automatically."
      />
      <FooterSettingsForm action={saveFooterAction} initial={footer} />
    </>
  );
}
