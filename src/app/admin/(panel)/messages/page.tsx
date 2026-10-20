import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/admin/ui/Button";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui/Layout";
import table from "@/components/admin/ui/Table.module.css";
import { DeliveryBadge } from "@/components/admin/DeliveryBadge";
import { requireUser } from "@/lib/server/auth";
import { listMessages, type MessageFilter, messageCounts, PAGE_SIZE } from "@/lib/server/data/messages";
import { timeAgo } from "@/lib/format";
import styles from "./messages.module.css";

export const instant = false;
export const metadata: Metadata = { title: "Messages" };

const TABS: { filter: MessageFilter; label: string }[] = [
  { filter: "inbox", label: "Inbox" },
  { filter: "new", label: "Unread" },
  { filter: "archived", label: "Archived" },
];

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  await requireUser();
  const params = await searchParams;
  const filter = TABS.some((t) => t.filter === params.filter) ? (params.filter as MessageFilter) : "inbox";
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);

  const [{ items, total }, counts] = await Promise.all([listMessages(filter, page), messageCounts()]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (f: MessageFilter, p = 1) => `/admin/messages?filter=${f}${p > 1 ? `&page=${p}` : ""}`;

  return (
    <>
      <PageHeader title="Messages" description="Enquiries sent through the contact form on your website." />

      <nav className={styles.tabs} aria-label="Filter messages">
        {TABS.map((tab) => (
          <Link
            key={tab.filter}
            href={href(tab.filter)}
            className={styles.tab}
            aria-current={tab.filter === filter ? "page" : undefined}
          >
            {tab.label}
            <span className={styles.tabCount}>{counts[tab.filter]}</span>
          </Link>
        ))}
      </nav>

      <Card flush>
        {items.length ? (
          <div className={table.scroll}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th>From</th>
                  <th>Message</th>
                  <th className={table.hideMobile}>Confirmation</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id} className={[styles.row, m.status === "new" ? table.unread : ""].join(" ")}>
                    <td>
                      <Link href={`/admin/messages/${m.id}`} className={`${table.primary} ${styles.stretch}`} prefetch={false}>
                        {m.fullName}
                      </Link>
                      <div className={table.secondary}>{m.businessName}</div>
                    </td>
                    <td>
                      <div className={`${table.clamp} ${styles.preview}`}>{m.message}</div>
                      <div className={table.secondary}>{m.email}</div>
                    </td>
                    <td className={table.hideMobile}>
                      <DeliveryBadge status={m.confirmation.status} />
                    </td>
                    <td>
                      <div className={styles.received}>
                        {m.status === "new" ? <Badge tone="blue">New</Badge> : null}
                        <span className={table.secondary}>{timeAgo(m.createdAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={<Inbox size={22} strokeWidth={1.75} />} title={filter === "archived" ? "Nothing archived" : filter === "new" ? "You're all caught up" : "No messages yet"}>
            {filter === "inbox"
              ? "When someone fills in the contact form, their message will appear here."
              : filter === "new"
                ? "There are no unread messages."
                : "Archived messages will appear here."}
          </EmptyState>
        )}
      </Card>

      {total > PAGE_SIZE ? (
        <div className={styles.pagination}>
          <span className={styles.range}>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <div className={styles.pager}>
            {page > 1 ? (
              <ButtonLink href={href(filter, page - 1)} size="sm" aria-label="Previous page">
                <ChevronLeft size={16} aria-hidden="true" /> Previous
              </ButtonLink>
            ) : null}
            {page < pages ? (
              <ButtonLink href={href(filter, page + 1)} size="sm" aria-label="Next page">
                Next <ChevronRight size={16} aria-hidden="true" />
              </ButtonLink>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
