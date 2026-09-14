import Link from "next/link";
import GoogleSignIn from "@/components/auth/google-sign-in";

export default function LoginPage() {
  return (
    <main className="loginPage">
      <section className="loginCard">
        <p className="eyebrow">RUANG FAKTA</p>
        <h1>Masuk untuk ikut membangun ruang diskusi yang lebih sehat.</h1>
        <p>
          Gunakan akun Google untuk masuk. Setelah autentikasi berhasil,
          akses akan disesuaikan dengan peran pengguna.
        </p>

        <GoogleSignIn />

        <div className="loginDivider"><span>atau</span></div>

        <form className="loginForm">
          <input type="email" placeholder="Email" disabled />
          <input type="password" placeholder="Password" disabled />
          <button type="button" className="secondaryButton" disabled>
            Login email segera tersedia
          </button>
        </form>

        <p className="loginFootnote">
          Dengan masuk, pengguna menyetujui pedoman komunitas dan kebijakan privasi.
        </p>

        <Link href="/" className="backLink">← Kembali ke beranda</Link>
      </section>
    </main>
  );
}
