import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-container">
        <Link href="/" className="brand" aria-label="Ruang Fakta">
          <span className="brand-mark">
            <span className="brand-mark-red" />
            <span className="brand-mark-white" />
          </span>
          <span className="brand-text"><strong>RUANG</strong><strong>FAKTA</strong></span>
        </Link>

        <nav className="main-nav" aria-label="Navigasi publik">
          <Link href="/">Beranda</Link>
          <Link href="/isu">Isu</Link>
          <Link href="/berita">Berita</Link>
          <Link href="/data">Data</Link>
          <Link href="/tentang">Tentang</Link>
        </nav>

        <div className="header-actions">
          <Link href="/isu" className="header-search" aria-label="Cari isu dan informasi">
            <span aria-hidden="true">⌕</span><span>Cari</span>
          </Link>
          <Link href="/dashboard" className="header-button">Ruang Saya</Link>
        </div>
      </div>
    </header>
  );
}
