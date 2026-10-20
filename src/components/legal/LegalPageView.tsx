import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/PageIntro";
import type { LegalSlug } from "@/content/types";
import { getLegalPage } from "@/lib/server/data/legal";
import { parseRichText, RichText } from "./RichText";
import styles from "./LegalPageView.module.css";

const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

export async function legalMetadata(slug: LegalSlug): Promise<Metadata> {
  const page = await getLegalPage(slug);
  return { title: page.title };
}

/** A policy page: its title and last-updated date, contents beside the text
 *  on wide screens, then the text itself. */
export async function LegalPageView({ slug }: { slug: LegalSlug }) {
  const page = await getLegalPage(slug);
  const blocks = parseRichText(page.body);
  const contents = blocks.flatMap((block) => (block.type === "h2" ? [block] : []));

  return (
    <>
      <PageIntro
        title={page.title}
        intro={page.updatedAt ? `Last updated ${longDate.format(page.updatedAt)}` : undefined}
      />
      <section className={styles.layout} aria-label={page.title}>
        {contents.length > 2 ? (
          <nav className={styles.contents} aria-label="On this page">
            <p className={styles.contentsTitle}>On this page</p>
            <ul>
              {contents.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.text.replace(/\*\*/g, "")}</a>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <div />
        )}
        <RichText blocks={blocks} />
      </section>
    </>
  );
}
