import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { PageIntro } from "@/components/layout/PageIntro";
import { NewsCard } from "@/components/news/NewsCard";
import { newsPage } from "@/content/site";
import { getPublicNews } from "@/lib/server/data/news";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: newsPage.title,
  description: newsPage.intro,
};

export default async function NewsPage() {
  const [featured, ...rest] = await getPublicNews();

  return (
    <>
      <PageIntro title={newsPage.title} intro={newsPage.intro} />

      <section className={styles.section} aria-label="Articles">
        {featured ? (
          <>
            <div data-reveal="block">
              <NewsCard item={featured} featured />
            </div>
            {rest.length ? (
              <ul className={styles.grid}>
                {rest.map((item, i) => (
                  <li key={item.id} data-reveal="block" style={{ "--reveal-i": i % 3 } as CSSProperties}>
                    <NewsCard item={item} />
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No news yet</p>
            <p className={styles.emptyText}>New articles will appear here as soon as they&apos;re published.</p>
          </div>
        )}
      </section>
    </>
  );
}
