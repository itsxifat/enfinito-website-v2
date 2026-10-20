import type { Metadata } from "next";
import { OfferingsPage } from "@/components/offerings/OfferingsPage";
import { ProductGrid } from "@/components/offerings/ProductTile";
import { offeringsCopy } from "@/content/site";
import { getPublicOfferings } from "@/lib/server/data/offerings";

const copy = offeringsCopy.product;

export const metadata: Metadata = {
  title: copy.page.title,
  description: copy.page.intro,
};

export default async function ProductsPage() {
  const items = await getPublicOfferings("product");
  return (
    <OfferingsPage copy={copy} empty={items.length === 0}>
      <ProductGrid items={items} />
    </OfferingsPage>
  );
}
