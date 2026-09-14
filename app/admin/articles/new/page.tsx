import Link from "next/link";
import ArticleEditor from "@/components/cms/article-editor";

export default function NewArticlePage() {
  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <span className="section-kicker">
            CMS
          </span>

          <h1>
            Buat Artikel Baru
          </h1>

          <p>
            Publikasikan informasi dan
            laporan terbaru.
          </p>
        </div>

        <Link
          href="/admin/articles"
          className="button-secondary"
        >
          Kembali
        </Link>
      </section>

      <ArticleEditor />
    </main>
  );
}
