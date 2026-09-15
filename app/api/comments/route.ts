import { NextRequest, NextResponse } from "next/server";
import { CommentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import {
  checkCooldown,
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const MAX_CONTENT_LENGTH = 3000;
const MAX_PAGE_SIZE = 100;
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const COMMENT_COOLDOWN_MS = 15 * 1000;

function normalizeContent(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("id-ID");
}

function validTarget(articleId: unknown, issueId: unknown) {
  const article = typeof articleId === "string" && articleId.trim().length > 0;
  const issue = typeof issueId === "string" && issueId.trim().length > 0;
  return (article || issue) && !(article && issue);
}

export async function GET(request: NextRequest) {
  try {
    const articleId = request.nextUrl.searchParams.get("articleId");
    const issueId = request.nextUrl.searchParams.get("issueId");
    const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? 50);
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE)
      : 50;

    if (!validTarget(articleId, issueId)) {
      return NextResponse.json(
        { error: "Tentukan tepat satu target: articleId atau issueId." },
        { status: 400 },
      );
    }

    const comments = await db.comment.findMany({
      where: {
        status: CommentStatus.APPROVED,
        ...(articleId ? { articleId } : { issueId: issueId! }),
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        parentId: true,
        user: {
          select: { id: true, name: true, username: true, image: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error("GET comments error:", error);
    return NextResponse.json(
      { error: "Gagal memuat komentar." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const rate = await checkRateLimit(user.id, "COMMENT_CREATED");
    if (!rate.allowed) {
      return NextResponse.json(rateLimitResponse(rate.retryAfterSeconds), {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      });
    }

    const cooldown = await checkCooldown(
      user.id,
      "COMMENT_CREATED",
      COMMENT_COOLDOWN_MS,
    );
    if (!cooldown.allowed) {
      return NextResponse.json(rateLimitResponse(cooldown.retryAfterSeconds), {
        status: 429,
        headers: { "Retry-After": String(cooldown.retryAfterSeconds) },
      });
    }

    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const articleId = typeof body.articleId === "string" ? body.articleId.trim() : "";
    const issueId = typeof body.issueId === "string" ? body.issueId.trim() : "";
    const parentId = typeof body.parentId === "string" && body.parentId.trim()
      ? body.parentId.trim()
      : null;

    if (!content || content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Komentar wajib diisi dan maksimal ${MAX_CONTENT_LENGTH} karakter.` },
        { status: 400 },
      );
    }

    if (!validTarget(articleId, issueId)) {
      return NextResponse.json(
        { error: "Tentukan tepat satu target: articleId atau issueId." },
        { status: 400 },
      );
    }

    const targetExists = articleId
      ? await db.article.findUnique({ where: { id: articleId }, select: { id: true } })
      : await db.issue.findUnique({ where: { id: issueId }, select: { id: true } });

    if (!targetExists) {
      return NextResponse.json({ error: "Target komentar tidak ditemukan." }, { status: 404 });
    }

    if (parentId) {
      const parent = await db.comment.findUnique({
        where: { id: parentId },
        select: { id: true, articleId: true, issueId: true, status: true },
      });

      if (!parent || parent.status !== CommentStatus.APPROVED) {
        return NextResponse.json({ error: "Komentar induk tidak tersedia." }, { status: 400 });
      }

      const sameTarget = articleId
        ? parent.articleId === articleId
        : parent.issueId === issueId;

      if (!sameTarget) {
        return NextResponse.json({ error: "Komentar balasan harus berada pada pembahasan yang sama." }, { status: 400 });
      }
    }

    const normalized = normalizeContent(content);
    const duplicateSince = new Date(Date.now() - DUPLICATE_WINDOW_MS);
    const recentComments = await db.comment.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: duplicateSince },
        ...(articleId ? { articleId } : { issueId }),
      },
      select: { id: true, content: true },
      take: 20,
    });

    if (recentComments.some((comment) => normalizeContent(comment.content) === normalized)) {
      return NextResponse.json(
        { error: "Komentar yang sama baru saja dikirim. Silakan beri jeda atau tambahkan informasi baru." },
        { status: 409 },
      );
    }

    const comment = await db.comment.create({
      data: {
        content,
        status: CommentStatus.PENDING,
        articleId: articleId || null,
        issueId: issueId || null,
        parentId,
        userId: user.id,
      },
      select: {
        id: true,
        content: true,
        status: true,
        articleId: true,
        issueId: true,
        parentId: true,
        createdAt: true,
      },
    });

    await audit({
      action: "COMMENT_CREATED",
      entity: "Comment",
      entityId: comment.id,
      actorId: user.id,
      metadata: {
        articleId: comment.articleId,
        issueId: comment.issueId,
        parentId: comment.parentId,
        status: comment.status,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Komentar diterima dan menunggu moderasi.",
        data: comment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST comments error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim komentar." },
      { status: 500 },
    );
  }
}
