import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AboutStats } from "@/components/about/AboutStats";
import { plainText } from "@/components/about/emphasis";
import { CareersSection } from "@/components/home/CareersSection";
import { PageIntro } from "@/components/layout/PageIntro";
import { aboutCopy, careers, offeringsCopy } from "@/content/site";
import type { Offering } from "@/content/types";
import { getAbout, paragraphs } from "@/lib/server/data/about";
import { getPublicOfferings } from "@/lib/server/data/offerings";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  return { title: "About", description: about.intro || plainText(about.statement) };
}

/** A compact list of services or products, each linking to its own site. */
function OfferingIndex({ title, href, items }: { title: string; href: string; items: Offering[] }) {
  if (items.length === 0) return null;
  return (
    <div data-reveal="block">
      <h3 className={styles.indexTitle}>{title}</h3>
      <ul className={styles.indexList}>
        {items.map((item) => {
          const content = (
            <>
              <span className={styles.indexName}>{item.name}</span>
              <span className={styles.indexTagline}>{item.tagline}</span>
            </>
          );
          return (
            <li key={item.id}>
              {item.url ? (
                <a className={styles.indexLink} href={item.url} target="_blank" rel="noopener noreferrer">
                  {content}
                  <ArrowUpRight className={styles.indexArrow} size={20} strokeWidth={1.75} aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <Link className={styles.indexLink} href={href}>
                  {content}
                  <ArrowRight className={styles.indexArrow} size={20} strokeWidth={1.75} aria-hidden="true" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default async function AboutPage() {
  const [about, services, products] = await Promise.all([
    getAbout(),
    getPublicOfferings("service"),
    getPublicOfferings("product"),
  ]);
  const story = paragraphs(about.story);

  return (
    <>
      <PageIntro title={aboutCopy.pageTitle} intro={about.intro || undefined} />

      {about.image ? (
        <figure className={styles.cover} data-reveal="block">
          <Image
            src={about.image.src}
            alt=""
            fill
            sizes="100vw"
            className={styles.coverImage}
          />
        </figure>
      ) : null}

      {story.length ? (
        <section className={`${styles.section} ${styles.story}`} aria-labelledby="story-title">
          <h2 className={styles.sectionTitle} id="story-title" data-reveal>
            {about.storyTitle}
          </h2>
          <div className={styles.storyBody}>
            {story.map((paragraph, i) => (
              <p key={i} data-reveal>
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {about.values.length ? (
        <section className={styles.section} aria-labelledby="values-title">
          <h2 className={styles.sectionTitle} id="values-title" data-reveal>
            {about.valuesTitle}
          </h2>
          <ul className={styles.values} data-cols={about.values.length % 3 === 0 ? 3 : 2}>
            {about.values.map((value, i) => (
              <li
                key={`${value.title}-${i}`}
                className={styles.value}
                data-reveal
                style={{ "--reveal-i": i % 3 } as CSSProperties}
              >
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueText}>{value.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {about.stats.length ? (
        <section className={styles.section} aria-label="Key figures">
          <AboutStats stats={about.stats} />
        </section>
      ) : null}

      {services.length + products.length ? (
        <section className={styles.section} aria-labelledby="offerings-title">
          <div className={styles.offeringsHead}>
            <h2 className={styles.sectionTitle} id="offerings-title" data-reveal>
              {aboutCopy.offerings.title}
            </h2>
            <p className={styles.offeringsIntro} data-reveal style={{ "--reveal-i": 1 } as CSSProperties}>
              {aboutCopy.offerings.intro}
            </p>
          </div>
          <div className={styles.indexes}>
            <OfferingIndex title={offeringsCopy.service.page.title} href={offeringsCopy.service.href} items={services} />
            <OfferingIndex title={offeringsCopy.product.page.title} href={offeringsCopy.product.href} items={products} />
          </div>
        </section>
      ) : null}

      <CareersSection content={careers} />
    </>
  );
}
