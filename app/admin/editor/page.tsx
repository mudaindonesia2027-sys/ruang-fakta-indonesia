import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleEditor from "@/components/cms/article-editor";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function AdminEditorPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  const article = id
    ? await db.article.findUnique({
        where: { id },
        include: { category: true, author: true },
      })
    : null;

  if (id && !article) notFound();

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <span className="section-kicker">CMS</span>
          <h1>{article ? "Edit Artikel" : "Editor Artikel"}</h1>
          <p>Kelola judul, isi, kategori, status, dan media artikel.</p>
        </div>
        <Link href="/admin/articles" className="button-secondary">Kembali</Link>
      </section>
      <ArticleEditor
        initialData={article ? {
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? "",
          content: article.content,
          category: article.category?.name ?? "",
          status: article.status,
          coverImage: article.coverImage ?? "",
          authorName: article.author.name ?? "",
        } : undefined}
      />
    </main>
  );
}
