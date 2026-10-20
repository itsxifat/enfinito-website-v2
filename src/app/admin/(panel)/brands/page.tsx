import { ArrowDown, ArrowUp, Award, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/admin/ui/Button";
import { ConfirmSubmit } from "@/components/admin/ui/ConfirmSubmit";
import { FormMessage } from "@/components/admin/ui/Form";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui/Layout";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { requireUser } from "@/lib/server/auth";
import { listBrands } from "@/lib/server/data/brands";
import { deleteBrandAction, moveBrandAction, toggleBrandAction } from "./actions";
import styles from "./brands.module.css";

export const instant = false;
export const metadata: Metadata = { title: "Brands" };

const host = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export default async function BrandsPage({ searchParams }: PageProps<"/admin/brands">) {
  await requireUser();
  const [{ saved }, brands] = await Promise.all([searchParams, listBrands()]);
  const visibleCount = brands.filter((b) => b.visible).length;

  return (
    <>
      <PageHeader
        title="Brands"
        description="Logos in the “Brands that trusted us” strip on the home page, in this order."
        actions={
          <ButtonLink href="/admin/brands/new" variant="primary">
            <Plus size={16} aria-hidden="true" /> Add brand
          </ButtonLink>
        }
      />

      {typeof saved === "string" ? (
        <div className={styles.notice}>
          <FormMessage ok>{saved ? `“${saved}” was saved.` : "Saved."} The home page is updated.</FormMessage>
        </div>
      ) : null}

      <Card
        flush
        title={brands.length ? `${brands.length} ${brands.length === 1 ? "brand" : "brands"}` : undefined}
        description={brands.length ? `${visibleCount} shown on the website` : undefined}
      >
        {brands.length ? (
          <ol className={styles.list}>
            {brands.map((brand, i) => (
              <li key={brand.id} className={styles.row} data-hidden={brand.visible ? undefined : ""}>
                <span className={styles.position}>{i + 1}</span>
                <span className={styles.tile}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, any format */}
                  <img src={brand.logo.src} alt="" className={styles.logo} />
                </span>
                <span className={styles.text}>
                  <Link href={`/admin/brands/${brand.id}`} className={styles.name}>
                    {brand.name}
                  </Link>
                  <span className={styles.url}>{brand.url ? host(brand.url) : "No link"}</span>
                </span>
                <span className={styles.status}>
                  {brand.visible ? <Badge tone="green">Shown</Badge> : <Badge>Hidden</Badge>}
                </span>
                <span className={styles.actions}>
                  <form action={moveBrandAction.bind(null, brand.id, -1)}>
                    <SubmitButton variant="ghost" size="icon" aria-label={`Move ${brand.name} up`} title="Move up" disabled={i === 0}>
                      <ArrowUp size={16} aria-hidden="true" />
                    </SubmitButton>
                  </form>
                  <form action={moveBrandAction.bind(null, brand.id, 1)}>
                    <SubmitButton
                      variant="ghost"
                      size="icon"
                      aria-label={`Move ${brand.name} down`}
                      title="Move down"
                      disabled={i === brands.length - 1}
                    >
                      <ArrowDown size={16} aria-hidden="true" />
                    </SubmitButton>
                  </form>
                  <form action={toggleBrandAction.bind(null, brand.id, !brand.visible)}>
                    <SubmitButton
                      variant="ghost"
                      size="icon"
                      aria-label={brand.visible ? `Hide ${brand.name}` : `Show ${brand.name}`}
                      title={brand.visible ? "Hide from website" : "Show on website"}
                    >
                      {brand.visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                    </SubmitButton>
                  </form>
                  <ButtonLink href={`/admin/brands/${brand.id}`} variant="ghost" size="icon" aria-label={`Edit ${brand.name}`} title="Edit">
                    <Pencil size={16} aria-hidden="true" />
                  </ButtonLink>
                  <form action={deleteBrandAction.bind(null, brand.id, false)}>
                    <ConfirmSubmit
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${brand.name}`}
                      title={`Delete ${brand.name}?`}
                      description="The brand and its logo will be removed from the website. This can't be undone."
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </ConfirmSubmit>
                  </form>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            icon={<Award size={22} strokeWidth={1.75} />}
            title="No brands yet"
            action={
              <ButtonLink href="/admin/brands/new" variant="primary">
                <Plus size={16} aria-hidden="true" /> Add your first brand
              </ButtonLink>
            }
          >
            Add the logos of brands you&apos;ve worked with. The section appears on the home page once there&apos;s at least one.
          </EmptyState>
        )}
      </Card>
    </>
  );
}
