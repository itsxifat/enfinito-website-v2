import type { Metadata } from "next";
import { offeringLabels } from "@/components/admin/offering-labels";
import { OfferingForm } from "@/components/admin/OfferingForm";
import { PageHeader } from "@/components/admin/ui/Layout";
import { requireUser } from "@/lib/server/auth";
import { saveOffering } from "../../offering-actions";

export const instant = false;
export const metadata: Metadata = { title: "New service" };

const labels = offeringLabels.service;

export default async function NewServicePage() {
  await requireUser();
  return (
    <>
      <PageHeader
        back={{ href: labels.path, label: labels.title }}
        title="New service"
        description="Shown as a card on the home page and the Services page, linking to its website."
      />
      <OfferingForm action={saveOffering.bind(null, "service", null)} labels={labels} />
    </>
  );
}
