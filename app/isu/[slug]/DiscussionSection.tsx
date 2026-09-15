"use client";

import { FormEvent, useEffect, useState } from "react";

interface PublicUser {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  verifiedIdentity: boolean;
  verifiedAccount: boolean;
  verifiedRole: boolean;
  roleTitle: string | null;
  organization: string | null;
}

interface CommentItem {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  user: PublicUser | null;
  replies: CommentItem[];
}

function roleText(user: PublicUser | null) {
  if (!user) return "Pengguna";
  if (user.roleTitle && user.organization) return `${user.roleTitle} · ${user.organization}`;
  if (user.roleTitle) return user.roleTitle;
  return "Warga";
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
    if (content.trim().length < 10) return;

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/isu/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal mengirim komentar.");
      setContent("");
      setMessage(data.message || "Komentar diterima.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mengirim komentar.");
    } finally {
      setBusy(false);
    }
  }

  async function submitReply(event: FormEvent, commentId: string) {
    event.preventDefault();
    if (replyText.trim().length < 5) return;

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(
        `/api/isu/${encodeURIComponent(slug)}/comments/${encodeURIComponent(commentId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: replyText }),
        },
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

  function renderBadges(user: PublicUser | null) {
    if (!user) return null;
    return (
      <>
        {user.verifiedAccount && <span className="rf-badge">✓ Akun</span>}
        {user.verifiedIdentity && <span className="rf-badge">✓ Identitas</span>}
        {user.verifiedRole && <span className="rf-badge rf-badge-role">✓ Peran</span>}
      </>
    );
  }

  return (
    <section className="rf-discussion" aria-labelledby="diskusi-title">
      <div className="rf-discussion-heading">
        <div>
          <span className="rf-eyebrow">RUANG PUBLIK</span>
          <h2 id="diskusi-title">Suara publik & diskusi</h2>
          <p>
            Bagikan pengalaman, informasi, koreksi, atau perspektif. Lencana akun, identitas,
            dan peran adalah hal yang berbeda; tidak ada lencana yang otomatis membuat isi pendapat benar.
          </p>
        </div>
      </div>

      <form className="rf-discussion-form" onSubmit={submitComment}>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Apa yang Anda ketahui, lihat, atau alami terkait isu ini?"
          rows={5}
          maxLength={3000}
          required
        />
        <div className="rf-discussion-actions">
          <span>Kiriman baru masuk moderasi sebelum tampil publik.</span>
          <button type="submit" disabled={busy || content.trim().length < 10}>
            {busy ? "Mengirim…" : "Kirim informasi"}
          </button>
        </div>
      </form>

      {message && <p className="rf-form-message" role="status">{message}</p>}

      <div className="rf-comments">
        {loading ? (
          <div className="rf-comments-skeleton">Memuat diskusi…</div>
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
                      {renderBadges(comment.user)}
                    </div>
                    <div className="rf-comment-role">{roleText(comment.user)}</div>
                  </div>
                </div>
                <time>{formatDate(comment.createdAt)}</time>
              </header>

              <p className="rf-comment-content">{comment.content}</p>

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
                        {renderBadges(reply.user)}
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
