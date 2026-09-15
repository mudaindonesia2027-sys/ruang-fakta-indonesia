import { NextRequest, NextResponse } from "next/server";
import { ArticleStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { slugify, uniqueSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

function parseStatus(value: string | null): ArticleStatus | undefined {
  if (!value) return undefined;
  return Object.values(ArticleStatus).includes(value as ArticleStatus) ? value as ArticleStatus : undefined;
}

function parsePositiveNumber(value: string | null, fallback: number, maximum: number) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) return fallback;
  return Math.min(Math.floor(numberValue), maximum);
}

const publicAuthorSelect = { id: true, name: true, username: true, image: true, avatarUrl: true } as const;
const publicCategorySelect = { id: true, name: true, slug: true } as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUser = await getCurrentUser();
    const requestedStatus = parseStatus(searchParams.get("status"));
    const canBrowseUnpublished = Boolean(currentUser && ["EDITOR", "REVIEWER", "ADMIN", "SUPERADMIN"].includes(currentUser.role));
    const status = canBrowseUnpublished ? requestedStatus : ArticleStatus.PUBLISHED;
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const page = parsePositiveNumber(searchParams.get("page"), 1, 100000);
    const limit = parsePositiveNumber(searchParams.get("limit"), 20, 100);
    const skip = (page - 1) * limit;
    const where: Prisma.ArticleWhereInput = {};

    if (status) where.status = status;
    if (categoryParam?.trim()) {
      const categoryValue = categoryParam.trim();
      where.category = { is: { OR: [{ id: categoryValue }, { slug: categoryValue }] } };
    }
    if (searchParam?.trim()) {
      const search = searchParam.trim();
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({ where, include: { author: { select: publicAuthorSelect }, category: { select: publicCategorySelect } }, orderBy: { updatedAt: "desc" }, skip, take: limit }),
      db.article.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: articles, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data artikel." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    if (!["CONTRIBUTOR", "EDITOR", "ADMIN", "SUPERADMIN"].includes(user.role)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const limit = await checkRateLimit(user.id, "ARTICLE_CREATED");
    if (!limit.allowed) return NextResponse.json(rateLimitResponse(limit.retryAfterSeconds), { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content : "";
    if (!title || title.length > 240) return NextResponse.json({ success: false, error: "Judul wajib diisi dan maksimal 240 karakter." }, { status: 400 });
    if (!content.trim() || content.length > 100000) return NextResponse.json({ success: false, error: "Konten wajib diisi dan maksimal 100.000 karakter." }, { status: 400 });

    const requestedStatus = typeof body.status === "string" ? body.status : "DRAFT";
    const parsedStatus = parseStatus(requestedStatus);
    const status = parsedStatus ?? ArticleStatus.DRAFT;
    if (status === ArticleStatus.PUBLISHED && !["EDITOR", "ADMIN", "SUPERADMIN"].includes(user.role)) {
      return NextResponse.json({ success: false, error: "Artikel kontributor harus melalui proses editorial sebelum diterbitkan." }, { status: 403 });
    }

    const slug = await uniqueSlug(typeof body.slug === "string" && body.slug.trim() ? body.slug : title, async candidate => Boolean(await db.article.findUnique({ where: { slug: candidate } })));
    let categoryId: string | null = null;
    const categoryInput = typeof body.categoryId === "string" && body.categoryId.trim() ? body.categoryId.trim() : typeof body.category === "string" && body.category.trim() ? body.category.trim() : null;
    if (categoryInput) {
      const existingCategory = await db.category.findFirst({ where: { OR: [{ id: categoryInput }, { slug: slugify(categoryInput) }, { name: categoryInput }] } });
      if (existingCategory) categoryId = existingCategory.id;
      else {
        const categorySlug = await uniqueSlug(categoryInput, async candidate => Boolean(await db.category.findUnique({ where: { slug: candidate } })));
        categoryId = (await db.category.create({ data: { name: categoryInput, slug: categorySlug } })).id;
      }
    }

    const article = await db.article.create({
      data: {
        title, slug, excerpt: typeof body.excerpt === "string" ? body.excerpt.trim().slice(0, 1000) || null : null, content, status, authorId: user.id, categoryId,
        coverImage: typeof body.coverImage === "string" && body.coverImage.trim() ? body.coverImage.trim() : null,
        isPublished: status === ArticleStatus.PUBLISHED, publishedAt: status === ArticleStatus.PUBLISHED ? new Date() : null,
      },
      include: { author: { select: publicAuthorSelect }, category: { select: publicCategorySelect } },
    });
    await audit({ action: "ARTICLE_CREATED", entity: "Article", entityId: article.id, actorId: user.id, metadata: { status: article.status } });
    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error) {
    console.error("POST /api/articles error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat artikel." }, { status: 500 });
  }
}
