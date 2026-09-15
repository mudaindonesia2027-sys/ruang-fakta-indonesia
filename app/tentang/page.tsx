import Link from "next/link";
import PublicShell from "@/components/PublicShell";

export default function TentangPage() {
  return (
    <PublicShell>
      <main className="public-page"><section className="public-hero"><div className="container"><span className="section-kicker">TENTANG RUANG FAKTA</span><h1>Ruang publik yang bekerja dengan fakta</h1><p>RUANG FAKTA dirancang untuk membantu masyarakat mengikuti isu, memeriksa sumber, memahami perubahan, dan berdiskusi tanpa mencampurkan fakta dengan klaim yang belum terbukti.</p></div></section><section className="container content-section"><div className="principles-grid"><article><strong>01</strong><h2>Sumber jelas</h2><p>Informasi penting diarahkan ke sumber yang dapat dibuka dan diperiksa.</p></article><article><strong>02</strong><h2>Verifikasi terpisah</h2><p>Akun terverifikasi tidak berarti semua pernyataannya otomatis benar.</p></article><article><strong>03</strong><h2>Perubahan transparan</h2><p>Koreksi dan pembaruan editorial dicatat agar publik dapat memahami perubahan.</p></article><article><strong>04</strong><h2>Ruang diskusi</h2><p>Suara masyarakat dihargai, tetapi tetap melalui aturan moderasi dan anti-spam.</p></article></div><div className="about-cta"><h2>Ingin ikut berkontribusi?</h2><p>Gunakan Ruang Saya untuk mengirim isu, klaim, atau bukti yang dapat ditinjau.</p><Link className="button-primary" href="/dashboard">Buka Ruang Saya →</Link></div></section></main>
    </PublicShell>
  );
}
