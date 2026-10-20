import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AboutStats } from "@/components/about/AboutStats";
import { withEmphasis } from "@/components/about/emphasis";
import type { AboutContent } from "@/content/types";
import styles from "./AboutSection.module.css";

type Copy = { href: string; eyebrow: string; linkLabel: string };

/** Who Enfinito is, as one large statement: a typographic moment between
 *  the brand strip and the services. */
export function AboutSection({
  content,
  copy,
  spaced = false,
}: {
  content: AboutContent;
  copy: Copy;
  /** Add top spacing, for when nothing above provides it. */
  spaced?: boolean;
}) {
  return (
    <section className={styles.section} data-spaced={spaced ? "" : undefined} aria-labelledby="about-title">
      <div className={styles.grid}>
        <h2 className={styles.eyebrow} id="about-title" data-reveal>
          {copy.eyebrow}
        </h2>
        <div>
          <p className={styles.statement} data-reveal>
            {withEmphasis(content.statement)}
          </p>
          <div className={styles.footer} data-reveal style={{ "--reveal-i": 1 } as CSSProperties}>
            {content.summary ? <p className={styles.summary}>{content.summary}</p> : null}
            <Link href={copy.href} className={styles.more}>
              {copy.linkLabel}
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
      <AboutStats stats={content.stats} className={styles.stats} />
    </section>
  );
}
