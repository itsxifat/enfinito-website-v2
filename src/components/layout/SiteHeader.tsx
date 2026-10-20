"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, type FocusEvent, useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { NavItem, OfferingKind } from "@/content/types";
import { NavMenu, type NavMenuEntry } from "./NavMenu";
import styles from "./SiteHeader.module.css";

type SiteHeaderProps = {
  items: NavItem[];
  cta: NavItem;
  /** Entries for the Services and Products dropdowns. */
  menus: Record<OfferingKind, NavMenuEntry[]>;
};

/** A desktop dropdown that is open, and whether a click pinned it open. */
type OpenMenu = { kind: OfferingKind; pinned: boolean };

const isCurrent = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export function SiteHeader({ items, cta, menus }: SiteHeaderProps) {
  const pathname = usePathname();
  // The mobile menu remembers the page it was opened on, so any navigation
  // (including back/forward) closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // ---------- Desktop dropdowns ----------
  // Hovering previews a menu (after a short intent delay, with a grace
  // period on leaving). A click, tap, Enter or Space pins it open until
  // it's toggled again, Escape is pressed, or the user clicks or tabs away.
  const [menu, setMenu] = useState<OpenMenu | null>(null);
  const menuTimer = useRef<number | undefined>(undefined);
  const later = (update: () => void, ms: number) => {
    window.clearTimeout(menuTimer.current);
    menuTimer.current = window.setTimeout(update, ms);
  };
  const closeMenu = () => {
    window.clearTimeout(menuTimer.current);
    setMenu(null);
  };
  useEffect(() => () => window.clearTimeout(menuTimer.current), []);

  const close = () => {
    setOpenOn(null);
    closeMenu();
  };

  useEffect(() => {
    if (!menu) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) closeMenu();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const trigger = document.getElementById(`nav-trigger-${menu.kind}`);
      const hadFocus = trigger?.parentElement?.contains(document.activeElement);
      closeMenu();
      if (hadFocus) trigger?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menu]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenOn(null);
        toggleRef.current?.focus();
      }
    };
    const wide = window.matchMedia("(min-width: 860px)");
    const onWide = (e: MediaQueryListEvent) => {
      if (e.matches) setOpenOn(null);
    };

    const root = document.documentElement;
    root.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  // ---------- Marker on the bottom hairline ----------
  // A short blue line under the hovered item; otherwise under the open
  // menu's item, then the current page's. It's positioned by measuring, so
  // it glides between items of any width.
  const markerRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const activeHref = items.find((item) => !item.external && isCurrent(pathname, item.href))?.href ?? null;
  const menuHref = menu ? (items.find((item) => item.menu === menu.kind)?.href ?? null) : null;
  const markedHref = hovered ?? menuHref ?? activeHref;

  useEffect(() => {
    const nav = navRef.current;
    const marker = markerRef.current;
    const header = marker?.parentElement;
    if (!nav || !marker || !header) return;

    const place = () => {
      const target = markedHref
        ? nav.querySelector<HTMLElement>(`[data-nav-key="${CSS.escape(markedHref)}"]`)
        : null;
      if (!target || target.offsetWidth === 0) {
        marker.removeAttribute("data-visible");
        return;
      }
      const x = target.getBoundingClientRect().left - header.getBoundingClientRect().left;
      // Appearing: jump into place, then fade in, rather than sliding in.
      const appearing = !marker.hasAttribute("data-visible");
      if (appearing) marker.style.transition = "none";
      marker.style.setProperty("--x", `${x}px`);
      marker.style.setProperty("--w", String(target.offsetWidth));
      if (appearing) {
        void marker.offsetWidth;
        marker.style.transition = "";
      }
      marker.setAttribute("data-visible", "");
    };

    place();
    // Fonts loading or the window resizing move the items.
    const observer = new ResizeObserver(place);
    observer.observe(header);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [markedHref]);

  /** A nav item with a dropdown: a button on desktop (the page is linked
   *  from inside the menu), a plain link in the mobile menu. */
  const renderMenuItem = (item: NavItem, kind: OfferingKind, i: number) => {
    const isOpen = menu?.kind === kind;
    const onBlur = (e: FocusEvent<HTMLDivElement>) => {
      // Tabbing away closes it; clicks elsewhere are handled above.
      if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) closeMenu();
    };
    return (
      <div
        key={item.href}
        className={styles.navItem}
        onMouseEnter={() => {
          setHovered(item.href);
          later(() => setMenu((m) => (m?.kind === kind ? m : { kind, pinned: false })), menu ? 0 : 90);
        }}
        onMouseLeave={() => later(() => setMenu((m) => (m?.pinned ? m : null)), 180)}
        onBlur={onBlur}
      >
        <button
          type="button"
          id={`nav-trigger-${kind}`}
          className={`${styles.navLink} ${styles.navTrigger}`}
          aria-expanded={isOpen}
          aria-controls={`nav-menu-${kind}`}
          data-nav-key={item.href}
          data-current={activeHref === item.href || undefined}
          onClick={() => {
            window.clearTimeout(menuTimer.current);
            setMenu((m) => (m?.kind === kind && m.pinned ? null : { kind, pinned: true }));
          }}
        >
          {item.label}
          <ChevronDown className={styles.chevron} size={14} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <Link
          className={`${styles.navLink} ${styles.navMobileLink}`}
          href={item.href}
          aria-current={activeHref === item.href ? "page" : undefined}
          style={{ "--i": i } as CSSProperties}
          onClick={close}
        >
          {item.label}
        </Link>
        <NavMenu
          id={`nav-menu-${kind}`}
          label={item.label}
          href={item.href}
          entries={menus[kind]}
          open={isOpen}
          onNavigate={close}
        />
      </div>
    );
  };

  return (
    <header className={styles.header} data-open={open || undefined}>
      <Link className={styles.logo} href="/" aria-label="Enfinito home" onClick={close}>
        {/* Displayed at 33px tall (see CSS); 2× this size keeps it sharp on
            3× phone screens. */}
        <Image
          className={styles.logoImage}
          src="/en-logo.png"
          alt="Enfinito"
          width={290}
          height={66}
          loading="eager"
        />
      </Link>

      {/* Inline nav on desktop; a full-screen menu below 860px. */}
      <div className={styles.panel} id="site-menu">
        <nav className={styles.nav} aria-label="Primary" ref={navRef} onMouseLeave={() => setHovered(null)}>
          {items.map((item, i) => {
            if (item.menu && menus[item.menu].length > 0) return renderMenuItem(item, item.menu, i);
            const markHover = () => setHovered(item.href);
            return item.external ? (
              <a
                key={item.href}
                className={styles.navLink}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                data-nav-key={item.href}
                style={{ "--i": i } as CSSProperties}
                onMouseEnter={markHover}
                onClick={close}
              >
                {item.label}
                <ArrowUpRight className={styles.navExternal} size={14} strokeWidth={1.75} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <Link
                key={item.href}
                className={styles.navLink}
                href={item.href}
                aria-current={activeHref === item.href ? "page" : undefined}
                data-nav-key={item.href}
                style={{ "--i": i } as CSSProperties}
                onMouseEnter={markHover}
                onClick={close}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.panelFooter} style={{ "--i": items.length } as CSSProperties}>
          <ButtonLink className={styles.panelCta} href={cta.href} onClick={close}>
            {cta.label}
          </ButtonLink>
        </div>
      </div>

      <button
        ref={toggleRef}
        className={styles.toggle}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpenOn(open ? null : pathname)}
      >
        <span className={styles.toggleLine} />
        <span className={styles.toggleLine} />
      </button>

      <span className={styles.marker} ref={markerRef} aria-hidden="true" />
    </header>
  );
}
