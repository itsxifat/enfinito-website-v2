import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { NewsItem } from "@/content/types";
import styles from "./NewsCard.module.css";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatNewsDate(date: Date): string {
  return dateFormat.format(date);
}

type Props = {
  item: Pick<NewsItem, "title" | "subtitle" | "image" | "url" | "publishedAt">;
  featured?: boolean;
  /** Admin preview: render without a real link. */
  preview?: boolean;
};

/** Links out to the full article, which lives on the blog. */
export function NewsCard({ item, featured = false, preview = false }: Props) {
  const Root = preview ? "div" : "a";
  const linkProps = preview ? {} : { href: item.url, target: "_blank", rel: "noopener noreferrer" };

  return (
    <Root className={styles.card} data-featured={featured ? "" : undefined} {...linkProps}>
      <div className={styles.media}>
        {item.image.src ? (
          <Image
            src={item.image.src}
            alt=""
            fill
            sizes={featured ? "(max-width: 860px) 100vw, 58vw" : "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"}
            className={styles.image}
            unoptimized={item.image.src.startsWith("blob:")}
          />
        ) : null}
      </div>
      <div className={styles.body}>
        <time className={styles.date} dateTime={item.publishedAt.toISOString().slice(0, 10)}>
          {formatNewsDate(item.publishedAt)}
        </time>
        <h2 className={styles.title}>{item.title || "Headline"}</h2>
        <p className={styles.subtitle}>{item.subtitle || "Sub-headline"}</p>
        <span className={styles.more}>
          Read article <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
          {preview ? null : <span className="sr-only">(opens in a new tab)</span>}
        </span>
      </div>
    </Root>
  );
}
