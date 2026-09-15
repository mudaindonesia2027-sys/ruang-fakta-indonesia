import Link from "next/link";
import { notFound } from "next/navigation";
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
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const issue = await db.issue.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,

      sources: {
        include: {
          source: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },

      updates: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!issue) {
    notFound();
  }

  return (
    <main className="public-page">
      <article className="container issue-detail">
        <Link href="/isu" className="back-link">
          ← Semua Isu
        </Link>

        <div className="issue-meta">
          <span>
            {issue.category?.name || "ISU PUBLIK"}
          </span>

          <span>
            {statusLabel(issue.status)}
          </span>

          <span>
            Verifikasi:{" "}
            {verificationLabel(issue.verificationStatus)}
          </span>
        </div>

        <h1>{issue.title}</h1>

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
          <h2>Tentang Isu</h2>

          <p>{issue.description}</p>
        </section>

        <section className="issue-location">
          <h2>Wilayah</h2>

          <ul>
            {issue.province && (
              <li>
                Provinsi: {issue.province}
              </li>
            )}

            {issue.regency && (
              <li>
                Kabupaten/Kota: {issue.regency}
              </li>
            )}

            {issue.district && (
              <li>
                Kecamatan: {issue.district}
              </li>
            )}

            {issue.village && (
              <li>
                Desa/Kelurahan: {issue.village}
              </li>
            )}

            {issue.hamlet && (
              <li>
                Dusun: {issue.hamlet}
              </li>
            )}

            {issue.address && (
              <li>
                Alamat: {issue.address}
              </li>
            )}
          </ul>
        </section>

        <section className="issue-content">
          <h2>Informasi Isu</h2>

          <ul>
            <li>
              Status: {statusLabel(issue.status)}
            </li>

            <li>
              Prioritas: {issue.priority}
            </li>

            <li>
              Verifikasi:{" "}
              {verificationLabel(
                issue.verificationStatus
              )}
            </li>

            <li>
              Pertama dicatat:{" "}
              {formatDate(issue.createdAt)}
            </li>

            <li>
              Diperbarui:{" "}
              {formatDate(issue.updatedAt)}
            </li>
          </ul>
        </section>

        <section className="issue-updates">
          <h2>Perkembangan Isu</h2>

          {issue.updates.length === 0 ? (
            <p>
              Belum ada pembaruan.
            </p>
          ) : (
            <div className="issue-timeline">
              {issue.updates.map((update) => (
                <article
                  key={update.id}
                  className="timeline-item"
                >
                  <time>
                    {formatDateTime(
                      update.createdAt
                    )}
                  </time>

                  {update.title && (
                    <h3>
                      {update.title}
                    </h3>
                  )}

                  <p>
                    {update.content}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="issue-content">
          <h2>Sumber</h2>

          {issue.sources.length === 0 ? (
            <p>
              Belum ada sumber yang dicatat.
            </p>
          ) : (
            <div className="issue-sources">
              {issue.sources.map((item) => (
                <article
                  key={item.id}
                  className="source-card"
                >
                  <span>
                    {item.source.sourceType}
                  </span>

                  <h3>
                    {item.source.title}
                  </h3>

                  {item.source.publisher && (
                    <p>
                      {item.source.publisher}
                    </p>
                  )}

                  {item.source.publishedAt && (
                    <p>
                      Diterbitkan:{" "}
                      {formatDate(
                        item.source.publishedAt
                      )}
                    </p>
                  )}

                  {item.note && (
                    <p>
                      Catatan: {item.note}
                    </p>
                  )}

                  {item.source.url && (
                    <a
                      href={item.source.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka sumber asli →
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="issue-content">
          <h2>Catatan Verifikasi</h2>

          <p>
            Status penanganan dan status verifikasi
            merupakan dua hal yang berbeda. Suatu isu
            dapat sedang ditangani oleh pihak terkait
            tanpa seluruh informasi mengenai isu tersebut
            dinyatakan telah terverifikasi.
          </p>
        </section>
      </article>
    </main>
  );
}