import { ArrowUpRight, Pencil, Scale } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/admin/ui/Button";
import { Badge, Card, PageHeader } from "@/components/admin/ui/Layout";
import { legalLinks } from "@/content/site";
import { requireUser } from "@/lib/server/auth";
import { listLegalPages } from "@/lib/server/data/legal";
import { formatDate } from "@/lib/format";
import styles from "./legal.module.css";

export const instant = false;
export const metadata: Metadata = { title: "Legal pages" };

export default async function LegalPagesAdmin() {
  await requireUser();
  const pages = await listLegalPages();

  return (
    <>
      <PageHeader
        title="Legal pages"
        description="Terms, refunds, privacy and delivery, linked from the footer of every page."
      />
      <Card flush>
        <ul className={styles.list}>
          {pages.map((page) => {
            const link = legalLinks[page.slug];
            return (
              <li key={page.slug} className={styles.row}>
                <span className={styles.icon} aria-hidden="true">
                  <Scale size={18} strokeWidth={1.75} />
                </span>
                <span className={styles.text}>
                  <Link href={`/admin/legal/${page.slug}`} className={styles.name}>
                    {page.title}
                  </Link>
                  <span className={styles.path}>{link.href}</span>
                </span>
                {page.updatedAt ? (
                  <Badge tone="green">Updated {formatDate(page.updatedAt)}</Badge>
                ) : (
                  <Badge tone="amber">Starter text</Badge>
                )}
                <span className={styles.actions}>
                  <ButtonLink
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="ghost"
                    size="icon"
                    aria-label={`View ${page.title}`}
                    title="View on the website"
                  >
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </ButtonLink>
                  <ButtonLink href={`/admin/legal/${page.slug}`} size="sm">
                    <Pencil size={14} aria-hidden="true" /> Edit
                  </ButtonLink>
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
      <p className={styles.note}>
        Pages marked Starter text show a general template written for this website. Review each one, ideally with a legal
        advisor, and adjust the details (such as refund and delivery times) before relying on it. Saving a page marks it as
        reviewed and shows its date on the website.
      </p>
    </>
  );
}
