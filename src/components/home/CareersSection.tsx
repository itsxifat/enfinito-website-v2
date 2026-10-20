import { ArrowUpRight } from "lucide-react";
import { MARK_PATH, MARK_VIEWBOX } from "@/components/brand/markShape";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { CareersContent } from "@/content/types";
import type { CSSProperties } from "react";
import styles from "./CareersSection.module.css";

const { width: W, height: H } = MARK_VIEWBOX;

/** The brand mark as clear glass on blue: a pale fill, a lit rim and a
 *  sheen, echoing the tinted mark in the hero. */
function MarkOnBlue({ className }: { className: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="careers-fill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2={H}>
          <stop offset="0" stopColor="#fff" stopOpacity=".26" />
          <stop offset="1" stopColor="#fff" stopOpacity=".04" />
        </linearGradient>
        <linearGradient id="careers-sheen" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2={H}>
          <stop offset=".24" stopColor="#fff" stopOpacity="0" />
          <stop offset=".33" stopColor="#fff" stopOpacity=".22" />
          <stop offset=".38" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="careers-rim" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2={H}>
          <stop offset="0" stopColor="#fff" stopOpacity=".7" />
          <stop offset=".6" stopColor="#fff" stopOpacity=".2" />
          <stop offset="1" stopColor="#fff" stopOpacity=".08" />
        </linearGradient>
      </defs>
      <path d={MARK_PATH} fill="url(#careers-fill)" />
      <path d={MARK_PATH} fill="url(#careers-sheen)" />
      <path d={MARK_PATH} fill="none" stroke="url(#careers-rim)" strokeWidth="3" />
    </svg>
  );
}

/** Invitation to the careers site, the closing moment of the home page. */
export function CareersSection({ content, spaced = false }: { content: CareersContent; spaced?: boolean }) {
  return (
    <section className={styles.section} data-spaced={spaced ? "" : undefined} aria-labelledby="careers-title">
      <div className={styles.panel} data-reveal="block">
        <MarkOnBlue className={styles.mark} />
        <div className={styles.content} data-reveal style={{ "--reveal-i": 2 } as CSSProperties}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h2 className={styles.title} id="careers-title">
            {content.title}
          </h2>
          <p className={styles.intro}>{content.intro}</p>
          <ButtonLink
            variant="light"
            className={styles.cta}
            href={content.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {content.cta}
            <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
