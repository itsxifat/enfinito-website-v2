import { ArrowDown, ArrowUp, Eye, EyeOff, type LucideIcon, PanelTop, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  deleteOfferingAction,
  moveOfferingAction,
  toggleOfferingAction,
  toggleOfferingNavAction,
} from "@/app/admin/(panel)/offering-actions";
import type { OfferingKind } from "@/content/types";
import type { AdminOffering } from "@/lib/server/data/offerings";
import { hostname } from "@/lib/format";
import { offeringLabels } from "./offering-labels";
import { ButtonLink } from "./ui/Button";
import { ConfirmSubmit } from "./ui/ConfirmSubmit";
import { FormMessage } from "./ui/Form";
import { Badge, Card, EmptyState, PageHeader } from "./ui/Layout";
import { SubmitButton } from "./ui/SubmitButton";
import styles from "./OfferingList.module.css";

/** The Services or Products list: order, visibility, edit and delete. */
export function OfferingList({
  kind,
  items,
  saved,
  icon: Icon,
  description,
}: {
  kind: OfferingKind;
  items: AdminOffering[];
  /** Name of the item just saved, from the redirect. */
  saved?: string;
  icon: LucideIcon;
  description: string;
}) {
  const labels = offeringLabels[kind];
  const visibleCount = items.filter((o) => o.visible).length;
  const menuCount = items.filter((o) => o.visible && o.inNav).length;
  const addButton = (
    <ButtonLink href={`${labels.path}/new`} variant="primary">
      <Plus size={16} aria-hidden="true" /> Add {labels.singular}
    </ButtonLink>
  );

  return (
    <>
      <PageHeader title={labels.title} description={description} actions={addButton} />

      {saved !== undefined ? (
        <div className={styles.notice}>
          <FormMessage ok>
            {saved ? `“${saved}” was saved.` : "Saved."} The website is updated.
          </FormMessage>
        </div>
      ) : null}

      <Card
        flush
        title={items.length ? `${items.length} ${items.length === 1 ? labels.singular : labels.plural}` : undefined}
        description={
          items.length ? `${visibleCount} shown on the website, ${menuCount} in the navbar menu, in this order` : undefined
        }
        actions={
          items.length ? (
            <ButtonLink href={labels.publicPath} target="_blank" rel="noopener noreferrer" variant="ghost" size="sm">
              View page
            </ButtonLink>
          ) : null
        }
      >
        {items.length ? (
          <ol className={styles.list}>
            {items.map((item, i) => (
              <li key={item.id} className={styles.row} data-hidden={item.visible ? undefined : ""}>
                <span className={styles.thumb}>
                  <Image src={item.image.src} alt="" fill sizes="128px" className={styles.thumbImage} />
                </span>
                <span className={styles.text}>
                  <Link href={`${labels.path}/${item.id}`} className={styles.name}>
                    {item.name}
                  </Link>
                  <span className={styles.tagline}>{item.tagline}</span>
                  <span className={styles.url}>{item.url ? hostname(item.url) : "No website link"}</span>
                </span>
                <span className={styles.status}>
                  {item.visible ? <Badge tone="green">Shown</Badge> : <Badge>Hidden</Badge>}
                  {item.visible && item.inNav ? <Badge tone="blue">In menu</Badge> : null}
                </span>
                <span className={styles.actions}>
                  <form action={moveOfferingAction.bind(null, kind, item.id, -1)}>
                    <SubmitButton variant="ghost" size="icon" aria-label={`Move ${item.name} up`} title="Move up" disabled={i === 0}>
                      <ArrowUp size={16} aria-hidden="true" />
                    </SubmitButton>
                  </form>
                  <form action={moveOfferingAction.bind(null, kind, item.id, 1)}>
                    <SubmitButton
                      variant="ghost"
                      size="icon"
                      aria-label={`Move ${item.name} down`}
                      title="Move down"
                      disabled={i === items.length - 1}
                    >
                      <ArrowDown size={16} aria-hidden="true" />
                    </SubmitButton>
                  </form>
                  <form action={toggleOfferingAction.bind(null, kind, item.id, !item.visible)}>
                    <SubmitButton
                      variant="ghost"
                      size="icon"
                      aria-label={item.visible ? `Hide ${item.name}` : `Show ${item.name}`}
                      title={item.visible ? "Hide from website" : "Show on website"}
                    >
                      {item.visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                    </SubmitButton>
                  </form>
                  <form action={toggleOfferingNavAction.bind(null, kind, item.id, !item.inNav)}>
                    <SubmitButton
                      variant="ghost"
                      size="icon"
                      aria-label={`Show ${item.name} in the navbar menu`}
                      aria-pressed={item.inNav}
                      title={item.inNav ? "Remove from the navbar menu" : "Add to the navbar menu"}
                      className={item.inNav ? styles.navOn : undefined}
                    >
                      <PanelTop size={16} aria-hidden="true" />
                    </SubmitButton>
                  </form>
                  <ButtonLink href={`${labels.path}/${item.id}`} variant="ghost" size="icon" aria-label={`Edit ${item.name}`} title="Edit">
                    <Pencil size={16} aria-hidden="true" />
                  </ButtonLink>
                  <form action={deleteOfferingAction.bind(null, kind, item.id, false)}>
                    <ConfirmSubmit
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${item.name}`}
                      title={`Delete ${item.name}?`}
                      description={`The ${labels.singular} and its banner will be removed from the website. This can't be undone.`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </ConfirmSubmit>
                  </form>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState icon={<Icon size={22} strokeWidth={1.75} />} title={`No ${labels.plural} yet`} action={addButton}>
            Add a banner, name, tagline and link. The section appears on the home page once there&apos;s at least one.
          </EmptyState>
        )}
      </Card>
    </>
  );
}
