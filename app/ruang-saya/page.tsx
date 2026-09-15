import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RuangSayaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/ruang-saya");
  const [myClaims, myRoles, myIssues] = await Promise.all([
    db.claim.count({ where: { authorId: user.id } }),
    db.roleClaim.count({ where: { userId: user.id } }),
    db.issue.count({ where: { reporterId: user.id } }),
  ]);
  return (
    <main className="user-page">
      <section className="user-hero"><div className="container"><span className="section-kicker">RUANG SAYA · PRIBADI</span><h1>Halo, {user.name || user.username || "warga"}.</h1><p>Ruang pribadi untuk kontribusi dan verifikasi Anda. Pengelolaan editorial bukan di sini; halaman owner/admin terpisah di <strong>/admin</strong>.</p></div></section>
      <section className="container content-section">
        <div className="user-badges"><span className="role-pill">Akun {user.role}</span><span className="role-pill">Email {user.emailVerified ? "terverifikasi" : "belum terverifikasi"}</span></div>
        <div className="stats-grid public-data-stats"><article className="stat-card"><span>Isu saya</span><strong>{myIssues}</strong></article><article className="stat-card"><span>Klaim saya</span><strong>{myClaims}</strong></article><article className="stat-card"><span>Peran diajukan</span><strong>{myRoles}</strong></article></div>
        <div className="action-grid"><Link className="action-card" href="/dashboard/verifikasi/peran"><span>01</span><h2>Verifikasi peran</h2><p>Ajukan peran atau keterlibatan organisasi dengan bukti.</p><b>Buka →</b></Link><Link className="action-card" href="/dashboard/verifikasi/klaim"><span>02</span><h2>Verifikasi klaim</h2><p>Ajukan pernyataan dan bukti yang bisa diperiksa.</p><b>Buka →</b></Link><Link className="action-card" href="/isu"><span>03</span><h2>Pantau isu publik</h2><p>Kembali ke ruang publik untuk membaca perkembangan.</p><b>Lihat isu →</b></Link></div>
      </section>
    </main>
  );
}
