import type { Metadata } from "next";
import { BrandForm } from "@/components/admin/BrandForm";
import { PageHeader } from "@/components/admin/ui/Layout";
import { requireUser } from "@/lib/server/auth";
import { saveBrand } from "../actions";

export const instant = false;
export const metadata: Metadata = { title: "Add brand" };

export default async function NewBrandPage() {
  await requireUser();
  return (
    <>
      <PageHeader
        back={{ href: "/admin/brands", label: "Brands" }}
        title="Add brand"
        description="The logo appears in the brand strip on the home page."
      />
      <BrandForm action={saveBrand.bind(null, null)} />
    </>
  );
}
