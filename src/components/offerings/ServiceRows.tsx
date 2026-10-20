import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { Offering } from "@/content/types";
import { hostname } from "@/lib/format";
import styles from "./ServiceRows.module.css";

/** The Services page: one editorial row per service, banner and copy
 *  alternating sides. */
export function ServiceRows({ items }: { items: Offering[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item, i) => {
        const Root = item.url ? "a" : "div";
        const linkProps = item.url ? { href: item.url, target: "_blank", rel: "noopener noreferrer" } : {};
        return (
          <li key={item.id} className={styles.item} data-reveal="block">
            <Root className={styles.row} data-flip={i % 2 === 1 ? "" : undefined} {...linkProps}>
              <div className={styles.media}>
                <Image src={item.image.src} alt="" fill sizes="(max-width: 860px) 100vw, 58vw" className={styles.image} />
              </div>
              <div className={styles.text}>
                <h2 className={styles.name}>{item.name}</h2>
                <p className={styles.tagline}>{item.tagline}</p>
                <p className={styles.description}>{item.description}</p>
                {item.url ? (
                  <span className={styles.visit}>
                    Visit {hostname(item.url)}
                    <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </span>
                ) : null}
              </div>
            </Root>
          </li>
        );
      })}
    </ul>
  );
}
