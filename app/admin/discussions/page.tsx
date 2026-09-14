const comments = [
  ["Perlu ditambahkan sumber resmi agar pembaca bisa memeriksa konteksnya.", "PENDING", "Artikel: Dampak Kebijakan"],
  ["Saya memiliki data tambahan yang mungkin relevan dengan isu ini.", "VISIBLE", "Isu: Pelayanan Publik"],
  ["Komentar dilaporkan oleh pengguna.", "REPORTED", "Diskusi umum"]
];

export default function DiscussionsPage() {
  return (
    <>
      <section className="adminTop">
        <div><div className="eyebrow">MODERATION</div><h1>Diskusi</h1><p>Moderasi percakapan sambil menjaga ruang publik yang sehat.</p></div>
      </section>
      <section className="moderationList">
        {comments.map(([text, status, context]) => (
          <article className="moderationItem" key={text}>
            <span className={`adminStatus ${status}`}>{status}</span>
            <p>“{text}”</p>
            <small>{context}</small>
            <div><button className="secondaryButton">Tinjau</button><button className="dangerButton">Moderasi</button></div>
          </article>
        ))}
      </section>
    </>
  );
}
