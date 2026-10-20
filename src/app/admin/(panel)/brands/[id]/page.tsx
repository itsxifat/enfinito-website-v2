import { Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandForm } from "@/components/admin/BrandForm";
import { ConfirmSubmit } from "@/components/admin/ui/ConfirmSubmit";
import { PageHeader } from "@/components/admin/ui/Layout";
import { requireUser } from "@/lib/server/auth";
import { getBrand } from "@/lib/server/data/brands";
import { deleteBrandAction, saveBrand } from "../actions";

export const instant = false;
export const metadata: Metadata = { title: "Edit brand" };

export default async function EditBrandPage({ params }: PageProps<"/admin/brands/[id]">) {
  await requireUser();
  const { id } = await params;
  const brand = await getBrand(id);
  if (!brand) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/brands", label: "Brands" }}
        title={brand.name}
        description="Edit the brand's details or replace its logo."
        actions={
          <form action={deleteBrandAction.bind(null, id, true)}>
            <ConfirmSubmit
              title={`Delete ${brand.name}?`}
              description="The brand and its logo will be removed from the website. This can't be undone."
            >
              <Trash2 size={16} aria-hidden="true" /> Delete
            </ConfirmSubmit>
          </form>
        }
      />
      <BrandForm action={saveBrand.bind(null, id)} brand={brand} />
    </>
  );
}
