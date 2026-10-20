import { Fragment } from "react";
import { GlassMark } from "@/components/brand/GlassMark";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { HeroContent } from "@/content/types";
import { RotatingWords } from "./RotatingWords";
import styles from "./Hero.module.css";

const listFormat = new Intl.ListFormat("en", { type: "conjunction" });

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.markArea}>
        <GlassMark className={styles.mark} />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title} id="hero-title">
          {content.titleLines.map((line, i) => (
            <Fragment key={line}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </h1>
        <p className={styles.lead}>
          {content.lead}{" "}
          <span className="sr-only">{listFormat.format(content.rotatingWords)}.</span>
          <RotatingWords words={content.rotatingWords} intervalMs={content.rotateIntervalMs} />
        </p>
        <div className={styles.actions}>
          <ButtonLink className={styles.cta} href={content.cta.href}>
            {content.cta.label}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
