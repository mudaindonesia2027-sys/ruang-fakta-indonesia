import Link from "next/link";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const [articles, issues] = await Promise.all([
    db.article.findMany({
      where: { status: ArticleStatus.REVIEW },
      orderBy: { updatedAt: "asc" },
      take: 30,
      select: { id: true, title: true, updatedAt: true, author: { select: { name: true } }, sources: { select: { source: { select: { publisher: true } } }, take: 1 } },
    }),
    db.issue.findMany({
      where: { status: { in: ["OPEN", "MONITORING", "INVESTIGATING"] }, verificationStatus: "IN_REVIEW" },
      orderBy: { updatedAt: "asc" },
      take: 20,
      select: { id: true, slug: true, title: true, updatedAt: true, reporterName: true },
    }),
  ]);

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div><span className="section-kicker">EDITORIAL WORKFLOW</span><h1>Review Queue</h1><p>Antrean nyata dari artikel dan isu yang membutuhkan pemeriksaan. Tidak ada konten contoh atau tombol pura-pura.</p></div>
        <Link href="/admin/articles" className="button-secondary">Semua artikel</Link>
      </section>

      <section className="admin-panel">
        <div className="public-section-head"><div><h2>Artikel menunggu review</h2><p>{articles.length} artikel dalam antrean saat ini.</p></div></div>
        {articles.length === 0 ? <div className="empty-state"><h2>Antrean artikel kosong</h2><p>Tidak ada artikel berstatus REVIEW yang menunggu pemeriksaan.</p></div> : <div className="reviewQueue">{articles.map((article) => <article className="reviewItem" key={article.id}><span className="reviewType">{article.sources[0]?.source.publisher === "ANTARA" ? "AUTO · BERITA" : "ARTIKEL"}</span><div><h2>{article.title}</h2><p>{article.author.name || "Penulis tidak tercatat"} · diperbarui {new Date(article.updatedAt).toLocaleDateString("id-ID")}</p></div><div className="reviewActions"><Link className="primaryButton" href={`/admin/editor?id=${article.id}`}>Buka review →</Link></div></article>)}</div>}
      </section>

      <section className="admin-panel">
        <div className="public-section-head"><div><h2>Isu dalam pemeriksaan</h2><p>{issues.length} isu dengan status verifikasi IN_REVIEW.</p></div></div>
        {issues.length === 0 ? <div className="empty-state"><h2>Antrean isu kosong</h2><p>Tidak ada isu yang sedang berada dalam pemeriksaan verifikasi.</p></div> : <div className="reviewQueue">{issues.map((issue) => <article className="reviewItem" key={issue.id}><span className="reviewType">ISU</span><div><h2>{issue.title}</h2><p>{issue.reporterName || "Pelapor tidak tercatat"} · diperbarui {new Date(issue.updatedAt).toLocaleDateString("id-ID")}</p></div><div className="reviewActions"><Link className="primaryButton" href={`/admin/verification`}>Buka verifikasi →</Link><Link className="secondaryButton" href={`/isu/${issue.slug}`}>Lihat isu</Link></div></article>)}</div>}
      </section>
    </main>
  );
}
