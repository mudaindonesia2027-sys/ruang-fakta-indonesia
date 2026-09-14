"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Overview = {
  statistics: {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;

    totalIssues: number;
    openIssues: number;
    resolvedIssues: number;
  };

  latestArticles: Array<{
    id: string;
    title: string;
    status: string;
    updatedAt: string;
  }>;

  latestIssues: Array<{
    id: string;
    title: string;
    status: string;
    updatedAt: string;
  }>;
};

export default function AdminPage() {
  const [data, setData] =
    useState<Overview | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          "/api/admin/overview",
          {
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <main className="admin-page">
        <p>Memuat dashboard...</p>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <span className="section-kicker">
            RUANG FAKTA CMS
          </span>

          <h1>
            Dashboard Administrasi
          </h1>

          <p>
            Kelola artikel, isu, dan
            perkembangan informasi publik.
          </p>
        </div>

        <div className="admin-actions">
          <Link
            href="/admin/articles/new"
            className="button-primary"
          >
            + Artikel Baru
          </Link>

          <Link
            href="/admin/issues/new"
            className="button-secondary"
          >
            + Isu Baru
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Total Artikel</span>

          <strong>
            {data?.statistics.totalArticles ?? 0}
          </strong>
        </article>

        <article className="stat-card">
          <span>Artikel Published</span>

          <strong>
            {data?.statistics.publishedArticles ??
              0}
          </strong>
        </article>

        <article className="stat-card">
          <span>Total Isu</span>

          <strong>
            {data?.statistics.totalIssues ?? 0}
          </strong>
        </article>

        <article className="stat-card">
          <span>Isu Aktif</span>

          <strong>
            {data?.statistics.openIssues ?? 0}
          </strong>
        </article>
      </section>

      <section className="admin-grid">
        <div className="admin-panel">
          <div className="panel-heading">
            <h2>Artikel Terbaru</h2>

            <Link href="/admin/articles">
              Lihat semua
            </Link>
          </div>

          <div className="admin-list">
            {data?.latestArticles.length ? (
              data.latestArticles.map(
                (article) => (
                  <article
                    key={article.id}
                    className="admin-list-item"
                  >
                    <div>
                      <strong>
                        {article.title}
                      </strong>

                      <small>
                        {article.status}
                      </small>
                    </div>

                    <time>
                      {new Date(
                        article.updatedAt
                      ).toLocaleDateString(
                        "id-ID"
                      )}
                    </time>
                  </article>
                )
              )
            ) : (
              <p className="empty-state">
                Belum ada artikel.
              </p>
            )}
          </div>
        </div>

        <div className="admin-panel">
          <div className="panel-heading">
            <h2>Isu Terbaru</h2>

            <Link href="/admin/issues">
              Lihat semua
            </Link>
          </div>

          <div className="admin-list">
            {data?.latestIssues.length ? (
              data.latestIssues.map(
                (issue) => (
                  <article
                    key={issue.id}
                    className="admin-list-item"
                  >
                    <div>
                      <strong>
                        {issue.title}
                      </strong>

                      <small>
                        {issue.status}
                      </small>
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
              )
            ) : (
              <p className="empty-state">
                Belum ada isu.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
