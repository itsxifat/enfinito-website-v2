import { Package } from "lucide-react";
import type { Metadata } from "next";
import { OfferingList } from "@/components/admin/OfferingList";
import { requireUser } from "@/lib/server/auth";
import { listOfferings } from "@/lib/server/data/offerings";

export const instant = false;
export const metadata: Metadata = { title: "Products" };

export default async function ProductsAdminPage({ searchParams }: PageProps<"/admin/products">) {
  await requireUser();
  const [{ saved }, items] = await Promise.all([searchParams, listOfferings("product")]);
  return (
    <OfferingList
      kind="product"
      items={items}
      saved={typeof saved === "string" ? saved : undefined}
      icon={Package}
      description="Cards in “Our products” on the home page and on the Products page, in this order. Each links to the product's own website."
    />
  );
}
