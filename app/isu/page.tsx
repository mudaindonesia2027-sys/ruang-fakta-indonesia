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
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function IsuPage() {
  const issues = await db.issue.findMany({
    orderBy: {
      updatedAt: "desc",
    },

    take: 100,

    include: {
      category: true,

      sources: {
        include: {
          source: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      },

      updates: {
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
      },

      _count: {
        select: {
          updates: true,
        },
      },
    },
  });

  return (
    <main className="public-page">
      <section className="public-hero">
        <div className="container">
          <span className="section-kicker">
            PANTAU INDONESIA
          </span>

          <h1>Isu dari Nasional hingga Dusun</h1>

          <p>
            Ruang Fakta menghimpun informasi dan perkembangan
            persoalan publik dari berbagai wilayah Indonesia.
          </p>
        </div>
      </section>

      <section className="container content-section">
        {issues.length === 0 ? (
          <div className="empty-state">
            <h2>Belum ada isu</h2>

            <p>
              Data isu akan tampil di halaman ini setelah
              tersedia sumber yang dapat ditelusuri.
            </p>
          </div>
        ) : (
          <div className="issue-grid">
            {issues.map((issue) => {
              const primarySource = issue.sources[0]?.source;

              return (
                <article
                  key={issue.id}
                  className="issue-card"
                >
                  {issue.coverImage ? (
                    <img
                      src={issue.coverImage}
                      alt={issue.title}
                      className="issue-image"
                    />
                  ) : (
                    <div className="issue-image-placeholder">
                      RUANG FAKTA
                    </div>
                  )}

                  <div className="issue-card-content">
                    {/* KATEGORI + STATUS */}
                    <div className="issue-meta">
                      <span>
                        {issue.category?.name || "ISU PUBLIK"}
                      </span>

                      <span className={`status status-${issue.status.toLowerCase()}`}>
                        {statusLabel(issue.status)}
                      </span>
                    </div>

                    {/* JUDUL */}
                    <h2>
                      <Link href={`/isu/${issue.slug}`}>
                        {issue.title}
                      </Link>
                    </h2>

                    {/* RINGKASAN */}
                    <p className="issue-summary">
                      {issue.summary ||
                        issue.description.slice(0, 180)}
                    </p>

                    {/* VERIFIKASI */}
                    <div className="issue-verification">
                      <span className="verification-label">
                        Verifikasi
                      </span>

                      <span
                        className={`verification verification-${issue.verificationStatus.toLowerCase()}`}
                      >
                        {verificationLabel(
                          issue.verificationStatus
                        )}
                      </span>
                    </div>

                    {/* LOKASI */}
                    <div className="issue-location">
                      <span className="issue-location-label">
                        Lokasi
                      </span>

                      <span>
                        {[
                          issue.hamlet,
                          issue.village,
                          issue.district,
                          issue.regency,
                          issue.province,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Indonesia"}
                      </span>
                    </div>

                    {/* SUMBER */}
                    {primarySource && (
                      <div className="issue-source">
                        <div className="issue-source-label">
                          Sumber
                        </div>

                        <a
                          href={primarySource.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="issue-source-link"
                        >
                          {primarySource.publisher ||
                            primarySource.title}
                        </a>

                        <div className="issue-source-date">
                          {primarySource.publishedAt
                            ? formatDate(primarySource.publishedAt)
                            : "Tanggal sumber tidak tersedia"}
                        </div>
                      </div>
                    )}

                    {/* TIMELINE */}
                    {issue.updates.length > 0 && (
                      <div className="issue-timeline">
                        <div className="issue-timeline-header">
                          <span>Perkembangan</span>

                          <span>
                            {issue._count.updates} update
                          </span>
                        </div>

                        {issue.updates.map((update) => (
                          <div
                            key={update.id}
                            className="issue-timeline-item"
                          >
                            <div className="issue-timeline-dot" />

                            <div className="issue-timeline-content">
                              <div className="issue-timeline-date">
                                {formatDateTime(update.createdAt)}
                              </div>

                              {update.title && (
                                <strong>
                                  {update.title}
                                </strong>
                              )}

                              <p>
                                {update.content.length > 150
                                  ? `${update.content.slice(
                                      0,
                                      150
                                    )}…`
                                  : update.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* FOOTER */}
                    <div className="issue-footer">
                      <span>
                        Diperbarui {formatDate(issue.updatedAt)}
                      </span>

                      <Link href={`/isu/${issue.slug}`}>
                        Lihat detail →
                      </Link>
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
