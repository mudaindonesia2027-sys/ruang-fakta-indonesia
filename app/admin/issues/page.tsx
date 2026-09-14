"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

type Issue = {
  id: string;
  title: string;
  slug: string;
  category: { name: string } | null;
  province: string | null;
  status: string;
  priority: string;
  updatedAt: string;
};

export default function AdminIssuesPage() {
  const [issues, setIssues] =
    useState<Issue[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadIssues() {
      try {
        const response =
          await fetch(
            "/api/issues?limit=100",
            {
              cache: "no-store",
            }
          );

        const result =
          await response.json();

        if (result.success) {
          setIssues(result.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadIssues();
  }, []);

  async function deleteIssue(
    id: string
  ) {
    if (
      !window.confirm(
        "Hapus isu ini?"
      )
    ) {
      return;
    }

    try {
      const response =
        await fetch(
          `/api/issues/${id}`,
          {
            method: "DELETE",
          }
        );

      const result =
        await response.json();

      if (result.success) {
        setIssues((current) =>
          current.filter(
            (issue) =>
              issue.id !== id
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
            Manajemen Isu
          </h1>

          <p>
            Pantau isu dari nasional
            hingga desa dan dusun.
          </p>
        </div>

        <Link
          href="/admin/issues/new"
          className="button-primary"
        >
          + Tambah Isu
        </Link>
      </section>

      <section className="admin-panel">
        {loading ? (
          <p>Memuat isu...</p>
        ) : issues.length === 0 ? (
          <div className="empty-state">
            <p>
              Belum ada isu.
            </p>

            <Link
              href="/admin/issues/new"
              className="button-primary"
            >
              Buat Isu Pertama
            </Link>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Isu</th>
                  <th>Wilayah</th>
                  <th>Status</th>
                  <th>Prioritas</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {issues.map(
                  (issue) => (
                    <tr key={issue.id}>
                      <td>
                        <strong>
                          {issue.title}
                        </strong>

                        <small>
                          {issue.category?.name ||
                            "Tanpa kategori"}
                        </small>
                      </td>

                      <td>
                        {issue.province ||
                          "Indonesia"}
                      </td>

                      <td>
                        <span className="status-badge">
                          {issue.status}
                        </span>
                      </td>

                      <td>
                        {issue.priority}
                      </td>

                      <td>
                        <div className="table-actions">
                          <Link
                            href={`/isu/${issue.slug}`}
                          >
                            Lihat
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              deleteIssue(
                                issue.id
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
