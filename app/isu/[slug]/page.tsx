import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import DiscussionSection from "./DiscussionSection";

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
    where: { slug },
    include: {
      category: true,
      sources: {
        include: { source: true },
        orderBy: { createdAt: "asc" },
      },
      updates: {
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { comments: true, updates: true },
      },
    },
  });

  if (!issue) notFound();

  return (
    <main className="public-page">
      <section className="public-hero public-hero-detail">
        <div className="container">
          <Link href="/isu" className="back-link">← Semua isu</Link>
          <div className="issue-meta">
            <span>{issue.category?.name || "ISU PUBLIK"}</span>
            <span className="status">{statusLabel(issue.status)}</span>
            <span>Verifikasi: {verificationLabel(issue.verificationStatus)}</span>
          </div>
          <h1>{issue.title}</h1>
          {issue.summary && <p>{issue.summary}</p>}
        </div>
      </section>

      <section className="container issue-detail-layout">
        <article className="issue-detail-main">
          {issue.coverImage && (
            <img src={issue.coverImage} alt={issue.title} className="issue-detail-image" />
          )}

          <section className="rf-fact-panel">
            <div>
              <span className="rf-eyebrow">FAKTA YANG TERSEDIA</span>
              <h2>Tentang isu ini</h2>
            </div>
            <p>{issue.description}</p>
          </section>

          <section className="issue-detail-section">
            <div className="issue-detail-section-heading">
              <div>
                <span className="rf-eyebrow">PERKEMBANGAN</span>
                <h2>Timeline isu</h2>
              </div>
              <span>{issue._count.updates} pembaruan</span>
            </div>

            {issue.updates.length === 0 ? (
              <p className="rf-muted">Belum ada pembaruan.</p>
            ) : (
              <div className="issue-detail-timeline">
                {issue.updates.map((update) => (
                  <article key={update.id} className="issue-detail-timeline-item">
                    <div className="issue-detail-timeline-marker" />
                    <div>
                      <time>{formatDateTime(update.createdAt)}</time>
                      {update.title && <h3>{update.title}</h3>}
                      <p>{update.content}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <DiscussionSection slug={slug} />

          <section className="issue-detail-section">
            <div className="issue-detail-section-heading">
              <div>
                <span className="rf-eyebrow">BUKTI & RUJUKAN</span>
                <h2>Sumber</h2>
              </div>
              <span>{issue.sources.length} sumber</span>
            </div>

            <div className="issue-detail-sources">
              {issue.sources.map((item) => (
                <article key={item.id} className="issue-detail-source">
                  <span className="source-type">{item.source.sourceType}</span>
                  <h3>{item.source.title}</h3>
                  {item.source.publisher && <p className="source-publisher">{item.source.publisher}</p>}
                  {item.source.publishedAt && <p className="source-date">{formatDate(item.source.publishedAt)}</p>}
                  {item.source.description && <p>{item.source.description}</p>}
                  {item.note && <p className="source-note">Catatan: {item.note}</p>}
                  {item.source.url && (
                    <a href={item.source.url} target="_blank" rel="noreferrer">Buka sumber asli →</a>
                  )}
                </article>
              ))}
            </div>
          </section>
        </article>

        <aside className="issue-detail-sidebar">
          <section className="issue-info-card">
            <span className="rf-eyebrow">RINGKASAN</span>
            <h2>Informasi isu</h2>
            <dl>
              <div><dt>Status</dt><dd>{statusLabel(issue.status)}</dd></div>
              <div><dt>Verifikasi</dt><dd>{verificationLabel(issue.verificationStatus)}</dd></div>
              <div><dt>Prioritas</dt><dd>{issue.priority}</dd></div>
              <div><dt>Wilayah</dt><dd>{[issue.hamlet, issue.village, issue.district, issue.regency, issue.province].filter(Boolean).join(", ") || "Indonesia"}</dd></div>
              <div><dt>Perkembangan</dt><dd>{issue._count.updates}</dd></div>
              <div><dt>Diskusi publik</dt><dd>{issue._count.comments}</dd></div>
              <div><dt>Pertama dicatat</dt><dd>{formatDate(issue.createdAt)}</dd></div>
              <div><dt>Diperbarui</dt><dd>{formatDate(issue.updatedAt)}</dd></div>
            </dl>
          </section>

          <section className="issue-method-card">
            <span className="rf-eyebrow">CARA MEMBACA</span>
            <h2>Fakta, peran, dan pendapat dipisahkan</h2>
            <p>
              Identitas atau jabatan yang terverifikasi menjelaskan siapa yang berbicara. Itu tidak
              otomatis membuat isi pernyataannya benar. Klaim tetap membutuhkan sumber atau bukti.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
