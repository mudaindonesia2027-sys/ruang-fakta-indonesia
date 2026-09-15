import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import {
  checkCooldown,
  checkRateLimit,
  rateLimitResponse,
} from "@/lib/security/rate-limit";

const MAX_CONTENT_LENGTH = 3000;
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const COMMENT_COOLDOWN_MS = 15 * 1000;

function normalizeContent(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("id-ID");
}

async function getPublicUser(userId: string) {
  const [identity, account, role] = await Promise.all([
    db.identityVerification.findFirst({
      where: { userId, status: "VERIFIED" },
      select: { id: true },
    }),
    db.accountVerification.findFirst({
      where: { userId, status: "VERIFIED" },
      select: { id: true },
    }),
    db.roleClaim.findFirst({
      where: { userId, status: "VERIFIED", OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }] },
      select: { id: true, title: true, organization: true },
      orderBy: { verifiedAt: "desc" },
    }),
  ]);

  return {
    verifiedIdentity: Boolean(identity),
    verifiedAccount: Boolean(account),
    verifiedRole: Boolean(role),
    roleTitle: role?.title ?? null,
    organization: role?.organization ?? null,
  };
}

function serializeComment(comment: any) {
  return {
    id: comment.id,
    content: comment.content,
    status: comment.status,
    createdAt: comment.createdAt,
    user: comment.user
      ? {
          id: comment.user.id,
          name: comment.user.name,
          username: comment.user.username,
          avatarUrl: comment.user.avatarUrl,
          verifiedIdentity: comment.user.verifiedIdentity,
          verifiedAccount: comment.user.verifiedAccount,
          verifiedRole: comment.user.verifiedRole,
          roleTitle: comment.user.roleTitle,
          organization: comment.user.organization,
        }
      : null,
    replies: Array.isArray(comment.replies)
      ? comment.replies.map(serializeComment)
      : [],
  };
}

async function enrichComments(comments: any[]) {
  const userIds = [...new Set(
    comments.flatMap((comment) => [comment.user?.id, ...(comment.replies ?? []).map((reply: any) => reply.user?.id)])
      .filter(Boolean),
  )] as string[];

  const profiles = await Promise.all(userIds.map(async (userId) => [userId, await getPublicUser(userId)] as const));
  const profileMap = new Map(profiles);

  return comments.map((comment) => {
    const enriched = {
      ...comment,
      user: comment.user ? { ...comment.user, ...profileMap.get(comment.user.id) } : null,
      replies: (comment.replies ?? []).map((reply: any) => ({
        ...reply,
        user: reply.user ? { ...reply.user, ...profileMap.get(reply.user.id) } : null,
      })),
    };
    return serializeComment(enriched);
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const url = new URL(request.url);
    const requestedTake = Number(url.searchParams.get("take") || 20);
    const take = Math.min(Math.max(Number.isInteger(requestedTake) ? requestedTake : 20, 1), 40);

    const issue = await db.issue.findUnique({ where: { slug }, select: { id: true } });
    if (!issue) return NextResponse.json({ error: "Isu tidak ditemukan." }, { status: 404 });

    const comments = await db.comment.findMany({
      where: { issueId: issue.id, parentId: null, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        user: { select: { id: true, name: true, username: true, avatarUrl: true } },
        replies: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "asc" },
          take: 10,
          include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } },
        },
      },
    });

    return NextResponse.json(
      { comments: await enrichComments(comments), take },
      { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=30" } },
    );
  } catch (error) {
    console.error("GET issue comments error:", error);
    return NextResponse.json({ error: "Gagal memuat komentar." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu untuk berdiskusi." }, { status: 401 });

  try {
    const rate = await checkRateLimit(user.id, "COMMENT_CREATED");
    if (!rate.allowed) {
      return NextResponse.json(rateLimitResponse(rate.retryAfterSeconds), {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      });
    }

    const cooldown = await checkCooldown(user.id, "COMMENT_CREATED", COMMENT_COOLDOWN_MS);
    if (!cooldown.allowed) {
      return NextResponse.json(rateLimitResponse(cooldown.retryAfterSeconds), {
        status: 429,
        headers: { "Retry-After": String(cooldown.retryAfterSeconds) },
      });
    }

    const { slug } = await context.params;
    const body = await request.json().catch(() => null);
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (content.length < 10) return NextResponse.json({ error: "Komentar minimal 10 karakter." }, { status: 400 });
    if (content.length > MAX_CONTENT_LENGTH) return NextResponse.json({ error: `Komentar maksimal ${MAX_CONTENT_LENGTH} karakter.` }, { status: 400 });

    const issue = await db.issue.findUnique({ where: { slug }, select: { id: true } });
    if (!issue) return NextResponse.json({ error: "Isu tidak ditemukan." }, { status: 404 });

    const recentComments = await db.comment.findMany({
      where: { userId: user.id, issueId: issue.id, createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) } },
      select: { content: true },
      take: 20,
    });
    if (recentComments.some((comment) => normalizeContent(comment.content) === normalizeContent(content))) {
      return NextResponse.json({ error: "Komentar yang sama baru saja dikirim. Silakan tambahkan informasi baru." }, { status: 409 });
    }

    const comment = await db.comment.create({
      data: { content, issueId: issue.id, userId: user.id, status: "PENDING" },
      select: { id: true, status: true, createdAt: true },
    });

    await audit({
      action: "COMMENT_CREATED",
      entity: "Comment",
      entityId: comment.id,
      actorId: user.id,
      metadata: { issueId: issue.id, status: comment.status },
    });

    return NextResponse.json(
      { success: true, message: "Komentar diterima dan menunggu moderasi sebelum tampil publik.", comment },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST issue comments error:", error);
    return NextResponse.json({ error: "Gagal mengirim komentar." }, { status: 500 });
  }
}
