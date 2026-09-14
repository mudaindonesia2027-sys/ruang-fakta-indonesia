export default function SettingsPage() {
  return (
    <>
      <section className="adminTop">
        <div><div className="eyebrow">PLATFORM</div><h1>Pengaturan</h1><p>Fondasi konfigurasi editorial dan operasional.</p></div>
      </section>
      <section className="settingsList">
        <article><h2>Pedoman editorial</h2><p>Aturan publikasi, verifikasi, dan koreksi.</p><button className="secondaryButton">Kelola</button></article>
        <article><h2>Moderasi</h2><p>Aturan komentar dan tindakan moderator.</p><button className="secondaryButton">Kelola</button></article>
        <article><h2>Role & akses</h2><p>Hak akses berdasarkan peran pengguna.</p><button className="secondaryButton">Kelola</button></article>
      </section>
    </>
  );
}
