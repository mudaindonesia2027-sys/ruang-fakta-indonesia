const queue = [
  ["Artikel", "Memahami dampak perubahan kebijakan terhadap masyarakat", "Editor A"],
  ["Isu", "Laporan masalah lingkungan", "Kontributor B"],
  ["Artikel", "Data terbaru yang perlu diperhatikan publik", "Editor C"]
];

export default function ReviewPage() {
  return (
    <>
      <section className="adminTop">
        <div><div className="eyebrow">EDITORIAL WORKFLOW</div><h1>Review Queue</h1><p>Konten menunggu pemeriksaan editorial dan verifikasi.</p></div>
      </section>
      <section className="reviewQueue">
        {queue.map(([type, title, author]) => (
          <article className="reviewItem" key={title}>
            <span className="reviewType">{type}</span>
            <div><h2>{title}</h2><p>Dikirim oleh {author}</p></div>
            <div className="reviewActions"><button className="secondaryButton">Kembalikan</button><button className="primaryButton">Review</button></div>
          </article>
        ))}
      </section>
    </>
  );
}
