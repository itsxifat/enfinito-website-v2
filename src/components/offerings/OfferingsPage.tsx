import type { ReactNode } from "react";
import { PageIntro } from "@/components/layout/PageIntro";
import type { OfferingsCopy } from "@/content/types";
import styles from "./OfferingsPage.module.css";

/** Shell for the Services and Products pages: intro, then the list, or a
 *  short note while there's nothing to show. */
export function OfferingsPage({ copy, empty, children }: { copy: OfferingsCopy; empty: boolean; children: ReactNode }) {
  return (
    <>
      <PageIntro title={copy.page.title} intro={copy.page.intro} />
      <section className={styles.section} aria-label={copy.page.title}>
        {empty ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Coming soon</p>
            <p className={styles.emptyText}>{copy.page.empty}</p>
          </div>
        ) : (
          children
        )}
      </section>
    </>
  );
}
