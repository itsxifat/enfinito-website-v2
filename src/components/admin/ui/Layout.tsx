import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Layout.module.css";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className={styles.header}>
      <div className={styles.headerText}>
        {back ? (
          <Link className={styles.back} href={back.href}>
            <ArrowLeft size={15} aria-hidden="true" />
            {back.label}
          </Link>
        ) : null}
        <h1 className={styles.title}>{title}</h1>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.headerActions}>{actions}</div> : null}
    </header>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  flush,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /** No inner padding (tables, lists). */
  flush?: boolean;
  className?: string;
}) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(" ")}>
      {title ? (
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>{title}</h2>
            {description ? <p className={styles.cardDescription}>{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      <div className={flush ? undefined : styles.cardBody}>{children}</div>
    </section>
  );
}

export type BadgeTone = "neutral" | "blue" | "green" | "amber" | "red";

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={styles.badge} data-tone={tone}>
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon} aria-hidden="true">
        {icon}
      </span>
      <p className={styles.emptyTitle}>{title}</p>
      {children ? <p className={styles.emptyText}>{children}</p> : null}
      {action ? <div className={styles.emptyAction}>{action}</div> : null}
    </div>
  );
}

/** Two-column editor layout: form on the left, preview/aside on the right. */
export function SplitLayout({ main, aside }: { main: ReactNode; aside: ReactNode }) {
  return (
    <div className={styles.split}>
      <div className={styles.splitMain}>{main}</div>
      <aside className={styles.splitAside}>{aside}</aside>
    </div>
  );
}
