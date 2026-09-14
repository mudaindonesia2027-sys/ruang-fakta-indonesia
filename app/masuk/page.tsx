export default function LoginPage() {
  return (
    <main className="authPage">
      <a className="brand" href="/">RUANG <span>FAKTA</span></a>
      <section className="authCard">
        <div className="eyebrow">AKUN PENGGUNA</div>
        <h1>Masuk ke Ruang Fakta</h1>
        <p>Fondasi UI autentikasi sudah disiapkan. Integrasi provider autentikasi menjadi tahap implementasi berikutnya.</p>
        <form>
          <label>Email<input type="email" placeholder="nama@email.com" disabled /></label>
          <label>Password<input type="password" placeholder="••••••••" disabled /></label>
          <button className="primaryButton" type="button" disabled>Masuk</button>
        </form>
      </section>
    </main>
  );
}
