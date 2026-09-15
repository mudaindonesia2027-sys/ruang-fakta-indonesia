import Link from "next/link";
import Header from "@/components/Header";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const publicIssueStatuses = ["OPEN", "MONITORING", "INVESTIGATING", "VERIFIED", "RESOLVED"] as const;
const activeIssueStatuses = ["OPEN", "MONITORING", "INVESTIGATING", "VERIFIED"] as const;
const regions = [
  { label: "Nasional", level: "nasional" },
  { label: "Provinsi", level: "provinsi" },
  { label: "Kabupaten / Kota", level: "kabupaten" },
  { label: "Kecamatan", level: "kecamatan" },
  { label: "Desa", level: "desa" },
  { label: "Dusun", level: "dusun" },
];
const topics = ["Pemerintahan", "Ekonomi", "Pendidikan", "Kesehatan", "Lingkungan", "Infrastruktur"];
const dateLabel = (value: Date | null) => value ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(value) : "";

export default async function HomePage() {
  const [issues, articles, articleCount, issueCount, sourceCount] = await Promise.all([
    db.issue.findMany({ where: { status: { in: [...publicIssueStatuses] } }, orderBy: { updatedAt: "desc" }, take: 6, select: { id: true, slug: true, title: true, summary: true, status: true, province: true, regency: true, updatedAt: true, category: { select: { name: true } } } }),
    db.article.findMany({ where: { status: "PUBLISHED", isPublished: true }, orderBy: { publishedAt: "desc" }, take: 6, select: { id: true, slug: true, title: true, excerpt: true, publishedAt: true, category: { select: { name: true } } } }),
    db.article.count({ where: { status: "PUBLISHED", isPublished: true } }),
    db.issue.count({ where: { status: { in: [...activeIssueStatuses] } } }),
    db.source.count(),
  ]);

  return <>
    <Header />
    <main>
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-copy">
            <div className="hero-eyebrow"><span className="pulse-dot" /> INFORMASI PUBLIK · NUSANTARA</div>
            <h1>Indonesia yang nyata, dibaca dengan jernih.</h1>
            <p className="hero-description">RUANG FAKTA mempertemukan berita, isu, data, sumber, dan perkembangan lapangan dalam satu ruang publik yang bisa ditelusuri.</p>
            <div className="hero-actions"><Link href="/isu" className="button-primary">Jelajahi Isu <span>→</span></Link><Link href="/berita" className="button-secondary">Baca Berita</Link></div>
            <div className="hero-trust"><div className="trust-item"><span className="trust-icon">✓</span> Sumber dapat diperiksa</div><div className="trust-item"><span className="trust-icon">✓</span> Verifikasi terlihat</div><div className="trust-item"><span className="trust-icon">✓</span> Koreksi terbuka</div></div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-card hero-data-card">
              <div className="hero-image-content">
                <span className="hero-image-label">RUANG FAKTA / LIVE INDEX</span>
                <h2>Yang penting bukan terlihat ramai. Yang penting bisa diperiksa.</h2>
                <p>Indeks di bawah ini berasal dari data publik yang benar-benar tersimpan di sistem.</p>
                <div className="hero-signal-grid">
                  <div><strong>{issueCount}</strong><span>isu aktif</span></div>
                  <div><strong>{articleCount}</strong><span>berita terbit</span></div>
                  <div><strong>{sourceCount}</strong><span>sumber</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section"><div className="content-container stats-grid"><div className="stat-item"><strong>{articleCount}</strong><span>Berita terbit</span></div><div className="stat-item"><strong>{issueCount}</strong><span>Isu aktif & dipantau</span></div><div className="stat-item"><strong>{sourceCount}</strong><span>Sumber tercatat</span></div><div className="stat-item"><strong>Indonesia</strong><span>Cakupan platform</span></div></div></section>

      <section className="section section-featured"><div className="content-container"><div className="section-heading"><div><span className="section-kicker">ISU TERBARU</span><h2>Persoalan publik yang sedang bergerak.</h2><p>Urutan mengikuti pembaruan data. Tidak ada angka atau liputan yang dibuat hanya untuk mengisi ruang.</p></div><Link href="/isu" className="text-link">Lihat semua isu →</Link></div>{issues.length ? <div className="featured-grid">{issues.map(issue => <article className="featured-card" key={issue.id}><div className="featured-card-content"><div className="issue-meta"><span>{issue.category?.name || "Isu Publik"}</span><span className="status">{issue.status}</span></div><h3><Link href={`/isu/${issue.slug}`}>{issue.title}</Link></h3><p>{issue.summary || "Belum ada ringkasan."}</p><div className="issue-location">{[issue.regency, issue.province].filter(Boolean).join(", ") || "Indonesia"}</div><div className="issue-footer"><span>Diperbarui {dateLabel(issue.updatedAt)}</span><Link href={`/isu/${issue.slug}`}>Buka isu →</Link></div></div></article>)}</div> : <div className="empty-state"><h2>Belum ada isu publik yang dapat ditampilkan</h2><p>Isu akan muncul setelah data masuk dan melewati pemeriksaan.</p></div>}</div></section>

      <section className="section regional-section"><div className="content-container"><div className="regional-layout"><div className="regional-intro"><span className="section-kicker">PETA RUANG PUBLIK</span><h2>Dari nasional sampai dusun.</h2><p>Pilih skala wilayah untuk melihat informasi yang memang tersedia pada tingkat tersebut.</p><Link href="/isu" className="button-dark">Jelajahi wilayah →</Link></div><div className="regional-grid">{regions.map((region,index) => <Link href={`/isu?tingkat=${region.level}`} className="regional-card" key={region.level}><span className="region-number">0{index+1}</span><h3>{region.label}</h3><p>Isu dan informasi yang tersedia di tingkat ini.</p><span className="regional-arrow">↗</span></Link>)}</div></div></div></section>

      <section className="section topics-section"><div className="content-container"><div className="section-heading centered-heading"><div><span className="section-kicker">LINTAS PERSOALAN</span><h2>Masuk lewat topik yang dekat.</h2><p>Satu persoalan dapat hidup di banyak wilayah. Mulai dari topik, lalu telusuri konteksnya.</p></div></div><div className="topics-grid">{topics.map(topic => <Link href={`/isu?q=${encodeURIComponent(topic)}`} className="topic-card" key={topic}><div className="topic-icon">●</div><h3>{topic}</h3><p>Telusuri isu terkait {topic.toLowerCase()}.</p><span className="topic-arrow">↗</span></Link>)}</div></div></section>

      <section className="section section-featured"><div className="content-container"><div className="section-heading"><div><span className="section-kicker">BERITA TERBIT</span><h2>Berita yang sudah melewati meja editorial.</h2><p>Pengumpulan otomatis tidak berarti publikasi otomatis. Berita tampil setelah diperiksa.</p></div><Link href="/berita" className="text-link">Lihat semua berita →</Link></div>{articles.length ? <div className="featured-grid">{articles.map(article => <article className="featured-card" key={article.id}><div className="featured-card-content"><div className="issue-meta"><span>{article.category?.name || "Berita"}</span><span>{dateLabel(article.publishedAt)}</span></div><h3><Link href={`/berita/${article.slug}`}>{article.title}</Link></h3><p>{article.excerpt || "Baca informasi lengkap dan sumbernya."}</p><Link href={`/berita/${article.slug}`} className="article-link">Baca berita →</Link></div></article>)}</div> : <div className="empty-state"><h2>Belum ada berita terbit</h2><p>Berita otomatis masih menunggu pemeriksaan editorial.</p></div>}</div></section>

      <section className="video-section"><div className="content-container"><div className="video-section-top"><div><span className="section-kicker section-kicker-light">SATU EKOSISTEM, TIGA RUANG</span><h2>Publik membaca. Warga berkontribusi. Editorial menjaga kualitas.</h2></div><p><strong>Website Publik</strong> untuk membaca. <strong>Ruang Saya</strong> untuk kontribusi pengguna. <strong>Admin</strong> untuk editorial, verifikasi, moderasi, dan audit.</p></div><div className="hero-actions"><Link href="/ruang-saya" className="button-light">Masuk Ruang Saya →</Link><Link href="/tentang" className="button-outline-light">Pelajari cara kerja</Link></div></div></section>
    </main>
  </>;
}
