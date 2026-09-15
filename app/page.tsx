import Link from "next/link";
import Header from "@/components/Header";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const publicIssueStatuses = ["OPEN", "MONITORING", "INVESTIGATING", "VERIFIED", "RESOLVED"] as const;
const activeIssueStatuses = ["OPEN", "MONITORING", "INVESTIGATING", "VERIFIED"] as const;
const regions = [
  { label: "Nasional", level: "nasional", note: "Percakapan seluruh Indonesia" },
  { label: "Provinsi", level: "provinsi", note: "Cerita dari tiap provinsi" },
  { label: "Kabupaten / Kota", level: "kabupaten", note: "Persoalan yang lebih dekat" },
  { label: "Kecamatan", level: "kecamatan", note: "Kabar dari sekitar kita" },
  { label: "Desa", level: "desa", note: "Ruang warga setempat" },
  { label: "Dusun", level: "dusun", note: "Sedekat halaman rumah" },
];
const topics = [
  ["Pemerintahan", "Cara keputusan dibuat"],
  ["Ekonomi", "Kerja, harga, dan penghidupan"],
  ["Pendidikan", "Sekolah dan kesempatan"],
  ["Kesehatan", "Layanan dan kehidupan"],
  ["Lingkungan", "Tanah, air, dan udara"],
  ["Infrastruktur", "Jalan, ruang, dan akses"],
] as const;
const dateLabel = (value: Date | null) => value ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(value) : "";
const statusLabel: Record<string, string> = { OPEN: "Terbuka", MONITORING: "Dipantau", INVESTIGATING: "Ditelaah", VERIFIED: "Terverifikasi", RESOLVED: "Selesai" };

