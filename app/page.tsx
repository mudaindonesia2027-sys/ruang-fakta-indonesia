import Link from "next/link";
import Header from "@/components/Header";

const featuredIssues = [
  {
    category: "Nasional",
    title: "Arah kebijakan nasional dan dampaknya terhadap kehidupan masyarakat",
    description:
      "Ikuti perkembangan isu publik, kebijakan, pelayanan, dan perubahan yang berdampak pada warga Indonesia.",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85",
    href: "/isu",
  },
  {
    category: "Daerah",
    title: "Cerita dan persoalan dari berbagai wilayah Indonesia",
    description:
      "Informasi dari kota, kabupaten, kecamatan, hingga komunitas masyarakat.",
    image:
      "https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=900&q=85",
    href: "/isu",
  },
  {
    category: "Lingkungan",
    title: "Masyarakat, alam, dan perubahan yang terjadi di sekitar kita",
    description:
      "Pantau isu lingkungan, ruang hidup, infrastruktur, dan kondisi wilayah.",
    image:
      "https://images.unsplash.com/photo-1542897645-1b7d2c27f0f3?auto=format&fit=crop&w=900&q=85",
    href: "/isu",
  },
];

const regions = [
  {
    number: "01",
    title: "Nasional",
    text: "Isu dan kebijakan yang berdampak luas bagi Indonesia.",
    href: "/isu",
  },
  {
    number: "02",
    title: "Provinsi",
    text: "Perkembangan dan persoalan dari berbagai provinsi.",
    href: "/isu",
  },
  {
    number: "03",
    title: "Kabupaten & Kota",
    text: "Informasi lokal yang dekat dengan kehidupan masyarakat.",
    href: "/isu",
  },
  {
    number: "04",
    title: "Kecamatan",
    text: "Perubahan pelayanan dan isu di tingkat wilayah.",
    href: "/isu",
  },
  {
    number: "05",
    title: "Desa",
    text: "Suara warga, pembangunan, dan kehidupan desa.",
    href: "/isu",
  },
  {
    number: "06",
    title: "Dusun",
    text: "Persoalan terkecil yang sering tidak terlihat dari pusat.",
    href: "/isu",
  },
];

const topics = [
  {
    icon: "▣",
    title: "Pemerintahan",
    text: "Kebijakan, pelayanan publik, pemerintahan, dan administrasi.",
  },
  {
    icon: "◉",
    title: "Ekonomi",
    text: "Harga, pekerjaan, usaha, pasar, dan kehidupan ekonomi warga.",
  },
  {
    icon: "⌂",
    title: "Desa & Wilayah",
    text: "Informasi pembangunan dan persoalan masyarakat lokal.",
  },
  {
    icon: "▤",
    title: "Data & Fakta",
    text: "Angka, dokumen, sumber terbuka, dan informasi yang dapat diperiksa.",
  },
  {
    icon: "△",
    title: "Lingkungan",
    text: "Bencana, perubahan lingkungan, ruang hidup, dan sumber daya.",
  },
  {
    icon: "◎",
    title: "Suara Masyarakat",
    text: "Cerita, laporan, diskusi, dan pengalaman masyarakat.",
  },
];

const videos = [
  {
    title: "Cerita dari wilayah: suara masyarakat yang jarang terdengar",
    image:
      "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1000&q=85",
    duration: "08:24",
  },
  {
    title: "Membaca perubahan dari tingkat nasional hingga daerah",
    image:
      "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=1000&q=85",
    duration: "12:10",
  },
  {
    title: "Kehidupan masyarakat dan perubahan di wilayah Indonesia",
    image:
      "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=1000&q=85",
    duration: "06:42",
  },
];

