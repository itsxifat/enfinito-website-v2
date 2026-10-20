import { ArrowUpRight, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { offeringLabels } from "@/components/admin/offering-labels";
import { OfferingForm } from "@/components/admin/OfferingForm";
import { ButtonLink } from "@/components/admin/ui/Button";
import { ConfirmSubmit } from "@/components/admin/ui/ConfirmSubmit";
import { PageHeader } from "@/components/admin/ui/Layout";
import { requireUser } from "@/lib/server/auth";
import { getOffering } from "@/lib/server/data/offerings";
import { deleteOfferingAction, saveOffering } from "../../offering-actions";

export const instant = false;
export const metadata: Metadata = { title: "Edit service" };

const labels = offeringLabels.service;

export default async function EditServicePage({ params }: PageProps<"/admin/services/[id]">) {
  await requireUser();
  const { id } = await params;
  const item = await getOffering("service", id);
  if (!item) notFound();

  return (
    <>
      <PageHeader
        back={{ href: labels.path, label: labels.title }}
        title={item.name}
        description="Edit the details or replace the banner."
        actions={
          <>
            {item.url ? (
              <ButtonLink href={item.url} target="_blank" rel="noopener noreferrer">
                Open website <ArrowUpRight size={16} aria-hidden="true" />
              </ButtonLink>
            ) : null}
            <form action={deleteOfferingAction.bind(null, "service", id, true)}>
              <ConfirmSubmit
                title={`Delete ${item.name}?`}
                description="The service and its banner will be removed from the website. This can't be undone."
              >
                <Trash2 size={16} aria-hidden="true" /> Delete
              </ConfirmSubmit>
            </form>
          </>
        }
      />
      <OfferingForm action={saveOffering.bind(null, "service", id)} labels={labels} offering={item} />
    </>
  );
}