export default async function HomePage() {
  const [issues, articles, articleCount, issueCount, sourceCount] = await Promise.all([
    db.issue.findMany({ where: { status: { in: [...publicIssueStatuses] } }, orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, slug: true, title: true, summary: true, status: true, province: true, regency: true, updatedAt: true, category: { select: { name: true } } } }),
    db.article.findMany({ where: { status: "PUBLISHED", isPublished: true }, orderBy: { publishedAt: "desc" }, take: 4, select: { id: true, slug: true, title: true, excerpt: true, publishedAt: true, category: { select: { name: true } } } }),
    db.article.count({ where: { status: "PUBLISHED", isPublished: true } }),
    db.issue.count({ where: { status: { in: [...activeIssueStatuses] } } }),
    db.source.count(),
  ]);

  const leadIssue = issues[0];
  const otherIssues = issues.slice(1);

  return <>
    <Header />
    <main className="rf-home">
      <section className="rf-welcome">
        <div className="content-container rf-welcome-grid">
          <div className="rf-welcome-copy">
            <span className="rf-overline"><i /> Ruang publik Indonesia</span>
            <h1>Tempat untuk <em>memahami</em> apa yang sedang terjadi.</h1>
            <p>Berita memberi kabar. Data memberi konteks. Warga memberi pengalaman. RUANG FAKTA mempertemukannya supaya kita tidak berhenti pada judul.</p>
            <div className="rf-welcome-actions"><Link href="/isu" className="rf-button rf-button-primary">Mulai menjelajah <span>→</span></Link><Link href="/berita" className="rf-button rf-button-quiet">Lihat berita terbaru</Link></div>
            <div className="rf-handnote">dibuat untuk manusia yang ingin tahu, bukan untuk membuat internet terasa lebih bising.</div>
          </div>
          <div className="rf-welcome-side">
            <div className="rf-today-card">
              <div className="rf-card-top"><span>Hari ini di ruang publik</span><span>01</span></div>
              <div className="rf-orbit" aria-hidden="true"><span /><span /><span /></div>
              <h2>Apa yang perlu kita periksa bersama?</h2>
              <p>Mulai dari isu yang sedang bergerak, lalu ikuti sumber, pembaruan, dan percakapannya.</p>
              <Link href="/isu" className="rf-round-link" aria-label="Jelajahi isu">↗</Link>
            </div>
            <div className="rf-side-note"><strong>{issueCount}</strong><span>isu aktif</span><b>•</b><strong>{articleCount}</strong><span>berita terbit</span></div>
          </div>
        </div>
      </section>

      <section className="rf-proof"><div className="content-container rf-proof-inner"><span className="rf-proof-intro">Yang kami jaga</span><div><b>01</b><span>Sumber bisa ditelusuri</span></div><div><b>02</b><span>Verifikasi terlihat</span></div><div><b>03</b><span>Koreksi tidak disembunyikan</span></div><div><b>04</b><span>Pendapat tidak disamarkan sebagai fakta</span></div></div></section>

      <section className="rf-issues"><div className="content-container"><div className="rf-section-head"><div><span className="rf-overline">Yang sedang bergerak</span><h2>Isu, bukan sekadar judul.</h2></div><Link href="/isu" className="rf-arrow-link">Semua isu <span>→</span></Link></div>{leadIssue ? <div className="rf-issue-layout"><article className="rf-lead-issue"><div className="rf-lead-art" aria-hidden="true"><span>RUANG<br />FAKTA</span></div><div className="rf-lead-content"><div className="rf-meta"><span>{leadIssue.category?.name || "Isu Publik"}</span><span>{statusLabel[leadIssue.status] || leadIssue.status}</span></div><h3><Link href={`/isu/${leadIssue.slug}`}>{leadIssue.title}</Link></h3><p>{leadIssue.summary || "Ikuti konteks dan perkembangan isu ini."}</p><div className="rf-lead-bottom"><span>{[leadIssue.regency, leadIssue.province].filter(Boolean).join(", ") || "Indonesia"}</span><span>Diperbarui {dateLabel(leadIssue.updatedAt)}</span></div></div></article><div className="rf-issue-list">{otherIssues.map((issue, index) => <Link href={`/isu/${issue.slug}`} className="rf-issue-row" key={issue.id}><span className="rf-row-number">0{index + 2}</span><span className="rf-row-main"><small>{issue.category?.name || "Isu Publik"} · {statusLabel[issue.status] || issue.status}</small><strong>{issue.title}</strong><span>{[issue.regency, issue.province].filter(Boolean).join(", ") || "Indonesia"}</span></span><span className="rf-row-arrow">↗</span></Link>)}{!otherIssues.length && <div className="rf-soft-empty">Belum ada isu lain yang dapat ditampilkan.</div>}</div></div> : <div className="rf-empty"><h3>Belum ada isu publik yang dapat ditampilkan.</h3><p>Isu akan muncul setelah data masuk dan melewati pemeriksaan.</p></div>}</div></section>

      <section className="rf-regions"><div className="content-container"><div className="rf-section-head"><div><span className="rf-overline">Dekat dari tempat kita</span><h2>Dari Indonesia sampai halaman rumah.</h2></div><p>Pilih skala wilayah. Informasi yang muncul mengikuti data yang benar-benar tersedia.</p></div><div className="rf-region-path">{regions.map((region, index) => <Link href={`/isu?tingkat=${region.level}`} className="rf-region" key={region.level}><span>0{index + 1}</span><div><strong>{region.label}</strong><small>{region.note}</small></div><b>↗</b></Link>)}</div></div></section>

      <section className="rf-topics"><div className="content-container"><div className="rf-topic-intro"><span className="rf-overline">Mulai dari yang dekat</span><h2>Enam pintu untuk membaca Indonesia.</h2><p>Persoalan publik jarang berdiri sendiri. Masuk lewat hal yang paling ingin kamu pahami.</p></div><div className="rf-topic-grid">{topics.map(([topic, note], index) => <Link href={`/isu?q=${encodeURIComponent(topic)}`} className={`rf-topic rf-topic-${index + 1}`} key={topic}><span>0{index + 1}</span><strong>{topic}</strong><small>{note}</small><b>↗</b></Link>)}</div></div></section>

      <section className="rf-news"><div className="content-container"><div className="rf-section-head"><div><span className="rf-overline">Dari meja editorial</span><h2>Berita dengan konteks.</h2></div><Link href="/berita" className="rf-arrow-link">Semua berita <span>→</span></Link></div>{articles.length ? <div className="rf-news-grid">{articles.map((article, index) => <article className={`rf-news-card rf-news-${index + 1}`} key={article.id}><span className="rf-news-index">0{index + 1}</span><small>{article.category?.name || "Berita"} · {dateLabel(article.publishedAt)}</small><h3><Link href={`/berita/${article.slug}`}>{article.title}</Link></h3><p>{article.excerpt || "Baca informasi lengkap dan sumbernya."}</p><Link href={`/berita/${article.slug}`} className="rf-read">Baca <span>→</span></Link></article>)}</div> : <div className="rf-empty"><h3>Belum ada berita terbit.</h3><p>Berita yang terkumpul otomatis tetap menunggu pemeriksaan editorial.</p></div>}</div></section>

      <section className="rf-invitation"><div className="content-container rf-invitation-inner"><div><span className="rf-overline rf-overline-light">Ruang ini milik bersama</span><h2>Kalau kamu tahu sesuatu, mari bantu membuatnya lebih jelas.</h2></div><div><p>Publik membaca. Warga dapat berkontribusi. Tim editorial menjaga sumber, verifikasi, moderasi, dan jejak perubahan.</p><div className="rf-welcome-actions"><Link href="/ruang-saya" className="rf-button rf-button-white">Masuk Ruang Saya ↗</Link><Link href="/tentang" className="rf-button rf-button-outline">Cara kerja RUANG FAKTA</Link></div></div></div></section>
    </main>
  </>;
}
