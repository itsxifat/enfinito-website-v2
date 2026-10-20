import Image from "next/image";
import type { CSSProperties } from "react";
import type { Brand } from "@/content/types";
import { logoSize } from "./logo-size";
import styles from "./TrustedBrands.module.css";

function LogoSet({ brands, duplicate = false }: { brands: Brand[]; duplicate?: boolean }) {
  return (
    <ul className={styles.set} aria-hidden={duplicate || undefined}>
      {brands.map((brand, i) => {
        const size = logoSize(brand.logo);
        const logo = (
          <Image
            className={styles.logo}
            src={brand.logo.src}
            alt={brand.name}
            {...size}
            style={{ "--w": `${size.width}px`, "--h": `${size.height}px` } as CSSProperties}
          />
        );
        return (
          <li key={`${brand.name}-${i}`} className={styles.item}>
            {brand.url ? (
              <a
                href={brand.url}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={duplicate ? -1 : undefined}
              >
                {logo}
              </a>
            ) : (
              logo
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function TrustedBrands({ title, brands }: { title: string; brands: Brand[] }) {
  if (brands.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="brands-title">
      <h2 className={styles.title} id="brands-title" data-reveal>
        {title}
      </h2>

      {/* Two identical sets scroll by one set's width, so the loop is seamless. */}
      <div
        className={styles.marquee}
        style={{ "--count": brands.length, "--reveal-i": 1 } as CSSProperties}
        data-reveal="block"
      >
        <div className={styles.track}>
          <LogoSet brands={brands} />
          <LogoSet brands={brands} duplicate />
        </div>
      </div>
    </section>
  );
}