const stats = [
  {
    number: "38",
    label: "Provinsi Indonesia",
  },
  {
    number: "500+",
    label: "Wilayah kabupaten dan kota",
  },
  {
    number: "74.000+",
    label: "Desa di seluruh Indonesia",
  },
  {
    number: "1",
    label: "Ruang publik bersama",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-copy">
              <div className="hero-eyebrow">
                <span className="pulse-dot" />
                INFORMASI PUBLIK UNTUK INDONESIA
              </div>

              <h1>
                Fakta nasional.
                <br />
                Suara daerah.
                <br />
                Cerita dari masyarakat.
              </h1>

              <p className="hero-description">
                RUANG FAKTA menghubungkan informasi dari tingkat nasional hingga
                desa dan dusun. Mengikuti isu masyarakat, data, kebijakan, dan
                perubahan yang terjadi di seluruh Indonesia.
              </p>

              <div className="hero-actions">
                <Link href="/isu" className="button-primary">
                  Jelajahi Isu
                  <span>→</span>
                </Link>

                <Link href="/dashboard" className="button-secondary">
                  Lihat Data & Fakta
                </Link>
              </div>

              <div className="hero-trust">
                <div className="trust-item">
                  <span className="trust-icon">✓</span>
                  Sumber terbuka
                </div>

                <div className="trust-item">
                  <span className="trust-icon">✓</span>
                  Informasi publik
                </div>

                <div className="trust-item">
                  <span className="trust-icon">✓</span>
                  Perspektif masyarakat
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-card">
                <img
                  src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=90"
                  alt="Visual kawasan dan kehidupan di Indonesia"
                />

                <div className="hero-image-overlay" />

                <div className="hero-image-content">
                  <span className="hero-image-label">RUANG INDONESIA</span>

                  <h2>
                    Melihat Indonesia
                    <br />
                    dari lebih dekat.
                  </h2>

                  <p>
                    Dari isu nasional hingga persoalan yang terjadi di sekitar
                    masyarakat.
                  </p>
                </div>

                <div className="hero-floating-card hero-floating-card-one">
                  <span className="floating-label">CAKUPAN</span>
                  <strong>Nasional → Dusun</strong>
                </div>

                <div className="hero-floating-card hero-floating-card-two">
                  <span className="live-dot" />
                  <div>
                    <span className="floating-label">ISU PUBLIK</span>
                    <strong>Terus berkembang</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="content-container stats-grid">
            {stats.map((item) => (
              <div className="stat-item" key={item.label}>
                <strong>{item.number}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section section-featured">
          <div className="content-container">
            <div className="section-heading">
              <div>
                <span className="section-kicker">YANG SEDANG DIBICARAKAN</span>

                <h2>Isu yang perlu diperhatikan</h2>

                <p>
                  Perkembangan informasi dan persoalan yang memiliki dampak bagi
                  masyarakat.
                </p>
              </div>

              <Link href="/isu" className="text-link">
                Lihat semua isu
                <span>→</span>
              </Link>
            </div>

            <div className="featured-grid">
              {featuredIssues.map((item, index) => (
                <article
                  className={`featured-card ${
                    index === 0 ? "featured-card-large" : ""
                  }`}
                  key={item.title}
                >
                  <Link href={item.href} className="card-image">
                    <img src={item.image} alt={item.title} />
                    <span className="image-gradient" />
                    <span className="card-category">{item.category}</span>
                  </Link>

                  <div className="featured-card-content">
                    <h3>
                      <Link href={item.href}>{item.title}</Link>
                    </h3>

                    <p>{item.description}</p>

                    <Link href={item.href} className="article-link">
                      Baca selengkapnya
                      <span>→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section regional-section">
          <div className="content-container">
            <div className="regional-layout">
              <div className="regional-intro">
                <span className="section-kicker">JELAJAHI WILAYAH</span>

                <h2>
                  Indonesia tidak hanya
                  <br />
                  dilihat dari pusat.
                </h2>

                <p>
                  Informasi publik perlu melihat apa yang terjadi dari tingkat
                  nasional sampai kehidupan masyarakat di desa dan dusun.
                </p>

                <Link href="/isu" className="button-dark">
                  Jelajahi wilayah
                  <span>→</span>
                </Link>
              </div>

              <div className="regional-grid">
                {regions.map((region) => (
                  <Link
                    href={region.href}
                    className="regional-card"
                    key={region.number}
                  >
                    <span className="region-number">{region.number}</span>

                    <h3>{region.title}</h3>

                    <p>{region.text}</p>

                    <span className="regional-arrow">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section topics-section">
          <div className="content-container">
            <div className="section-heading centered-heading">
              <div>
                <span className="section-kicker">TOPIK PUBLIK</span>

                <h2>Satu Indonesia, banyak persoalan</h2>

                <p>
                  Jelajahi informasi berdasarkan isu yang paling dekat dengan
                  kehidupan masyarakat.
                </p>
              </div>
            </div>

            <div className="topics-grid">
              {topics.map((topic) => (
                <Link href="/isu" className="topic-card" key={topic.title}>
                  <div className="topic-icon">{topic.icon}</div>

                  <h3>{topic.title}</h3>

                  <p>{topic.text}</p>

                  <span className="topic-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="video-section">
          <div className="content-container">
            <div className="video-section-top">
              <div>
                <span className="section-kicker section-kicker-light">
                  VIDEO & LIPUTAN
                </span>

                <h2>
                  Melihat cerita
                  <br />
                  dari berbagai wilayah.
                </h2>
              </div>

              <p>
                Tidak semua persoalan cukup dijelaskan dengan angka. Video dan
                dokumentasi membantu melihat kondisi masyarakat secara lebih
                dekat.
              </p>
            </div>

            <div className="video-grid">
              {videos.map((video, index) => (
                <article className="video-card" key={video.title}>
                  <Link href="/isu" className="video-thumbnail">
                    <img src={video.image} alt={video.title} />

                    <span className="video-overlay" />

                    <span className="play-button">▶</span>

                    <span className="video-duration">{video.duration}</span>

                    {index === 0 && (
                      <span className="video-featured-label">
                        LIPUTAN PILIHAN
                      </span>
                    )}
                  </Link>

                  <div className="video-card-content">
                    <h3>
                      <Link href="/isu">{video.title}</Link>
                    </h3>

                    <Link href="/isu" className="watch-link">
                      Tonton liputan
                      <span>→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section community-section">
          <div className="content-container">
            <div className="community-layout">
              <div className="community-image">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85"
                  alt="Masyarakat berdiskusi"
                />

                <div className="community-image-caption">
                  <span>RUANG DISKUSI</span>
                  <strong>Suara masyarakat juga penting.</strong>
                </div>
              </div>

              <div className="community-copy">
                <span className="section-kicker">SUARA MASYARAKAT</span>

                <h2>
                  Informasi bukan hanya
                  <br />
                  datang dari atas.
                </h2>

                <p>
                  RUANG FAKTA dikembangkan sebagai ruang publik untuk mengikuti
                  isu, memahami data, membaca perkembangan, dan membuka ruang
                  percakapan yang lebih dekat dengan masyarakat.
                </p>

                <div className="community-points">
                  <div>
                    <span>01</span>
                    <p>Ikuti isu yang terjadi di sekitar masyarakat.</p>
                  </div>

                  <div>
                    <span>02</span>
                    <p>Telusuri informasi berdasarkan wilayah dan topik.</p>
                  </div>

                  <div>
                    <span>03</span>
                    <p>Bangun percakapan yang lebih terbuka dan bermakna.</p>
                  </div>
                </div>

                <Link href="/isu" className="button-primary">
                  Masuk ke ruang publik
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="content-container">
            <div className="cta-box">
              <div>
                <span className="section-kicker section-kicker-light">
                  RUANG UNTUK INDONESIA
                </span>

                <h2>
                  Mulai mengikuti
                  <br />
                  isu di sekitar Anda.
                </h2>
              </div>

              <div className="cta-actions">
                <Link href="/isu" className="button-light">
                  Jelajahi informasi
                  <span>→</span>
                </Link>

                <Link href="/login" className="button-outline-light">
                  Masuk ke akun
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="content-container">
          <div className="footer-main">
            <div className="footer-brand">
              <Link href="/" className="brand footer-brand-link">
                <span className="brand-mark">
                  <span className="brand-mark-red" />
                  <span className="brand-mark-white" />
                </span>

                <span className="brand-text">
                  <strong>RUANG</strong>
                  <strong>FAKTA</strong>
                </span>
              </Link>

              <p>
                Ruang informasi publik untuk mengikuti fakta, data, isu, dan
                suara masyarakat dari Indonesia.
              </p>
            </div>

            <div className="footer-column">
              <h3>Jelajahi</h3>

              <Link href="/isu">Isu</Link>
              <Link href="/isu">Nasional</Link>
              <Link href="/isu">Daerah</Link>
              <Link href="/dashboard">Data & Fakta</Link>
            </div>

            <div className="footer-column">
              <h3>Wilayah</h3>

              <Link href="/isu">Provinsi</Link>
              <Link href="/isu">Kabupaten & Kota</Link>
              <Link href="/isu">Desa</Link>
              <Link href="/isu">Dusun</Link>
            </div>

            <div className="footer-column">
              <h3>Akun</h3>

              <Link href="/login">Masuk</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/admin">Admin</Link>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} RUANG FAKTA</span>

            <span>
              Ruang informasi, fakta, data, dan suara masyarakat Indonesia.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
