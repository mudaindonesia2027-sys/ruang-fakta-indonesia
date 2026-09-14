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

          <span className="brand-text">
            <strong>RUANG</strong>
            <strong>FAKTA</strong>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Navigasi utama">
          <Link href="/isu">Isu</Link>
          <Link href="/isu">Nasional</Link>
          <Link href="/isu">Daerah</Link>
          <Link href="/dashboard">Data</Link>
          <Link href="/isu">Desa & Dusun</Link>
          <Link href="/login">Masuk</Link>
        </nav>

        <div className="header-actions">
          <Link href="/isu" className="header-search">
            <span aria-hidden="true">⌕</span>
            <span>Cari</span>
          </Link>

          <Link href="/dashboard" className="header-button">
            Ruang Saya
          </Link>
        </div>
      </div>
    </header>
  );
}
