import { Eye, EyeOff, Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/admin/ui/Button";
import { ConfirmSubmit } from "@/components/admin/ui/ConfirmSubmit";
import { FormMessage } from "@/components/admin/ui/Form";
import { Badge, Card, EmptyState, PageHeader } from "@/components/admin/ui/Layout";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import table from "@/components/admin/ui/Table.module.css";
import { requireUser } from "@/lib/server/auth";
import { listNews } from "@/lib/server/data/news";
import { formatDate } from "@/lib/format";
import { deleteNewsAction, toggleNewsAction } from "./actions";
import styles from "./news.module.css";

export const instant = false;
export const metadata: Metadata = { title: "News" };

const host = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export default async function NewsAdminPage({ searchParams }: PageProps<"/admin/news">) {
  await requireUser();
  const [{ saved }, articles] = await Promise.all([searchParams, listNews()]);

  return (
    <>
      <PageHeader
        title="News"
        description="Articles on the News page. Each card links to the full story on your blog."
        actions={
          <ButtonLink href="/admin/news/new" variant="primary">
            <Plus size={16} aria-hidden="true" /> New article
          </ButtonLink>
        }
      />

      {saved ? (
        <div className={styles.notice}>
          <FormMessage ok>Article saved. The News page is updated.</FormMessage>
        </div>
      ) : null}

      <Card flush>
        {articles.length ? (
          <div className={table.scroll}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th>Article</th>
                  <th className={table.hideMobile}>Link</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className={styles.article}>
                        <span className={styles.thumb}>
                          <Image src={a.image.src} alt="" fill sizes="96px" className={styles.thumbImage} />
                        </span>
                        <span className={styles.articleText}>
                          <Link href={`/admin/news/${a.id}`} className={`${table.primary} ${styles.title}`}>
                            {a.title}
                          </Link>
                          <span className={`${table.secondary} ${styles.subtitle}`}>{a.subtitle}</span>
                        </span>
                      </div>
                    </td>
                    <td className={table.hideMobile}>
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className={table.secondary}>
                        {host(a.url)}
                      </a>
                    </td>
                    <td className={table.secondary} style={{ whiteSpace: "nowrap" }}>
                      {formatDate(a.publishedAt)}
                    </td>
                    <td>{a.visible ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}</td>
                    <td>
                      <div className={table.actions}>
                        <form action={toggleNewsAction.bind(null, a.id, !a.visible)}>
                          <SubmitButton
                            variant="ghost"
                            size="icon"
                            aria-label={a.visible ? "Unpublish" : "Publish"}
                            title={a.visible ? "Unpublish" : "Publish"}
                          >
                            {a.visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                          </SubmitButton>
                        </form>
                        <ButtonLink href={`/admin/news/${a.id}`} variant="ghost" size="icon" aria-label="Edit" title="Edit">
                          <Pencil size={16} aria-hidden="true" />
                        </ButtonLink>
                        <form action={deleteNewsAction.bind(null, a.id, false)}>
                          <ConfirmSubmit
                            variant="ghost"
                            size="icon"
                            aria-label="Delete"
                            title="Delete this article?"
                            description={`“${a.title}” and its image will be removed from the News page. This can't be undone.`}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </ConfirmSubmit>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Newspaper size={22} strokeWidth={1.75} />}
            title="No articles yet"
            action={
              <ButtonLink href="/admin/news/new" variant="primary">
                <Plus size={16} aria-hidden="true" /> Write your first article
              </ButtonLink>
            }
          >
            Add a cover image, headline and link to a blog post. It shows up on the News page straight away.
          </EmptyState>
        )}
      </Card>
    </>
  );
}
