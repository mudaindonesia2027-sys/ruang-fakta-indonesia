import { NextRequest, NextResponse } from "next/server";
import { ArticleStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { DEFAULT_NEWS_FEEDS, fetchRssFeed } from "@/lib/news/rss";
import { slugify, uniqueSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const systemUser = await db.user.findFirst({
      where: { isActive: true, role: { in: ["SUPERADMIN", "ADMIN"] } },
      orderBy: { createdAt: "asc" },
    });
    if (!systemUser) return NextResponse.json({ success: false, error: "Tidak ada akun admin aktif untuk pemilik berita otomatis." }, { status: 500 });

    const categoryName = "Berita";
    const categorySlug = "berita";
    const category = await db.category.upsert({
      where: { slug: categorySlug },
      update: { name: categoryName },
      create: { name: categoryName, slug: categorySlug },
    });

    let fetched = 0;
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const feed of DEFAULT_NEWS_FEEDS) {
      try {
        const items = await fetchRssFeed(feed.url, 5);
        fetched += items.length;
        for (const item of items) {
          const existing = await db.articleSource.findFirst({ where: { source: { url: item.link } }, select: { articleId: true } });
          if (existing) {
            skipped += 1;
            continue;
          }

          const source = await db.source.create({
            data: {
              title: item.title.slice(0, 500),
              url: item.link,
              publisher: "ANTARA",
              sourceType: "NEWS",
              publishedAt: item.publishedAt,
            },
          });
          const slug = await uniqueSlug(slugify(item.title) || "berita", async candidate => Boolean(await db.article.findUnique({ where: { slug: candidate } })));
          const excerpt = item.description ? item.description.slice(0, 1000) : `Berita dari ${feed.name}.`;
          const content = [
            `Berita ini diimpor otomatis dari ${feed.name}.`,
            "",
            excerpt,
            "",
            `Sumber asli: ${item.link}`,
            "",
            "Status: menunggu pemeriksaan editorial sebelum ditampilkan sebagai berita terbit.",
          ].join("\n");

          const article = await db.article.create({
            data: {
              title: item.title.slice(0, 240),
              slug,
              excerpt,
              content,
              status: ArticleStatus.REVIEW,
              isPublished: false,
              authorId: systemUser.id,
              categoryId: category.id,
              publishedAt: null,
            },
          });
          await db.articleSource.create({ data: { articleId: article.id, sourceId: source.id } });
          await audit({ action: "ARTICLE_AUTO_IMPORTED", entity: "Article", entityId: article.id, actorId: systemUser.id, metadata: { feed: feed.url, sourceUrl: item.link, guid: item.guid } });
          created += 1;
        }
      } catch (error) {
        errors.push(`${feed.name}: ${error instanceof Error ? error.message : "gagal mengambil feed"}`);
      }
    }

    return NextResponse.json({ success: true, data: { fetched, created, skipped, errors } });
  } catch (error) {
    console.error("cron news error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui berita otomatis." }, { status: 500 });
  }
}
