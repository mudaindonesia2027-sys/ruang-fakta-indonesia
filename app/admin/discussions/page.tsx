import { CommentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import ModerationActions from "./ModerationActions";

export const dynamic = "force-dynamic";

export default async function DiscussionsPage() {
  const comments = await db.comment.findMany({
    where: { status: { in: [CommentStatus.PENDING, CommentStatus.REJECTED, CommentStatus.HIDDEN] } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      content: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, username: true } },
      article: { select: { title: true, slug: true } },
      issue: { select: { title: true, slug: true } },
    },
  });

  return (
    <>
      <section className="adminTop">
        <div>
          <div className="eyebrow">MODERATION</div>
          <h1>Diskusi</h1>
          <p>Moderasi percakapan yang benar-benar masuk ke sistem. Tidak ada contoh atau data tiruan.</p>
        </div>
      </section>
      <section className="moderationList">
        {comments.length === 0 ? (
          <div className="admin-panel">
            <h2>Tidak ada komentar yang menunggu tindakan</h2>
            <p>Semua komentar saat ini sudah melewati antrean moderasi atau belum ada komentar baru.</p>
          </div>
        ) : comments.map((comment) => {
          const context = comment.issue?.title ? `Isu: ${comment.issue.title}` : comment.article?.title ? `Artikel: ${comment.article.title}` : "Diskusi umum";
          const author = comment.user?.name || comment.user?.username || "Pengguna";
          return (
            <article className="moderationItem" key={comment.id}>
              <p>“{comment.content}”</p>
              <small>{author} · {context}</small>
              <ModerationActions commentId={comment.id} status={comment.status} />
            </article>
          );
        })}
      </section>
    </>
  );
}
