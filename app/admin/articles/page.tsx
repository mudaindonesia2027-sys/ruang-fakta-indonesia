"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Article = {
  id: string;
  title: string;
  slug: string;
  category: { name: string } | null;
  status: string;
  updatedAt: string;
};

export default function AdminArticlesPage() {
  const [articles, setArticles] =
    useState<Article[]>([]);

  const [loading, setLoading] =
    useState(true);

  async function loadArticles() {
    try {
      const response = await fetch(
        "/api/articles?limit=100",
        {
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (result.success) {
        setArticles(result.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  async function deleteArticle(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Hapus artikel ini?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/articles/${id}`,
        {
          method: "DELETE",
        }
      );

      const result =
        await response.json();

      if (result.success) {
        setArticles((current) =>
          current.filter(
            (article) =>
              article.id !== id
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <span className="section-kicker">
            CMS
          </span>

          <h1>
            Manajemen Artikel
          </h1>

          <p>
            Kelola seluruh artikel
            Ruang Fakta.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="button-primary"
        >
          + Buat Artikel
        </Link>
      </section>

      <section className="admin-panel">
        {loading ? (
          <p>Memuat artikel...</p>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <p>
              Belum ada artikel.
            </p>

            <Link
              href="/admin/articles/new"
              className="button-primary"
            >
              Buat Artikel Pertama
            </Link>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Artikel</th>
                  <th>Kategori</th>
                  <th>Status</th>
                  <th>Update</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {articles.map(
                  (article) => (
                    <tr key={article.id}>
                      <td>
                        <strong>
                          {article.title}
                        </strong>

                        <small>
                          /{article.slug}
                        </small>
                      </td>

                      <td>
                        {article.category?.name ||
                          "-"}
                      </td>

                      <td>
                        <span className="status-badge">
                          {article.status}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          article.updatedAt
                        ).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>

                      <td>
                        <div className="table-actions">
                          <Link
                            href={`/admin/editor?id=${article.id}`}
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              deleteArticle(
                                article.id
                              )
                            }
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
