import { CorrectionStatus } from "@prisma/client";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const labels: Record<CorrectionStatus, string> = {
  PENDING: "Menunggu",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
  COMPLETED: "Selesai",
};

export default async function CorrectionsPage() {
  const corrections = await db.correction.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      description: true,
      requestedChange: true,
      status: true,
      createdAt: true,
      article: { select: { title: true, slug: true } },
      user: { select: { name: true, username: true } },
    },
  });

  return (
    <>
      <section className="adminTop">
        <div><div className="eyebrow">TRANSPARENCY</div><h1>Koreksi</h1><p>Catatan koreksi yang benar-benar tersimpan di sistem, beserta status dan konteks artikelnya.</p></div>
      </section>
      <section className="moderationList">
        {corrections.length === 0 ? (
          <div className="adminPanel">
            <h2>Belum ada pengajuan koreksi</h2>
            <p>Pengajuan koreksi akan muncul di sini setelah pengguna atau editor mengirimkannya.</p>
          </div>
        ) : corrections.map((correction) => (
          <article className="moderationItem" key={correction.id}>
            <div className="eyebrow">{labels[correction.status]}</div>
            <h2>{correction.title}</h2>
            <p>{correction.description}</p>
            {correction.requestedChange && <small>Usulan perubahan: {correction.requestedChange}</small>}
            <small>Artikel: {correction.article.title} · Pengaju: {correction.user?.name || correction.user?.username || "Pengguna"} · {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(correction.createdAt)}</small>
          </article>
        ))}
      </section>
    </>
  );
}
