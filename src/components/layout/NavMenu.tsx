"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useLayoutEffect, useRef } from "react";
import type { Offering } from "@/content/types";
import styles from "./NavMenu.module.css";

export type NavMenuEntry = Pick<Offering, "id" | "name" | "tagline" | "image" | "url">;

/** Up to four entries per column; a fifth starts a second column, and so on
 *  up to three. Entries read down each column. */
const ROWS = 4;
const MAX_COLUMNS = 3;
/** Space kept between the menu and the edges of the window. */
const EDGE = 16;

/** Desktop dropdown under Services or Products: each one with its banner,
 *  name and tagline, linking to its own site, plus a link to the full page. */
export function NavMenu({
  id,
  label,
  href,
  entries,
  open,
  onNavigate,
}: {
  id: string;
  label: string;
  href: string;
  entries: NavMenuEntry[];
  open: boolean;
  onNavigate: () => void;
}) {
  const columns = Math.min(MAX_COLUMNS, Math.ceil(entries.length / ROWS));
  const rows = Math.ceil(entries.length / columns);
  const menu = useRef<HTMLDivElement>(null);

  // A wide menu could run off the window; shift it left just enough to fit.
  useLayoutEffect(() => {
    const el = menu.current;
    if (!el || !open) return;
    const fit = () => {
      el.style.setProperty("--shift", "0px");
      const { left, right } = el.getBoundingClientRect();
      const overflow = right - (document.documentElement.clientWidth - EDGE);
      el.style.setProperty("--shift", `${-Math.max(0, Math.min(overflow, left - EDGE))}px`);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [open, columns]);

  return (
    // Inert while closed, so its links leave the tab order at once, even as
    // the menu is still fading out.
    <div
      ref={menu}
      className={styles.menu}
      id={id}
      data-open={open || undefined}
      inert={!open}
      style={{ "--cols": columns, "--rows": rows } as CSSProperties}
    >
      <div className={styles.card}>
        <ul className={styles.list} aria-label={label}>
          {entries.map((entry) => {
            const content = (
              <>
                <span className={styles.thumb}>
                  <Image src={entry.image.src} alt="" fill sizes="72px" className={styles.thumbImage} />
                </span>
                <span className={styles.text}>
                  <span className={styles.name}>{entry.name}</span>
                  <span className={styles.tagline}>{entry.tagline}</span>
                </span>
              </>
            );
            return (
              <li key={entry.id}>
                {entry.url ? (
                  <a className={styles.link} href={entry.url} target="_blank" rel="noopener noreferrer" onClick={onNavigate}>
                    {content}
                    <ArrowUpRight className={styles.arrow} size={16} strokeWidth={1.75} aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : (
                  <Link className={styles.link} href={href} onClick={onNavigate}>
                    {content}
                    <ArrowRight className={styles.arrow} size={16} strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <Link className={styles.all} href={href} onClick={onNavigate}>
          All {label.toLowerCase()}
          <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
