import { BriefcaseBusiness } from "lucide-react";
import type { Metadata } from "next";
import { OfferingList } from "@/components/admin/OfferingList";
import { requireUser } from "@/lib/server/auth";
import { listOfferings } from "@/lib/server/data/offerings";

export const instant = false;
export const metadata: Metadata = { title: "Services" };

export default async function ServicesAdminPage({ searchParams }: PageProps<"/admin/services">) {
  await requireUser();
  const [{ saved }, items] = await Promise.all([searchParams, listOfferings("service")]);
  return (
    <OfferingList
      kind="service"
      items={items}
      saved={typeof saved === "string" ? saved : undefined}
      icon={BriefcaseBusiness}
      description="Cards in “Services we provide” on the home page and on the Services page, in this order. Each links to the service's own website."
    />
  );
}
