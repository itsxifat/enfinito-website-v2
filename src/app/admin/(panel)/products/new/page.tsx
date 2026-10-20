import type { Metadata } from "next";
import { offeringLabels } from "@/components/admin/offering-labels";
import { OfferingForm } from "@/components/admin/OfferingForm";
import { PageHeader } from "@/components/admin/ui/Layout";
import { requireUser } from "@/lib/server/auth";
import { saveOffering } from "../../offering-actions";

export const instant = false;
export const metadata: Metadata = { title: "New product" };

const labels = offeringLabels.product;

export default async function NewProductPage() {
  await requireUser();
  return (
    <>
      <PageHeader
        back={{ href: labels.path, label: labels.title }}
        title="New product"
        description="Shown as a card on the home page and the Products page, linking to its website."
      />
      <OfferingForm action={saveOffering.bind(null, "product", null)} labels={labels} />
    </>
  );
}
