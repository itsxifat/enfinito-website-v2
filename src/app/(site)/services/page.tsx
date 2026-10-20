import type { Metadata } from "next";
import { OfferingsPage } from "@/components/offerings/OfferingsPage";
import { ServiceRows } from "@/components/offerings/ServiceRows";
import { offeringsCopy } from "@/content/site";
import { getPublicOfferings } from "@/lib/server/data/offerings";

const copy = offeringsCopy.service;

export const metadata: Metadata = {
  title: copy.page.title,
  description: copy.page.intro,
};

export default async function ServicesPage() {
  const items = await getPublicOfferings("service");
  return (
    <OfferingsPage copy={copy} empty={items.length === 0}>
      <ServiceRows items={items} />
    </OfferingsPage>
  );
}
