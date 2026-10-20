"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { type CSSProperties, type MouseEvent, useRef, useState } from "react";
import type { Offering } from "@/content/types";
import { hostname } from "@/lib/format";
import styles from "./ServicesShowcase.module.css";

type PanelItem = Pick<Offering, "name" | "tagline" | "description" | "image" | "url">;

/** Must match the container query in the CSS: narrower lists become a
 *  swipeable carousel where every panel is open. */
const PANELS_MIN_WIDTH = 760;

function ServicePanel({
  item,
  active,
  preview = false,
  index = 0,
}: {
  item: PanelItem;
  active: boolean;
  preview?: boolean;
  /** Position in the row, for the staggered scroll reveal. */
  index?: number;
}) {
  const linked = Boolean(item.url) && !preview;
  const Root = linked ? "a" : "div";
  // Unlinked panels still take focus so keyboard users can open them.
  const rootProps = linked
    ? { href: item.url, target: "_blank", rel: "noopener noreferrer" }
    : preview
      ? {}
      : { tabIndex: 0 };

  return (
    <Root
      className={styles.panel}
      data-active={active ? "" : undefined}
      data-reveal={preview ? undefined : "block"}
      style={{ "--reveal-i": index } as CSSProperties}
      {...rootProps}
    >
      <div className={styles.media}>
        {item.image.src ? (
          <Image
            src={item.image.src}
            alt=""
            fill
            sizes="(max-width: 860px) 86vw, 66vw"
            className={styles.image}
            unoptimized={item.image.src.startsWith("blob:")}
          />
        ) : null}
      </div>
      <span className={styles.label} aria-hidden="true">
        {item.name || "Name"}
      </span>
      {item.url ? (
        <span className={styles.badge} aria-hidden="true">
          <ArrowUpRight size={20} strokeWidth={1.75} />
        </span>
      ) : null}
      <div className={styles.card}>
        <h3 className={styles.name}>{item.name || "Name"}</h3>
        <p className={styles.tagline}>{item.tagline || "Tagline"}</p>
        <p className={styles.description}>{item.description || "A short description of what it offers."}</p>
        {item.url ? (
          <span className={styles.visit}>
            {hostname(item.url)}
            <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" />
            {preview ? null : <span className="sr-only">(opens in a new tab)</span>}
          </span>
        ) : null}
      </div>
    </Root>
  );
}

/** Side-by-side panels; the one under the pointer (or keyboard focus) opens
 *  wide to reveal its banner and details. */
export function ServicesShowcase({ items }: { items: Offering[] }) {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLUListElement>(null);

  // On touch screens the first tap opens a closed panel instead of
  // following its link straight away.
  function onClick(event: MouseEvent, index: number) {
    if (index === active || !list.current) return;
    const panelsLayout = list.current.clientWidth >= PANELS_MIN_WIDTH;
    if (panelsLayout && window.matchMedia("(hover: none)").matches) {
      event.preventDefault();
      setActive(index);
    }
  }

  return (
    <div className={styles.wrap}>
      <ul className={styles.panels} ref={list}>
        {items.map((item, i) => (
          <li
            key={item.id}
            className={styles.item}
            data-active={i === active ? "" : undefined}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={(e) => onClick(e, i)}
          >
            <ServicePanel item={item} active={i === active} index={i} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One open panel, as on a phone. For the admin form's preview. */
export function ServicePreview({ item }: { item: PanelItem }) {
  return (
    <div className={styles.wrap} data-preview="">
      <ul className={styles.panels}>
        <li className={styles.item} data-active="">
          <ServicePanel item={item} active preview />
        </li>
      </ul>
    </div>
  );
}
