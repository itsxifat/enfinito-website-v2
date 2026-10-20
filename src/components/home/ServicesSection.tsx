import type { Offering, OfferingsCopy } from "@/content/types";
import { SectionHead } from "./SectionHead";
import { ServicesShowcase } from "./ServicesShowcase";
import styles from "./ServicesSection.module.css";

/** Up to five panels side by side; any more are on the Services page. */
const LIMIT = 5;

export function ServicesSection({
  id,
  copy,
  items,
  spaced = false,
}: {
  id: string;
  copy: OfferingsCopy;
  items: Offering[];
  /** Add top spacing, for when nothing above provides it. */
  spaced?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <section className={styles.section} data-spaced={spaced ? "" : undefined} aria-labelledby={`${id}-title`}>
      <SectionHead
        id={`${id}-title`}
        title={copy.section.title}
        intro={copy.section.intro}
        link={{ href: copy.href, label: copy.section.linkLabel }}
      />
      <ServicesShowcase items={items.slice(0, LIMIT)} />
    </section>
  );
}
