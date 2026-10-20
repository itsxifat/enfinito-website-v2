import type { Offering, OfferingsCopy } from "@/content/types";
import { ProductStack } from "./ProductStack";
import { SectionHead } from "./SectionHead";
import styles from "./ProductsSection.module.css";

const LIMIT = 6;

export function ProductsSection({
  id,
  copy,
  items,
  spaced = false,
}: {
  id: string;
  copy: OfferingsCopy;
  items: Offering[];
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
      <ProductStack items={items.slice(0, LIMIT)} />
    </section>
  );
}
