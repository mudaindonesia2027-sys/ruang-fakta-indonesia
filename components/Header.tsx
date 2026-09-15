import Link from "next/link";

const navigation = [
  ["Beranda", "/"],
  ["Isu", "/isu"],
  ["Berita", "/berita"],
  ["Data", "/data"],
  ["Tentang", "/tentang"],
] as const;

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-container">
        <Link href="/" className="brand" aria-label="Ruang Fakta — Website Publik">
          <span className="brand-mark" aria-hidden="true"><span className="brand-mark-red" /><span className="brand-mark-white" /></span>
          <span className="brand-text"><strong>RUANG</strong><strong>FAKTA</strong></span>
        </Link>
        <nav className="main-nav" aria-label="Navigasi website publik">
          {navigation.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link href="/isu" className="header-search" aria-label="Cari isu dan informasi"><span aria-hidden="true">⌕</span><span>Cari sesuatu</span></Link>
          <Link href="/ruang-saya" className="header-button">Ruang Saya <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </header>
  );
}
