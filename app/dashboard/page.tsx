import Link from "next/link";
import {
  ArticleStatus,
  IssueStatus,
} from "@prisma/client";

import { db } from "@/lib/db";

export const dynamic =
  "force-dynamic";

export default async function DashboardPage() {
  const [
    totalArticles,
    publishedArticles,
    totalIssues,
    activeIssues,
    latestIssues,
  ] = await Promise.all([
    db.article.count(),

    db.article.count({
      where: {
        status:
          ArticleStatus.PUBLISHED,
      },
    }),

    db.issue.count(),

    db.issue.count({
      where: {
        status: {
          in: [
            IssueStatus.OPEN,
            IssueStatus.MONITORING,
            IssueStatus.INVESTIGATING,
          ],
        },
      },
    }),

    db.issue.findMany({
      include: { category: true },

      orderBy: {
        updatedAt: "desc",
      },

      take: 5,
    }),
  ]);

  return (
    <main className="public-page">
      <section className="public-hero">
        <div className="container">
          <span className="section-kicker">
            DATA RUANG FAKTA
          </span>

          <h1>
            Pantau Informasi
            Publik Indonesia
          </h1>

          <p>
            Ringkasan perkembangan
            artikel dan isu yang sedang
            dihimpun oleh Ruang Fakta.
          </p>
        </div>
      </section>

      <section className="container content-section">
        <div className="stats-grid">
          <article className="stat-card">
            <span>
              Total Artikel
            </span>

            <strong>
              {totalArticles}
            </strong>
          </article>

          <article className="stat-card">
            <span>
              Artikel Published
            </span>

            <strong>
              {publishedArticles}
            </strong>
          </article>

          <article className="stat-card">
            <span>
              Total Isu
            </span>

            <strong>
              {totalIssues}
            </strong>
          </article>

          <article className="stat-card">
            <span>
              Isu Aktif
            </span>

            <strong>
              {activeIssues}
            </strong>
          </article>
        </div>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                TERBARU
              </span>

              <h2>
                Isu Terbaru
              </h2>
            </div>

            <Link
              href="/isu"
              className="button-secondary"
            >
              Semua Isu
            </Link>
          </div>

          <div className="dashboard-list">
            {latestIssues.map(
              (issue) => (
                <article
                  key={issue.id}
                  className="dashboard-item"
                >
                  <div>
                    <span>
                      {issue.category?.name ||
                        "ISU PUBLIK"}
                    </span>

                    <h3>
                      <Link
                        href={`/isu/${issue.slug}`}
                      >
                        {issue.title}
                      </Link>
                    </h3>

                    <p>
                      {issue.summary ||
                        issue.description.slice(
                          0,
                          120
                        )}
                    </p>
                  </div>

                  <time>
                    {new Date(
                      issue.updatedAt
                    ).toLocaleDateString(
                      "id-ID"
                    )}
                  </time>
                </article>
              )
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
