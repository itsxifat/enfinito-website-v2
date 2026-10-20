import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import styles from "./SectionHead.module.css";

/** Home section heading: headline on the left, a lead and a link to the
 *  full page on the right. */
export function SectionHead({
  id,
  title,
  intro,
  link,
}: {
  id: string;
  title: string;
  intro: string;
  link: { href: string; label: string };
}) {
  return (
    <div className={styles.head}>
      <h2 className={styles.title} id={id} data-reveal>
        {title}
      </h2>
      <div className={styles.aside} data-reveal style={{ "--reveal-i": 1 } as CSSProperties}>
        <p className={styles.intro}>{intro}</p>
        <Link href={link.href} className={styles.more}>
          {link.label}
          <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
