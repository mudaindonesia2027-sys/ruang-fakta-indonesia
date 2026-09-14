import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic =
  "force-dynamic";

function statusLabel(status: string) {
  const labels: Record<
    string,
    string
  > = {
    OPEN: "Terbuka",
    MONITORING: "Dipantau",
    INVESTIGATING: "Ditindaklanjuti",
    RESOLVED: "Selesai",
    CLOSED: "Arsip",
  };

  return labels[status] || status;
}

export default async function IsuPage() {
  const issues =
    await db.issue.findMany({
      orderBy: {
        updatedAt: "desc",
      },

      take: 100,

      include: {
        category: true,

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

          <h1>
            Isu dari Nasional
            hingga Dusun
          </h1>

          <p>
            Ruang Fakta menghimpun
            informasi dan perkembangan
            persoalan publik dari berbagai
            wilayah Indonesia.
          </p>
        </div>
      </section>

      <section className="container content-section">
        {issues.length === 0 ? (
          <div className="empty-state">
            <h2>
              Belum ada isu
            </h2>

            <p>
              Data isu akan tampil di
              halaman ini.
            </p>
          </div>
        ) : (
          <div className="issue-grid">
            {issues.map(
              (issue) => (
                <article
                  key={issue.id}
                  className="issue-card"
                >
                  {issue.coverImage ? (
                    <img
                      src={
                        issue.coverImage
                      }
                      alt={issue.title}
                      className="issue-image"
                    />
                  ) : (
                    <div className="issue-image-placeholder">
                      RUANG FAKTA
                    </div>
                  )}

                  <div className="issue-card-content">
                    <div className="issue-meta">
                      <span>
                        {issue.category?.name ||
                          "ISU PUBLIK"}
                      </span>

                      <span>
                        {statusLabel(
                          issue.status
                        )}
                      </span>
                    </div>

                    <h2>
                      <Link
                        href={`/isu/${issue.slug}`}
                      >
                        {issue.title}
                      </Link>
                    </h2>

                    <p>
                      {issue.summary ||
                        issue.description.slice(
                          0,
                          160
                        )}
                    </p>

                    <div className="issue-footer">
                      <span>
                        📍{" "}
                        {[
                          issue.province,
                          issue.regency,
                          issue.village,
                        ]
                          .filter(Boolean)
                          .join(", ") ||
                          "Indonesia"}
                      </span>

                      <span>
                        {issue._count
                          .updates} update
                      </span>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}
