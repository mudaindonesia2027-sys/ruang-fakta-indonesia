import Link from "next/link";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import PublicShell from "@/components/PublicShell";

export const dynamic = "force-dynamic";

export default async function BeritaPage() {
  const articles = await db.article.findMany({
    where: { status: ArticleStatus.PUBLISHED, isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 24,
    select: { id: true, slug: true, title: true, excerpt: true, publishedAt: true, category: { select: { name: true } }, author: { select: { name: true } } },
  });

  return (
    <PublicShell>
      <main className="public-page">
        <section className="public-hero"><div className="container"><span className="section-kicker">RUANG PUBLIK · BERITA</span><h1>Berita dan pembaruan</h1><p>Informasi yang telah melewati proses editorial dan ditampilkan bersama konteks serta sumber yang dapat ditelusuri.</p></div></section>
        <section className="container content-section">
          <div className="public-section-head"><div><span className="section-kicker">TERBARU</span><h2>{articles.length} berita terbit</h2></div><Link href="/isu" className="button-secondary">Lihat isu publik</Link></div>
          {articles.length === 0 ? <div className="empty-state"><h2>Belum ada berita terbit</h2><p>Pengambilan berita otomatis tetap berjalan, tetapi hasilnya tidak langsung diterbitkan. Editor perlu memeriksa sumber terlebih dahulu.</p><Link href="/data" className="button-primary">Lihat data publik</Link></div> : <div className="article-grid">{articles.map((article) => <article className="article-card" key={article.id}><div className="article-card-top"><span>{article.category?.name || "BERITA"}</span><time>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("id-ID") : "-"}</time></div><h2><Link href={`/berita/${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt || "Baca informasi lengkap, konteks, dan sumber yang menyertainya."}</p><div className="article-card-bottom"><span>{article.author?.name || "Ruang Fakta"}</span><Link href={`/berita/${article.slug}`}>Baca berita →</Link></div></article>)}</div>}
        </section>
      </main>
    </PublicShell>
  );
}
