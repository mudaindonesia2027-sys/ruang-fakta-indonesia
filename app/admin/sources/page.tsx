export default function SourcesPage() {
  return (
    <>
      <section className="adminTop">
        <div><div className="eyebrow">SOURCE LIBRARY</div><h1>Sumber</h1><p>Pusat pengelolaan referensi, dokumen, dan sumber informasi.</p></div>
        <button className="primaryButton">+ Tambah sumber</button>
      </section>
      <section className="sourceGrid">
        <article className="adminPanel"><div className="eyebrow">DOKUMEN</div><h2>Dokumen resmi</h2><p>Regulasi, laporan pemerintah, keputusan, dan dokumen publik.</p></article>
        <article className="adminPanel"><div className="eyebrow">PERNYATAAN</div><h2>Pihak terkait</h2><p>Pernyataan resmi yang memiliki konteks waktu dan sumber jelas.</p></article>
        <article className="adminPanel"><div className="eyebrow">DATA</div><h2>Data publik</h2><p>Dataset dan statistik yang dapat ditelusuri kembali.</p></article>
      </section>
    </>
  );
}
