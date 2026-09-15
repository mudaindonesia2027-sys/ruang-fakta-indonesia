"use client";

import { FormEvent, useEffect, useState } from "react";

interface PublicUser {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  publicLabel: string | null;
  organization: string | null;
  position: string | null;
  verifiedIdentity: boolean;
  verifiedRole: boolean;
  verificationLabel: string | null;
}

interface CommentItem {
  id: string;
  content: string;
  status: string;
  claimStatus: string;
  evidenceUrl: string | null;
  evidenceType: string | null;
  location: string | null;
  isOfficialResponse: boolean;
  createdAt: string;
  user: PublicUser | null;
  replies: CommentItem[];
}

function roleText(user: PublicUser | null) {
  if (!user) return "Pengguna";
  if (user.verificationLabel) return user.verificationLabel;
  if (user.position && user.organization) {
    return `${user.position} · ${user.organization}`;
  }
  if (user.position) return user.position;
  if (user.publicLabel) return user.publicLabel;
  return "Warga";
}

function claimLabel(status: string) {
  const labels: Record<string, string> = {
    UNREVIEWED: "Belum ditinjau",
    REVIEWED: "Sudah ditinjau",
    VERIFIED: "Klaim terverifikasi",
    DISPUTED: "Klaim diperdebatkan",
  };
  return labels[status] || status;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function DiscussionSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceType, setEvidenceType] = useState("LINK");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  async function loadComments() {
    setLoading(true);
    try {
      const response = await fetch(`/api/isu/${encodeURIComponent(slug)}/comments?take=30`, {
        cache: "no-store",
      });
      const data = await response.json();
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch {
      setMessage("Diskusi belum dapat dimuat. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, [slug]);

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(`/api/isu/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          evidenceUrl,
          evidenceType,
          location,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal mengirim komentar.");

      setContent("");
      setEvidenceUrl("");
      setLocation("");
      setMessage(data.message || "Komentar diterima.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mengirim komentar.");
    } finally {
      setBusy(false);
    }
  }

  async function submitReply(event: FormEvent, commentId: string) {
    event.preventDefault();
    if (!replyText.trim()) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/isu/${encodeURIComponent(slug)}/comments/${encodeURIComponent(commentId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: replyText }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal mengirim balasan.");

      setReplyText("");
      setReplyTo(null);
      setMessage(data.message || "Balasan diterima.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mengirim balasan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rf-discussion" aria-labelledby="diskusi-title">
      <div className="rf-discussion-heading">
        <div>
          <span className="rf-eyebrow">RUANG PUBLIK</span>
          <h2 id="diskusi-title">Suara publik & diskusi</h2>
          <p>
            Bagikan pengalaman, informasi, koreksi, atau perspektif. Identitas dan jabatan dapat
            diverifikasi, tetapi verifikasi identitas tidak otomatis berarti isi pendapat benar.
          </p>
        </div>
      </div>

      <form className="rf-discussion-form" onSubmit={submitComment}>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Apa yang Anda ketahui, lihat, atau alami terkait isu ini?"
          rows={5}
          maxLength={5000}
          required
        />

        <div className="rf-form-grid">
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Lokasi (opsional)"
            maxLength={160}
          />

          <select value={evidenceType} onChange={(event) => setEvidenceType(event.target.value)}>
            <option value="LINK">Tautan bukti</option>
            <option value="DOCUMENT">Dokumen</option>
            <option value="PHOTO">Foto</option>
            <option value="VIDEO">Video</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </div>

        <input
          value={evidenceUrl}
          onChange={(event) => setEvidenceUrl(event.target.value)}
          placeholder="URL bukti / sumber (opsional)"
          inputMode="url"
          maxLength={1000}
        />

        <div className="rf-discussion-actions">
          <span>Semua kiriman baru masuk moderasi sebelum tampil.</span>
          <button type="submit" disabled={busy || content.trim().length < 10}>
            {busy ? "Mengirim…" : "Kirim informasi"}
          </button>
        </div>
      </form>

      {message && <p className="rf-form-message">{message}</p>}

      <div className="rf-comments">
        {loading ? (
          <div className="rf-comments-skeleton">
            Memuat diskusi…
          </div>
        ) : comments.length === 0 ? (
          <div className="rf-empty-discussion">
            <strong>Belum ada diskusi publik.</strong>
            <span>Jadilah orang pertama yang menambahkan informasi yang dapat diperiksa.</span>
          </div>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="rf-comment">
              <header className="rf-comment-header">
                <div className="rf-comment-person">
                  {comment.user?.avatarUrl ? (
                    <img src={comment.user.avatarUrl} alt="" className="rf-avatar" />
                  ) : (
                    <div className="rf-avatar rf-avatar-fallback">R</div>
                  )}
                  <div>
                    <div className="rf-comment-name-row">
                      <strong>{comment.user?.name || "Pengguna"}</strong>
                      {comment.user?.verifiedIdentity && <span className="rf-badge">✓ Identitas</span>}
                      {comment.user?.verifiedRole && <span className="rf-badge rf-badge-role">✓ Peran</span>}
                      {comment.isOfficialResponse && <span className="rf-badge rf-badge-official">Tanggapan resmi</span>}
                    </div>
                    <div className="rf-comment-role">{roleText(comment.user)}</div>
                  </div>
                </div>
                <time>{formatDate(comment.createdAt)}</time>
              </header>

              <p className="rf-comment-content">{comment.content}</p>

              <div className="rf-comment-meta">
                <span>{claimLabel(comment.claimStatus)}</span>
                {comment.location && <span>📍 {comment.location}</span>}
                {comment.evidenceUrl && (
                  <a href={comment.evidenceUrl} target="_blank" rel="noreferrer">
                    Lihat bukti →
                  </a>
                )}
              </div>

              <div className="rf-comment-actions">
                <button type="button" onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}>
                  Balas
                </button>
              </div>

              {replyTo === comment.id && (
                <form className="rf-reply-form" onSubmit={(event) => submitReply(event, comment.id)}>
                  <textarea
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                    placeholder="Tulis balasan yang relevan dan berbasis fakta…"
                    rows={3}
                    maxLength={3000}
                    required
                  />
                  <button type="submit" disabled={busy || replyText.trim().length < 5}>
                    {busy ? "Mengirim…" : "Kirim balasan"}
                  </button>
                </form>
              )}

              {comment.replies.length > 0 && (
                <div className="rf-replies">
                  {comment.replies.map((reply) => (
                    <article key={reply.id} className="rf-reply">
                      <div className="rf-comment-name-row">
                        <strong>{reply.user?.name || "Pengguna"}</strong>
                        {reply.user?.verifiedIdentity && <span className="rf-badge">✓ Identitas</span>}
                        {reply.user?.verifiedRole && <span className="rf-badge rf-badge-role">✓ Peran</span>}
                      </div>
                      <div className="rf-comment-role">{roleText(reply.user)}</div>
                      <p>{reply.content}</p>
                      <time>{formatDate(reply.createdAt)}</time>
                    </article>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
