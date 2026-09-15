import Link from "next/link";
import OAuthSignIn from "@/components/auth/oauth-sign-in";

export default function LoginPage() {
  return (
    <main className="loginPage">
      <section className="loginCard">
        <p className="eyebrow">RUANG FAKTA</p>
        <h1>Masuk untuk ikut membangun ruang diskusi yang lebih sehat.</h1>
        <p>
          Gunakan akun yang sudah kamu pakai sehari-hari. Setelah masuk,
          sistem keamanan RUANG FAKTA membantu menjaga ruang ini dari bot dan penyalahgunaan.
        </p>

        <div className="loginProviders">
          <OAuthSignIn provider="google" />
          <OAuthSignIn provider="facebook" />
        </div>

        <p className="loginFootnote">
          Akun terverifikasi berarti akun login berhasil terhubung dengan penyedia autentikasi.
          Ini bukan verifikasi identitas hukum dan tidak menentukan apakah suatu klaim benar.
        </p>

        <Link href="/" className="backLink">← Kembali ke beranda</Link>
      </section>
    </main>
  );
}
