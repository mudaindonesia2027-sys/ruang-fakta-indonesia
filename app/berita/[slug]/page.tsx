import Link from "next/link";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import PublicShell from "@/components/PublicShell";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await db.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED, isPublished: true },
    select: { title: true, content: true, excerpt: true, publishedAt: true, category: { select: { name: true } }, author: { select: { name: true } }, sources: { select: { source: { select: { title: true, url: true, publisher: true, publishedAt: true } } }, orderBy: { createdAt: "asc" } } },
  });
  if (!article) notFound();

  const sources = article.sources.filter(({ source }) => Boolean(source.url));
  return (
    <PublicShell>
      <main className="public-page"><article className="container article-detail">
        <div className="article-detail-meta"><Link href="/berita">← Semua berita</Link><span>{article.category?.name || "BERITA"}</span><time>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}</time></div>
        <h1>{article.title}</h1>
        {article.excerpt && <p className="article-lead">{article.excerpt}</p>}
        <div className="article-body">{article.content.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        <section className="article-sources"><h2>Sumber</h2>{sources.length === 0 ? <p>Belum ada sumber yang ditampilkan.</p> : sources.map(({ source }) => <div className="source-row" key={source.url}><div><strong>{source.publisher || source.title}</strong><span>{source.title}</span></div><a href={source.url!} target="_blank" rel="noreferrer">Buka sumber ↗</a></div>)}</section>
        <div className="article-note">Informasi publik dapat diperbarui atau dikoreksi apabila ditemukan bukti baru. Perubahan penting dicatat melalui riwayat editorial.</div>
      </article></main>
    </PublicShell>
  );
}
