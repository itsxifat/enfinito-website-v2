import { Archive, ArchiveRestore, Mail, MailOpen, Phone, Reply, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeliveryBadge } from "@/components/admin/DeliveryBadge";
import { RefreshOnMount } from "@/components/admin/RefreshOnMount";
import { ButtonLink } from "@/components/admin/ui/Button";
import { ConfirmSubmit } from "@/components/admin/ui/ConfirmSubmit";
import { Badge, Card, PageHeader, SplitLayout } from "@/components/admin/ui/Layout";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { requireUser } from "@/lib/server/auth";
import { getMessage, markRead } from "@/lib/server/data/messages";
import { formatDateTime } from "@/lib/format";
import { removeMessage, updateMessageStatus } from "../actions";
import styles from "./message.module.css";

export const instant = false;
export const metadata: Metadata = { title: "Message" };

export default async function MessagePage({ params }: PageProps<"/admin/messages/[id]">) {
  await requireUser();
  const { id } = await params;
  const message = await getMessage(id);
  if (!message) notFound();
  const wasNew = message.status === "new";
  if (wasNew) await markRead(id);

  const archived = message.status === "archived";
  const replySubject = encodeURIComponent("Re: Your enquiry to Enfinito");
  const tel = message.phone.replace(/[^\d+]/g, "");

  return (
    <>
      <RefreshOnMount when={wasNew} />
      <PageHeader
        back={{ href: "/admin/messages", label: "Messages" }}
        title={message.fullName}
        description={message.businessName}
        actions={
          <>
            <ButtonLink href={`mailto:${message.email}?subject=${replySubject}`} variant="primary">
              <Reply size={16} aria-hidden="true" /> Reply by email
            </ButtonLink>
            <form action={updateMessageStatus.bind(null, id, "new")}>
              <SubmitButton variant="secondary">
                <MailOpen size={16} aria-hidden="true" /> Mark unread
              </SubmitButton>
            </form>
            <form action={updateMessageStatus.bind(null, id, archived ? "read" : "archived")}>
              <SubmitButton variant="secondary">
                {archived ? <ArchiveRestore size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}
                {archived ? "Move to inbox" : "Archive"}
              </SubmitButton>
            </form>
            <form action={removeMessage.bind(null, id)}>
              <ConfirmSubmit
                variant="danger"
                size="icon"
                aria-label="Delete message"
                title="Delete this message?"
                description={`The message from ${message.fullName} will be permanently deleted. This can't be undone.`}
              >
                <Trash2 size={16} aria-hidden="true" />
              </ConfirmSubmit>
            </form>
          </>
        }
      />

      <SplitLayout
        main={
          <Card title="Message" actions={archived ? <Badge>Archived</Badge> : null}>
            <p className={styles.body}>{message.message}</p>
          </Card>
        }
        aside={
          <Card title="Details">
            <dl className={styles.details}>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${message.email}`} className={styles.contact}>
                    <Mail size={15} aria-hidden="true" /> {message.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${tel}`} className={styles.contact}>
                    <Phone size={15} aria-hidden="true" /> {message.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Business</dt>
                <dd>{message.businessName}</dd>
              </div>
              <div>
                <dt>Received</dt>
                <dd>{formatDateTime(message.createdAt)}</dd>
              </div>
              <div>
                <dt>Confirmation email</dt>
                <dd className={styles.delivery}>
                  <DeliveryBadge status={message.confirmation.status} />
                  {message.confirmation.status === "skipped" ? (
                    <span className={styles.note}>Email sending was off or not set up.</span>
                  ) : null}
                  {message.confirmation.error ? <span className={styles.note}>{message.confirmation.error}</span> : null}
                </dd>
              </div>
            </dl>
          </Card>
        }
      />
    </>
  );
}
