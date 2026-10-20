"use client";

import {
  Award,
  BriefcaseBusiness,
  ExternalLink,
  Inbox,
  Info,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Mail,
  MapPin,
  Menu,
  Newspaper,
  Package,
  PanelBottom,
  Scale,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, Suspense, useEffect, useState } from "react";
import { signOut } from "@/app/admin/actions";
import styles from "./AdminShell.module.css";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean; badge?: "messages" };

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/messages", label: "Messages", icon: Inbox, badge: "messages" },
    ],
  },
  {
    group: "Website",
    items: [
      { href: "/admin/services", label: "Services", icon: BriefcaseBusiness },
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/brands", label: "Brands", icon: Award },
      { href: "/admin/news", label: "News", icon: Newspaper },
      { href: "/admin/about", label: "About page", icon: Info },
      { href: "/admin/contact", label: "Contact page", icon: MapPin },
      { href: "/admin/footer", label: "Footer", icon: PanelBottom },
      { href: "/admin/legal", label: "Legal pages", icon: Scale },
    ],
  },
  {
    group: "Settings",
    items: [
      { href: "/admin/settings/email", label: "Email", icon: Mail },
      { href: "/admin/team", label: "Team", icon: Users },
      { href: "/admin/account", label: "Account", icon: UserRound },
    ],
  },
];

type ShellUser = { name: string; email: string; role: string };

function NavList({
  pathname,
  newMessages,
  onNavigate,
}: {
  pathname: string | null;
  newMessages: number;
  onNavigate: () => void;
}) {
  return (
    <nav className={styles.nav} aria-label="Admin">
      {NAV.map(({ group, items }) => (
        <div className={styles.group} key={group}>
          <p className={styles.groupLabel}>{group}</p>
          <ul>
            {items.map(({ href, label, icon: Icon, exact, badge }) => {
              const active = pathname !== null && (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
              return (
                <li key={href}>
                  <Link
                    className={styles.link}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span>{label}</span>
                    {badge === "messages" && newMessages > 0 ? (
                      <span className={styles.count} aria-label={`${newMessages} new`}>
                        {newMessages > 99 ? "99+" : newMessages}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function ActiveNavList(props: { newMessages: number; onNavigate: () => void }) {
  return <NavList pathname={usePathname()} {...props} />;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("") || "A";

export function AdminShell({
  user,
  newMessages,
  children,
}: {
  user: ShellUser;
  newMessages: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const logo = (
    <Link href="/admin" className={styles.logo} onClick={close} aria-label="Enfinito admin home">
      <Image src="/en-logo.png" alt="Enfinito" width={232} height={53} className={styles.logoImage} loading="eager" />
      <span className={styles.tag}>Admin</span>
    </Link>
  );

  return (
    <div className={styles.shell} data-open={open || undefined}>
      <header className={styles.topbar}>
        {logo}
        <button
          type="button"
          className={styles.menuButton}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="admin-sidebar"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
        </button>
      </header>

      <div className={styles.scrim} onClick={close} aria-hidden="true" />

      <aside className={styles.sidebar} id="admin-sidebar">
        <div className={styles.sidebarHead}>{logo}</div>

        <Suspense fallback={<NavList pathname={null} newMessages={newMessages} onNavigate={close} />}>
          <ActiveNavList newMessages={newMessages} onNavigate={close} />
        </Suspense>

        <div className={styles.sidebarFoot}>
          <a className={styles.viewSite} href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" />
            View website
          </a>
          <div className={styles.user}>
            <span className={styles.avatar} aria-hidden="true">
              {initials(user.name)}
            </span>
            <span className={styles.userText}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </span>
            <form action={signOut}>
              <button type="submit" className={styles.signOut} aria-label="Sign out" title="Sign out">
                <LogOut size={17} strokeWidth={1.75} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className={styles.main} id="admin-main">
        {children}
      </main>
    </div>
  );
}
