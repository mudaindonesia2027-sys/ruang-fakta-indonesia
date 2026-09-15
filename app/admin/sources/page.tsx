import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const sources = await db.source.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      url: true,
      publisher: true,
      sourceType: true,
      publishedAt: true,
      _count: { select: { articles: true, issues: true } },
    },
  });

  return (
    <>
      <section className="adminTop">
        <div><div className="eyebrow">SOURCE LIBRARY</div><h1>Sumber</h1><p>Daftar referensi yang benar-benar tercatat dan digunakan oleh artikel atau isu.</p></div>
      </section>
      <section className="sourceGrid">
        {sources.length === 0 ? (
          <article className="adminPanel"><h2>Belum ada sumber tercatat</h2><p>Sumber akan muncul ketika artikel atau isu menyimpan referensi yang valid.</p></article>
        ) : sources.map((source) => (
          <article className="adminPanel" key={source.id}>
            <div className="eyebrow">{source.sourceType}</div>
            <h2>{source.title}</h2>
            <p>{source.publisher || "Penerbit tidak dicatat"}</p>
            <small>{source._count.articles} artikel · {source._count.issues} isu{source.publishedAt ? ` · ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(source.publishedAt)}` : ""}</small>
            {source.url && <p><a href={source.url} target="_blank" rel="noreferrer">Buka sumber asli →</a></p>}
          </article>
        ))}
      </section>
    </>
  );
}
