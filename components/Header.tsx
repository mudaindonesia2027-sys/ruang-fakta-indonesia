import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-container">
        <Link href="/" className="brand" aria-label="Ruang Fakta — Website Publik">
          <span className="brand-mark"><span className="brand-mark-red" /><span className="brand-mark-white" /></span>
          <span className="brand-text"><strong>RUANG</strong><strong>FAKTA</strong></span>
        </Link>
        <nav className="main-nav" aria-label="Navigasi website publik">
          <Link href="/">Beranda</Link>
          <Link href="/isu">Isu Publik</Link>
          <Link href="/berita">Berita</Link>
          <Link href="/data">Data & Fakta</Link>
          <Link href="/tentang">Tentang</Link>
        </nav>
        <div className="header-actions">
          <Link href="/isu" className="header-search" aria-label="Cari isu dan informasi"><span aria-hidden="true">⌕</span><span>Cari</span></Link>
          <Link href="/ruang-saya" className="header-button">Ruang Saya</Link>
        </div>
      </div>
    </header>
  );
}
