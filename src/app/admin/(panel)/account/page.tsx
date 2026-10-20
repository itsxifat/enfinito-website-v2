import { LogOut, Monitor, Smartphone } from "lucide-react";
import type { Metadata } from "next";
import { PasswordForm, ProfileForm } from "@/components/admin/AccountForms";
import { Badge, Card, PageHeader } from "@/components/admin/ui/Layout";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { listSessions, requireSession } from "@/lib/server/auth";
import { formatDateTime, timeAgo } from "@/lib/format";
import { changePassword, signOutOtherSessions, updateProfile } from "./actions";
import styles from "./account.module.css";

export const instant = false;
export const metadata: Metadata = { title: "Account" };

function describeDevice(ua?: string): { label: string; mobile: boolean } {
  if (!ua) return { label: "Unknown device", mobile: false };
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Browser";
  const os = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "unknown system";
  return { label: `${browser} on ${os}`, mobile: /Mobile|iPhone|Android/.test(ua) };
}

export default async function AccountPage() {
  const session = await requireSession();
  const sessions = await listSessions(session);
  const others = sessions.filter((s) => !s.current).length;

  return (
    <>
      <PageHeader title="Account" description="Your profile, password and signed-in devices." />
      <div className={styles.grid}>
        <Card title="Profile">
          <ProfileForm action={updateProfile} name={session.user.name} email={session.user.email} />
        </Card>
        <Card title="Password" description="Changing it signs you out on your other devices.">
          <PasswordForm action={changePassword} />
        </Card>
        <Card
          title="Sessions"
          description="Devices signed in to your account. Sessions last 7 days."
          className={styles.wide}
          actions={
            others > 0 ? (
              <form action={signOutOtherSessions}>
                <SubmitButton variant="secondary" size="sm">
                  <LogOut size={15} aria-hidden="true" /> Sign out other sessions
                </SubmitButton>
              </form>
            ) : null
          }
          flush
        >
          <ul className={styles.sessions}>
            {sessions.map((s) => {
              const device = describeDevice(s.userAgent);
              const Icon = device.mobile ? Smartphone : Monitor;
              return (
                <li key={s.id} className={styles.session}>
                  <span className={styles.deviceIcon} aria-hidden="true">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className={styles.sessionText}>
                    <span className={styles.device}>
                      {device.label}
                      {s.current ? <Badge tone="green">This device</Badge> : null}
                    </span>
                    <span className={styles.sessionMeta} title={formatDateTime(s.createdAt)}>
                      {s.ip && s.ip !== "unknown" ? `${s.ip} · ` : ""}Signed in {timeAgo(s.createdAt)} · Active {timeAgo(s.lastSeenAt)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
