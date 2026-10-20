import type { CSSProperties } from "react";
import styles from "./PageIntro.module.css";

/** Opening block for inner pages: large title and a short lead, clearing
 *  the overlaid site header. */
export function PageIntro({ title, intro, id }: { title: string; intro?: string; id?: string }) {
  return (
    <header className={styles.intro}>
      <h1 className={styles.title} id={id} data-reveal>
        {title}
      </h1>
      {intro ? (
        <p className={styles.lead} data-reveal style={{ "--reveal-i": 1 } as CSSProperties}>
          {intro}
        </p>
      ) : null}
    </header>
  );
}
