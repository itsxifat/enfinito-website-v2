import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  Inbox,
  Mail,
  MailOpen,
  MapPin,
  Newspaper,
  Package,
  Plus,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/admin/ui/Button";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui/Layout";
import { requireUser } from "@/lib/server/auth";
import { countBrands } from "@/lib/server/data/brands";
import { messageCounts, recentMessages } from "@/lib/server/data/messages";
import { countNews } from "@/lib/server/data/news";
import { countOfferings } from "@/lib/server/data/offerings";
import { isEmailConfigured, loadEmailSettings } from "@/lib/server/data/settings";
import { initials, timeAgo } from "@/lib/format";
import styles from "./dashboard.module.css";

export const instant = false;

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [counts, services, products, brands, news, recent, email] = await Promise.all([
    messageCounts(),
    countOfferings("service"),
    countOfferings("product"),
    countBrands(),
    countNews(),
    recentMessages(6),
    loadEmailSettings(),
  ]);
  const emailConfigured = isEmailConfigured(email);
  const firstName = user.name.split(/\s+/)[0];

  const stats = [
    { label: "New messages", value: counts.new, note: "Waiting to be read", icon: MailOpen, href: "/admin/messages?filter=new", accent: counts.new > 0 },
    { label: "Inbox", value: counts.inbox, note: `${counts.archived} archived`, icon: Inbox, href: "/admin/messages" },
    { label: "Services", value: services.total, note: `${services.visible} shown on the website`, icon: BriefcaseBusiness, href: "/admin/services" },
    { label: "Products", value: products.total, note: `${products.visible} shown on the website`, icon: Package, href: "/admin/products" },
    { label: "Brands", value: brands.total, note: `${brands.visible} shown on the home page`, icon: Award, href: "/admin/brands" },
    { label: "News", value: news.total, note: `${news.visible} published`, icon: Newspaper, href: "/admin/news" },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening on the Enfinito website."
        actions={
          <ButtonLink href="/" target="_blank" rel="noopener noreferrer" variant="secondary">
            View website <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </ButtonLink>
        }
      />

      <div className={styles.stats}>
        {stats.map(({ label, value, note, icon: Icon, href, accent }) => (
          <Link key={label} href={href} className={styles.stat} data-accent={accent ? "" : undefined}>
            <span className={styles.statIcon} aria-hidden="true">
              <Icon size={18} strokeWidth={1.75} />
            </span>
            <span className={styles.statLabel}>{label}</span>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statNote}>{note}</span>
          </Link>
        ))}
      </div>

      <div className={styles.columns}>
        <Card
          title="Recent messages"
          description="The latest enquiries from the contact form."
          actions={
            <ButtonLink href="/admin/messages" variant="ghost" size="sm">
              View all <ArrowRight size={15} aria-hidden="true" />
            </ButtonLink>
          }
          flush
        >
          {recent.length ? (
            <ul className={styles.messages}>
              {recent.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/messages/${m.id}`} className={styles.message} prefetch={false}>
                    <span className={styles.avatar} aria-hidden="true">
                      {initials(m.fullName)}
                    </span>
                    <span className={styles.messageText}>
                      <span className={styles.messageName}>
                        {m.fullName}
                        <span className={styles.messageBusiness}>{m.businessName}</span>
                      </span>
                      <span className={styles.messagePreview}>{m.message}</span>
                    </span>
                    <span className={styles.messageMeta}>
                      <span className={styles.messageTime}>{timeAgo(m.createdAt)}</span>
                      {m.status === "new" ? <Badge tone="blue">New</Badge> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Inbox size={22} strokeWidth={1.75} />} title="No messages yet">
              Enquiries sent through the contact form will appear here.
            </EmptyState>
          )}
        </Card>

        <div className={styles.side}>
          <Card title="Quick actions">
            <div className={styles.quick}>
              <Link href="/admin/services/new" className={styles.quickLink}>
                <BriefcaseBusiness size={17} strokeWidth={1.75} aria-hidden="true" /> Add a service
              </Link>
              <Link href="/admin/products/new" className={styles.quickLink}>
                <Package size={17} strokeWidth={1.75} aria-hidden="true" /> Add a product
              </Link>
              <Link href="/admin/brands/new" className={styles.quickLink}>
                <Plus size={17} strokeWidth={1.75} aria-hidden="true" /> Add a brand
              </Link>
              <Link href="/admin/news/new" className={styles.quickLink}>
                <Newspaper size={17} strokeWidth={1.75} aria-hidden="true" /> Publish news
              </Link>
              <Link href="/admin/contact" className={styles.quickLink}>
                <MapPin size={17} strokeWidth={1.75} aria-hidden="true" /> Edit contact details
              </Link>
            </div>
          </Card>

          <Card title="Confirmation emails">
            <div className={styles.emailStatus}>
              <span className={styles.statIcon} aria-hidden="true">
                <Mail size={18} strokeWidth={1.75} />
              </span>
              <div>
                {emailConfigured && email.enabled ? (
                  <Badge tone="green">Active</Badge>
                ) : emailConfigured ? (
                  <Badge tone="amber">Turned off</Badge>
                ) : (
                  <Badge tone="neutral">Not set up</Badge>
                )}
                <p className={styles.emailText}>
                  {emailConfigured && email.enabled
                    ? `Sent from ${email.fromEmail} to everyone who uses the contact form.`
                    : "Add your SMTP details so people get a branded confirmation when they contact you."}
                </p>
                <Link href="/admin/settings/email" className={styles.inlineLink}>
                  Email settings <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
