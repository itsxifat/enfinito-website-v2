import type { CSSProperties } from "react";
import type { AboutStat } from "@/content/types";
import styles from "./AboutStats.module.css";

/** Key figures in a hairline-divided row. Each label precedes its figure in
 *  the markup (as a definition list needs) but sits below it on screen. */
export function AboutStats({ stats, className }: { stats: AboutStat[]; className?: string }) {
  if (stats.length === 0) return null;
  return (
    <dl
      className={[styles.stats, className].filter(Boolean).join(" ")}
      style={{ "--count": stats.length } as CSSProperties}
    >
      {stats.map((stat, i) => (
        <div key={`${stat.label}-${i}`} className={styles.stat} data-reveal style={{ "--reveal-i": i } as CSSProperties}>
          <dt className={styles.label}>{stat.label}</dt>
          <dd className={styles.value}>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
