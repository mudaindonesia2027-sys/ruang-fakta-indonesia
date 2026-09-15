import Link from "next/link";
import { ArticleStatus, IssueStatus } from "@prisma/client";
import { db } from "@/lib/db";
import PublicShell from "@/components/PublicShell";

export const dynamic = "force-dynamic";

export default async function DataPage() {
  const [publishedArticles, activeIssues, verifiedIssues, sourceCount, latest] = await Promise.all([
    db.article.count({ where: { status: ArticleStatus.PUBLISHED, isPublished: true } }),
    db.issue.count({ where: { status: { in: [IssueStatus.OPEN, IssueStatus.MONITORING, IssueStatus.INVESTIGATING] } } }),
    db.issue.count({ where: { verificationStatus: "VERIFIED", status: { not: IssueStatus.REJECTED } } }),
    db.source.count(),
    db.article.findMany({ where: { status: ArticleStatus.PUBLISHED, isPublished: true }, orderBy: { publishedAt: "desc" }, take: 6, select: { slug: true, title: true, excerpt: true, publishedAt: true, category: { select: { name: true } } } }),
  ]);

  return (
    <PublicShell>
      <main className="public-page">
        <section className="public-hero"><div className="container"><span className="section-kicker">DATA PUBLIK</span><h1>Melihat perkembangan Ruang Fakta</h1><p>Ringkasan data yang tersedia untuk publik. Angka ini menggambarkan isi yang sudah dihimpun dan dapat berubah seiring pembaruan.</p></div></section>
        <section className="container content-section">
          <div className="stats-grid public-data-stats">
            <article className="stat-card"><span>Berita terbit</span><strong>{publishedArticles}</strong></article>
            <article className="stat-card"><span>Isu aktif</span><strong>{activeIssues}</strong></article>
            <article className="stat-card"><span>Isu terverifikasi</span><strong>{verifiedIssues}</strong></article>
            <article className="stat-card"><span>Sumber tercatat</span><strong>{sourceCount}</strong></article>
          </div>
          <div className="public-section-head"><div><span className="section-kicker">PUBLIKASI TERBARU</span><h2>Berita yang sudah diperiksa</h2></div><Link className="button-secondary" href="/berita">Lihat semua berita</Link></div>
          {latest.length === 0 ? <div className="empty-state"><h2>Belum ada berita terbit</h2><p>Berita otomatis masuk ke tahap pemeriksaan editorial terlebih dahulu agar informasi yang tampil tetap dapat dipertanggungjawabkan.</p><Link className="button-primary" href="/login">Masuk ke Ruang Saya</Link></div> : <div className="article-list">{latest.map((article) => <article className="article-list-item" key={article.slug}><div><span>{article.category?.name || "BERITA"}</span><h3><Link href={`/berita/${article.slug}`}>{article.title}</Link></h3><p>{article.excerpt || "Baca informasi lengkap dan sumber yang menyertainya."}</p></div><time>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("id-ID") : "-"}</time></article>)}</div>}
        </section>
      </main>
    </PublicShell>
  );
}
