import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import type { Offering } from "@/content/types";
import { hostname } from "@/lib/format";
import styles from "./ProductTile.module.css";

type Props = {
  item: Pick<Offering, "name" | "tagline" | "description" | "image" | "url">;
  /** Full width: copy beside the banner. */
  wide?: boolean;
  /** Admin preview: render without a real link. */
  preview?: boolean;
};

/** A product on a soft surface, its banner rising from the bottom edge like
 *  a screenshot. */
export function ProductTile({ item, wide = false, preview = false }: Props) {
  const linked = Boolean(item.url) && !preview;
  const Root = linked ? "a" : "div";
  const linkProps = linked ? { href: item.url, target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Root className={styles.tile} data-wide={wide ? "" : undefined} {...linkProps}>
      <div className={styles.text}>
        <h2 className={styles.name}>{item.name || "Name"}</h2>
        <p className={styles.tagline}>{item.tagline || "Tagline"}</p>
        <p className={styles.description}>{item.description || "A short description of what it offers."}</p>
        {item.url ? (
          <span className={styles.visit}>
            Visit {hostname(item.url)}
            <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
            {preview ? null : <span className="sr-only">(opens in a new tab)</span>}
          </span>
        ) : null}
      </div>
      <div className={styles.media}>
        {item.image.src ? (
          <Image
            src={item.image.src}
            alt=""
            fill
            sizes={wide ? "(max-width: 860px) 100vw, 58vw" : "(max-width: 860px) 100vw, 50vw"}
            className={styles.image}
            unoptimized={item.image.src.startsWith("blob:")}
          />
        ) : null}
      </div>
    </Root>
  );
}

/** Two columns; with an odd count the first tile runs full width. */
export function ProductGrid({ items }: { items: Offering[] }) {
  const wideFirst = items.length % 2 === 1;
  return (
    <ul className={styles.grid}>
      {items.map((item, i) => {
        const wide = wideFirst && i === 0;
        return (
          <li
            key={item.id}
            className={styles.cell}
            data-wide={wide ? "" : undefined}
            data-reveal="block"
            style={{ "--reveal-i": i % 2 } as CSSProperties}
          >
            <ProductTile item={item} wide={wide} />
          </li>
        );
      })}
    </ul>
  );
}
