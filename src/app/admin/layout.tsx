import type { Metadata } from "next";
import styles from "./admin.module.css";

// Every admin page reads the session and fresh data per request, so the
// area may block on navigation. Each page also sets `instant = false`, since
// pages are validated individually in development.
export const instant = false;

export const metadata: Metadata = {
  title: { template: "%s · Enfinito Admin", default: "Enfinito Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className={styles.root}>{children}</div>;
}
