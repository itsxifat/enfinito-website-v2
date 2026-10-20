"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { type CSSProperties, useEffect, useRef } from "react";
import type { Offering } from "@/content/types";
import { hostname } from "@/lib/format";
import styles from "./ProductStack.module.css";

/** Product cards that stick as you scroll, each sliding up over the last.
 *  A covered card eases back (`--cover`, 0 to 1), so the stack reads as
 *  layers. The CSS only makes the cards sticky on tall enough screens. */
export function ProductStack({ items }: { items: Offering[] }) {
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = list.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = Array.from(el.children) as HTMLElement[];
    let frame = 0;

    const update = () => {
      frame = 0;
      for (let i = 0; i < cards.length - 1; i++) {
        const current = cards[i].getBoundingClientRect();
        const next = cards[i + 1].getBoundingClientRect();
        const cover = Math.min(1, Math.max(0, 1 - (next.top - current.top) / current.height));
        cards[i].style.setProperty("--cover", cover.toFixed(3));
      }
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [items.length]);

  return (
    <ul className={styles.stack} ref={list}>
      {items.map((item, i) => {
        const Root = item.url ? "a" : "div";
        const linkProps = item.url ? { href: item.url, target: "_blank", rel: "noopener noreferrer" } : {};
        return (
          <li key={item.id} className={styles.item} style={{ "--i": i } as CSSProperties} data-reveal="block">
            <Root className={styles.card} {...linkProps}>
              <div className={styles.text}>
                <div className={styles.heading}>
                  <h3 className={styles.name}>{item.name}</h3>
                  <p className={styles.tagline}>{item.tagline}</p>
                </div>
                <div className={styles.footer}>
                  <p className={styles.description}>{item.description}</p>
                  {item.url ? (
                    <span className={styles.visit}>
                      Visit {hostname(item.url)}
                      <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </span>
                  ) : null}
                </div>
              </div>
              <div className={styles.media}>
                <Image src={item.image.src} alt="" fill sizes="(max-width: 860px) 100vw, 58vw" className={styles.image} />
              </div>
            </Root>
          </li>
        );
      })}
    </ul>
  );
}
