import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div>
          <Link href="/" className="footer-brand">RUANG <span>FAKTA</span></Link>
          <p>Ruang informasi publik yang dapat ditelusuri, diperiksa, dan diperbarui bersama.</p>
        </div>
        <nav aria-label="Navigasi footer">
          <Link href="/isu">Isu</Link>
          <Link href="/berita">Berita</Link>
          <Link href="/data">Data publik</Link>
          <Link href="/tentang">Tentang</Link>
          <Link href="/login">Masuk</Link>
        </nav>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} RUANG FAKTA · Informasi publik dan diskusi masyarakat</div>
    </footer>
  );
}
