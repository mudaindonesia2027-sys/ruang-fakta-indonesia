import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    OPEN: "Terbuka",
    MONITORING: "Dipantau",
    INVESTIGATING: "Ditindaklanjuti",
    VERIFIED: "Terverifikasi",
    RESOLVED: "Selesai",
    CLOSED: "Arsip",
    REJECTED: "Ditolak",
  };
  return labels[status] || status;
}

function verificationLabel(status: string) {
  const labels: Record<string, string> = {
    UNVERIFIED: "Belum diverifikasi",
    IN_REVIEW: "Sedang ditinjau",
    VERIFIED: "Terverifikasi",
    DISPUTED: "Diperdebatkan",
  };
  return labels[status] || status;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function IsuPage() {
  const issues = await db.issue.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      category: true,
      sources: {
        include: { source: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      updates: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { updates: true, comments: true },
      },
    },
  });

  return (
    <main className="public-page">
      <section className="public-hero">
        <div className="container">
          <span className="section-kicker">PANTAU INDONESIA</span>
          <h1>Isu dari Nasional hingga Dusun</h1>
          <p>
            Ruang Fakta menghimpun persoalan publik, perkembangan lapangan, sumber, dan suara
            masyarakat dalam satu ruang yang dapat ditelusuri.
          </p>
        </div>
      </section>

      <section className="container content-section">
        {issues.length === 0 ? (
          <div className="empty-state">
            <h2>Belum ada isu</h2>
            <p>Data isu akan tampil di halaman ini setelah tersedia sumber yang dapat ditelusuri.</p>
          </div>
        ) : (
          <div className="issue-grid">
            {issues.map((issue) => {
              const source = issue.sources[0]?.source;
              const latestUpdate = issue.updates[0];

              return (
                <article key={issue.id} className="issue-card">
                  {issue.coverImage ? (
                    <img src={issue.coverImage} alt={issue.title} className="issue-image" />
                  ) : (
                    <div className="issue-image-placeholder">RUANG FAKTA</div>
                  )}

                  <div className="issue-card-content">
                    <div className="issue-meta">
                      <span>{issue.category?.name || "ISU PUBLIK"}</span>
                      <span className="status">{statusLabel(issue.status)}</span>
                    </div>

                    <h2>
                      <Link href={`/isu/${issue.slug}`}>{issue.title}</Link>
                    </h2>

                    <p className="issue-summary">
                      {issue.summary || issue.description.slice(0, 180)}
                    </p>

                    <div className="issue-verification">
                      <span className="verification-label">Verifikasi</span>
                      <span className={`verification verification-${issue.verificationStatus.toLowerCase()}`}>
                        {verificationLabel(issue.verificationStatus)}
                      </span>
                    </div>

                    <div className="issue-location">
                      <span className="issue-location-label">Wilayah</span>
                      <span>
                        {[issue.hamlet, issue.village, issue.district, issue.regency, issue.province]
                          .filter(Boolean)
                          .join(", ") || "Indonesia"}
                      </span>
                    </div>

                    {source && (
                      <div className="issue-source">
                        <div className="issue-source-label">Sumber utama</div>
                        <div className="issue-source-link">{source.publisher || source.title}</div>
                        <div className="issue-source-date">
                          {source.publishedAt ? formatDate(source.publishedAt) : "Tanggal tidak tersedia"}
                        </div>
                      </div>
                    )}

                    {latestUpdate && (
                      <div className="issue-timeline">
                        <div className="issue-timeline-header">
                          <span>Perkembangan terbaru</span>
                          <span>{issue._count.updates} update</span>
                        </div>
                        <div className="issue-timeline-item">
                          <div className="issue-timeline-dot" />
                          <div className="issue-timeline-content">
                            <div className="issue-timeline-date">{formatDate(latestUpdate.createdAt)}</div>
                            <strong>{latestUpdate.title || "Pembaruan isu"}</strong>
                            <p>
                              {latestUpdate.content.length > 150
                                ? `${latestUpdate.content.slice(0, 150)}…`
                                : latestUpdate.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="issue-public-stats">
                      <span>💬 {issue._count.comments} diskusi</span>
                      <span>↕ {issue._count.updates} update</span>
                    </div>

                    <div className="issue-footer">
                      <span>Diperbarui {formatDate(issue.updatedAt)}</span>
                      <Link href={`/isu/${issue.slug}`}>Baca isu & diskusi →</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
