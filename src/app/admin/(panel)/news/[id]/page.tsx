import { ArrowUpRight, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsForm } from "@/components/admin/NewsForm";
import { ButtonLink } from "@/components/admin/ui/Button";
import { ConfirmSubmit } from "@/components/admin/ui/ConfirmSubmit";
import { PageHeader } from "@/components/admin/ui/Layout";
import { requireUser } from "@/lib/server/auth";
import { getNews } from "@/lib/server/data/news";
import { deleteNewsAction, saveNews } from "../actions";

export const instant = false;
export const metadata: Metadata = { title: "Edit article" };

export default async function EditArticlePage({ params }: PageProps<"/admin/news/[id]">) {
  await requireUser();
  const { id } = await params;
  const article = await getNews(id);
  if (!article) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/news", label: "News" }}
        title="Edit article"
        description={article.title}
        actions={
          <>
            <ButtonLink href={article.url} target="_blank" rel="noopener noreferrer">
              Open article <ArrowUpRight size={16} aria-hidden="true" />
            </ButtonLink>
            <form action={deleteNewsAction.bind(null, id, true)}>
              <ConfirmSubmit
                title="Delete this article?"
                description={`“${article.title}” and its image will be removed from the News page. This can't be undone.`}
              >
                <Trash2 size={16} aria-hidden="true" /> Delete
              </ConfirmSubmit>
            </form>
          </>
        }
      />
      <NewsForm action={saveNews.bind(null, id)} article={article} today={new Date().toISOString().slice(0, 10)} />
    </>
  );
}
