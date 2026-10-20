import type { Metadata } from "next";
import { NewsForm } from "@/components/admin/NewsForm";
import { PageHeader } from "@/components/admin/ui/Layout";
import { requireUser } from "@/lib/server/auth";
import { saveNews } from "../actions";

export const instant = false;
export const metadata: Metadata = { title: "New article" };

export default async function NewArticlePage() {
  await requireUser();
  return (
    <>
      <PageHeader
        back={{ href: "/admin/news", label: "News" }}
        title="New article"
        description="Appears on the News page and links to the full story on your blog."
      />
      <NewsForm action={saveNews.bind(null, null)} today={new Date().toISOString().slice(0, 10)} />
    </>
  );
}
