import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-brand-title">
            <span className="footer-logo">RF</span>
            <strong>RUANG FAKTA</strong>
          </div>

          <p>
            Ruang informasi publik untuk mengikuti isu, data, fakta, dan
            perkembangan masyarakat dari tingkat nasional hingga wilayah
            terdekat.
          </p>
        </div>

        <div>
          <h3>Eksplorasi</h3>

          <Link href="/">Beranda</Link>
          <Link href="/isu">Isu Publik</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/admin">CMS Admin</Link>
        </div>

        <div>
          <h3>Partisipasi</h3>

          <Link href="/isu">Ikuti Isu</Link>
          <Link href="/admin/articles/new">Publikasi Artikel</Link>
          <Link href="/admin/corrections">Koreksi Informasi</Link>
          <Link href="/admin/discussions">Diskusi</Link>
        </div>

        <div>
          <h3>RUANG FAKTA</h3>

          <p>
            Dibangun untuk mendukung informasi publik yang lebih terbuka,
            terdokumentasi, dan dapat terus diperbarui.
          </p>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} RUANG FAKTA.</p>

        <p>Informasi • Data • Fakta • Partisipasi Publik</p>
      </div>
    </footer>
  );
}
