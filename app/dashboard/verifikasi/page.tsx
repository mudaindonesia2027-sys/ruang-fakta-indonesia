import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const providerLabels: Record<string, string> = {
  GOOGLE: "Google",
  FACEBOOK: "Facebook",
  APPLE: "Apple",
  GITHUB: "GitHub",
  LINKEDIN: "LinkedIn",
};

const identityLabels: Record<string, string> = {
  PENDING: "Menunggu pemeriksaan",
  VERIFIED: "Terverifikasi",
  FAILED: "Tidak lolos",
  EXPIRED: "Kedaluwarsa",
};

const roleLabels: Record<string, string> = {
  PENDING: "Menunggu review",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  EXPIRED: "Kedaluwarsa",
};

const claimLabels: Record<string, string> = {
  UNVERIFIED: "Belum diverifikasi",
  SUPPORTED: "Didukung evidence",
  DISPUTED: "Diperdebatkan",
  VERIFIED: "Terverifikasi",
  NOT_PROVEN: "Belum terbukti",
  FALSE: "Tidak benar",
};

export default async function VerificationDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [accounts, identity, roles, claims] = await Promise.all([
    db.accountVerification.findMany({
      where: { userId: user.id, status: "VERIFIED" },
      select: { id: true, provider: true, verifiedAt: true },
      orderBy: { verifiedAt: "asc" },
    }),
    db.identityVerification.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    db.roleClaim.findMany({ where: { userId: user.id }, include: { evidence: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.claim.findMany({ where: { authorId: user.id }, include: { evidence: true }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <main className="public-page">
      <section className="public-hero">
        <div className="container">
          <span className="section-kicker">VERIFIKASI</span>
          <h1>Kepercayaan dibangun dari bukti.</h1>
          <p>Verifikasi akun, peran, dan kebenaran klaim adalah tiga hal berbeda. Masing-masing diperiksa melalui prosesnya sendiri.</p>
        </div>
      </section>

      <section className="container content-section">
        <div className="dashboard-section">
          <div className="section-heading">
            <div><span className="section-kicker">AKUN</span><h2>Akun terverifikasi</h2></div>
          </div>
          <article className="dashboard-item">
            <div>
              <h3>{accounts.length > 0 ? "✓ Akun terverifikasi" : "Belum terverifikasi"}</h3>
              <p>
                {accounts.length > 0
                  ? `Terhubung melalui ${accounts.map((account) => providerLabels[account.provider] || account.provider).join(" dan ")}.`
                  : "Masuk menggunakan Google atau Facebook untuk menghubungkan akun terpercaya."}
              </p>
              <p>Badge akun hanya menunjukkan keberhasilan autentikasi akun. Ini bukan verifikasi identitas hukum dan tidak menentukan kebenaran suatu klaim.</p>
            </div>
          </article>
        </div>

        <div className="dashboard-section">
          <div className="section-heading">
            <div><span className="section-kicker">IDENTITAS</span><h2>Verifikasi identitas</h2></div>
          </div>
          <article className="dashboard-item">
            <div>
              <h3>{identity ? identityLabels[identity.status] || identity.status : "Belum diverifikasi"}</h3>
              <p>Pengajuan identitas belum dibuka melalui form aplikasi. Data KTP dan biometrik tidak dikumpulkan atau ditampilkan di halaman ini.</p>
              <p>Jika nanti diaktifkan, proses identitas akan menggunakan jalur verifikasi khusus yang aman.</p>
            </div>
          </article>
        </div>

        <div className="dashboard-section">
          <div className="section-heading">
            <div><span className="section-kicker">PERAN</span><h2>Klaim peran</h2></div>
            <Link href="/dashboard/verifikasi/peran" className="button-secondary">Ajukan peran</Link>
          </div>
          <div className="dashboard-list">
            {roles.length === 0 ? <p>Belum ada klaim peran.</p> : roles.map((role) => (
              <article className="dashboard-item" key={role.id}>
                <div><span>{role.organization || role.project || "PERAN"}</span><h3>{role.title}</h3><p>{role.evidence.length} evidence · {roleLabels[role.status] || role.status}</p></div>
              </article>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-heading">
            <div><span className="section-kicker">KLAIM</span><h2>Pernyataan dan evidence</h2></div>
            <Link href="/dashboard/verifikasi/klaim" className="button-secondary">Buat klaim</Link>
          </div>
          <div className="dashboard-list">
            {claims.length === 0 ? <p>Belum ada klaim.</p> : claims.map((claim) => (
              <article className="dashboard-item" key={claim.id}>
                <div><span>{claimLabels[claim.status] || claim.status}</span><h3>{claim.statement}</h3><p>{claim.evidence.length} evidence</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
