import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic =
  "force-dynamic";

export default async function ContohIssuePage() {
  const issue =
    await db.issue.findFirst({
      orderBy: {
        updatedAt: "desc",
      },

      include: {
        category: true,

        updates: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!issue) {
    return (
      <main className="public-page">
        <section className="container content-section">
          <div className="empty-state">
            <h1>
              Belum ada isu
            </h1>

            <p>
              Tambahkan isu melalui
              halaman administrasi.
            </p>

            <Link
              href="/isu"
              className="button-primary"
            >
              Kembali ke Isu
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="public-page">
      <article className="container issue-detail">
        <Link
          href="/isu"
          className="back-link"
        >
          ← Semua Isu
        </Link>

        <div className="issue-meta">
          <span>
            {issue.category?.name ||
              "ISU PUBLIK"}
          </span>

          <span>
            {issue.status}
          </span>
        </div>

        <h1>
          {issue.title}
        </h1>

        {issue.summary && (
          <p className="issue-lead">
            {issue.summary}
          </p>
        )}

        {issue.coverImage && (
          <img
            src={issue.coverImage}
            alt={issue.title}
            className="issue-detail-image"
          />
        )}

        <section className="issue-content">
          <h2>
            Kronologi
          </h2>

          <p>
            {issue.description}
          </p>
        </section>

        <section className="issue-location">
          <h2>
            Wilayah
          </h2>

          <ul>
            {issue.province && (
              <li>
                Provinsi:{" "}
                {issue.province}
              </li>
            )}

            {issue.regency && (
              <li>
                Kabupaten/Kota:{" "}
                {issue.regency}
              </li>
            )}

            {issue.district && (
              <li>
                Kecamatan:{" "}
                {issue.district}
              </li>
            )}

            {issue.village && (
              <li>
                Desa/Kelurahan:{" "}
                {issue.village}
              </li>
            )}

            {issue.hamlet && (
              <li>
                Dusun:{" "}
                {issue.hamlet}
              </li>
            )}
          </ul>
        </section>

        <section className="issue-updates">
          <h2>
            Perkembangan Isu
          </h2>

          {issue.updates.length ===
          0 ? (
            <p>
              Belum ada pembaruan.
            </p>
          ) : (
            issue.updates.map(
              (update) => (
                <article
                  key={update.id}
                  className="timeline-item"
                >
                  <time>
                    {new Date(
                      update.createdAt
                    ).toLocaleDateString(
                      "id-ID",
                      {
                        dateStyle:
                          "long",
                      }
                    )}
                  </time>

                  <h3>
                    {update.title}
                  </h3>

                  <p>
                    {update.content}
                  </p>
                </article>
              )
            )
          )}
        </section>
      </article>
    </main>
  );
}
