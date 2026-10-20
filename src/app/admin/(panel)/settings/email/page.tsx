import type { Metadata } from "next";
import { EmailSettingsForm, TestEmailForm } from "@/components/admin/EmailSettingsForm";
import { Badge, Card, PageHeader, SplitLayout } from "@/components/admin/ui/Layout";
import { requireUser } from "@/lib/server/auth";
import { isEmailConfigured, loadEmailSettings } from "@/lib/server/data/settings";
import { saveEmail, sendTest } from "./actions";
import styles from "./email.module.css";

export const instant = false;
export const metadata: Metadata = { title: "Email settings" };

const PROVIDERS = [
  { name: "Gmail / Google Workspace", host: "smtp.gmail.com", detail: "SSL/TLS, port 465. Use an app password (Google Account → Security → App passwords)." },
  { name: "Microsoft 365 / Outlook", host: "smtp.office365.com", detail: "STARTTLS, port 587. SMTP sending must be enabled for the mailbox." },
  { name: "Zoho Mail", host: "smtp.zoho.com", detail: "SSL/TLS, port 465." },
];

export default async function EmailSettingsPage() {
  const user = await requireUser();
  const settings = await loadEmailSettings();
  const configured = isEmailConfigured(settings);

  return (
    <>
      <PageHeader
        title="Email"
        description="The account your website sends confirmation emails from."
        actions={
          configured && settings.enabled ? (
            <Badge tone="green">Active</Badge>
          ) : configured ? (
            <Badge tone="amber">Turned off</Badge>
          ) : (
            <Badge>Not set up</Badge>
          )
        }
      />

      <SplitLayout
        main={
          <EmailSettingsForm
            action={saveEmail}
            values={{
              enabled: settings.enabled,
              host: settings.host,
              port: settings.port,
              secure: settings.secure,
              user: settings.user,
              hasPassword: Boolean(settings.passwordEnc),
              fromName: settings.fromName,
              fromEmail: settings.fromEmail,
              replyTo: settings.replyTo,
              notifyEmail: settings.notifyEmail,
            }}
          />
        }
        aside={
          <>
            <Card title="Test your settings" description="Save first, then send yourself a test.">
              <TestEmailForm action={sendTest} defaultTo={user.email} />
            </Card>
            <Card title="Common providers">
              <ul className={styles.providers}>
                {PROVIDERS.map((p) => (
                  <li key={p.name}>
                    <p className={styles.providerName}>{p.name}</p>
                    <p className={styles.providerHost}>{p.host}</p>
                    <p className={styles.providerDetail}>{p.detail}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </>
        }
      />
    </>
  );
}
