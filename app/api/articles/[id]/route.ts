import { NextRequest, NextResponse } from "next/server";
import { ArticleStatus, CorrectionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requirePermission } from "@/lib/authorization";

export const dynamic = "force-dynamic";

const publicAuthorSelect = { id: true, name: true, username: true, image: true, avatarUrl: true } as const;
const publicCategorySelect = { id: true, name: true, slug: true } as const;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUser = await (async () => {
      try { return (await import("@/lib/auth")).getCurrentUser(); } catch { return null; }
    })();
    const canBrowseModeration = Boolean(currentUser && ["EDITOR", "REVIEWER", "ADMIN", "SUPERADMIN"].includes(currentUser.role));
    const article = await db.article.findUnique({
      where: { id },
      include: {
        author: { select: publicAuthorSelect },
        category: { select: publicCategorySelect },
        sources: { include: { source: true } },
        corrections: canBrowseModeration ? true : { where: { status: CorrectionStatus.COMPLETED } },
      },
    });
    if (!article) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    if (!canBrowseModeration && article.status !== ArticleStatus.PUBLISHED) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error("GET article error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil artikel." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("article:update");
  if (!access.ok) return access.response;
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await db.article.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    const data: { title?: string; excerpt?: string | null; content?: string; categoryId?: string | null; status?: ArticleStatus; publishedAt?: Date | null; coverImage?: string | null; isPublished?: boolean } = {};
    if (typeof body.title === "string") {
      const title = body.title.trim();
      if (!title || title.length > 240) return NextResponse.json({ error: "Judul wajib diisi dan maksimal 240 karakter." }, { status: 400 });
      data.title = title;
    }
    if (typeof body.excerpt === "string") data.excerpt = body.excerpt.trim().slice(0, 1000) || null;
    if (typeof body.content === "string") {
      if (!body.content.trim() || body.content.length > 100000) return NextResponse.json({ error: "Konten wajib diisi dan maksimal 100.000 karakter." }, { status: 400 });
      data.content = body.content;
    }
    if (body.categoryId === null) data.categoryId = null;
    else if (typeof body.categoryId === "string" && body.categoryId.trim()) data.categoryId = body.categoryId.trim();
    if (body.coverImage === null || typeof body.coverImage === "string") data.coverImage = body.coverImage;
    if (typeof body.status === "string" && Object.values(ArticleStatus).includes(body.status as ArticleStatus)) {
      const status = body.status as ArticleStatus;
      if (status === ArticleStatus.PUBLISHED && !["EDITOR", "ADMIN", "SUPERADMIN"].includes(access.user.role)) return NextResponse.json({ error: "Hanya editor atau admin yang dapat menerbitkan artikel." }, { status: 403 });
      data.status = status;
      data.publishedAt = status === ArticleStatus.PUBLISHED ? existing.publishedAt ?? new Date() : null;
      data.isPublished = status === ArticleStatus.PUBLISHED;
    }
    const article = await db.article.update({ where: { id }, data });
    await audit({ action: "ARTICLE_UPDATED", entity: "Article", entityId: id, actorId: access.user.id, metadata: { status: article.status } });
    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error("PATCH article error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui artikel." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("article:update");
  if (!access.ok) return access.response;
  if (!["ADMIN", "SUPERADMIN"].includes(access.user.role)) return NextResponse.json({ error: "Hanya admin yang dapat menghapus artikel." }, { status: 403 });
  try {
    const { id } = await params;
    const existing = await db.article.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    await db.article.delete({ where: { id } });
    await audit({ action: "ARTICLE_DELETED", entity: "Article", entityId: id, actorId: access.user.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE article error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus artikel." }, { status: 500 });
  }
}
