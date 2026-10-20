import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPageForm } from "@/components/admin/LegalPageForm";
import { ButtonLink } from "@/components/admin/ui/Button";
import { PageHeader } from "@/components/admin/ui/Layout";
import { LEGAL_SLUGS, legalLinks } from "@/content/site";
import type { LegalSlug } from "@/content/types";
import { requireUser } from "@/lib/server/auth";
import { loadLegalPage } from "@/lib/server/data/legal";
import { saveLegalAction } from "../actions";

export const instant = false;
export const metadata: Metadata = { title: "Edit legal page" };

const isLegalSlug = (value: string): value is LegalSlug => (LEGAL_SLUGS as string[]).includes(value);

export default async function EditLegalPage({ params }: PageProps<"/admin/legal/[slug]">) {
  await requireUser();
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();
  const page = await loadLegalPage(slug);
  const href = legalLinks[slug].href;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/legal", label: "Legal pages" }}
        title={page.title}
        description={`Shown at ${href} and linked from the footer of every page.`}
        actions={
          <ButtonLink href={href} target="_blank" rel="noopener noreferrer">
            View page <ArrowUpRight size={16} aria-hidden="true" />
          </ButtonLink>
        }
      />
      <LegalPageForm action={saveLegalAction.bind(null, slug)} page={page} />
    </>
  );
}
