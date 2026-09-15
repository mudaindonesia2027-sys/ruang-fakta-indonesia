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

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string; commentId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });

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

    const { slug, commentId } = await context.params;
    const body = await request.json().catch(() => null);
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (content.length < 5) return NextResponse.json({ error: "Balasan minimal 5 karakter." }, { status: 400 });
    if (content.length > MAX_CONTENT_LENGTH) return NextResponse.json({ error: `Balasan maksimal ${MAX_CONTENT_LENGTH} karakter.` }, { status: 400 });

    const issue = await db.issue.findUnique({ where: { slug }, select: { id: true } });
    if (!issue) return NextResponse.json({ error: "Isu tidak ditemukan." }, { status: 404 });

    const parent = await db.comment.findFirst({
      where: { id: commentId, issueId: issue.id, parentId: null, status: "APPROVED" },
      select: { id: true },
    });
    if (!parent) return NextResponse.json({ error: "Komentar induk tidak ditemukan." }, { status: 404 });

    const recentReplies = await db.comment.findMany({
      where: { userId: user.id, issueId: issue.id, parentId: parent.id, createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) } },
      select: { content: true },
      take: 20,
    });
    if (recentReplies.some((reply) => normalizeContent(reply.content) === normalizeContent(content))) {
      return NextResponse.json({ error: "Balasan yang sama baru saja dikirim." }, { status: 409 });
    }

    const reply = await db.comment.create({
      data: { content, issueId: issue.id, userId: user.id, parentId: parent.id, status: "PENDING" },
      select: { id: true, status: true, createdAt: true },
    });

    await audit({
      action: "COMMENT_CREATED",
      entity: "Comment",
      entityId: reply.id,
      actorId: user.id,
      metadata: { issueId: issue.id, parentId: parent.id, status: reply.status },
    });

    return NextResponse.json(
      { success: true, message: "Balasan diterima dan menunggu moderasi.", reply },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST issue comment reply error:", error);
    return NextResponse.json({ error: "Gagal mengirim balasan." }, { status: 500 });
  }
}
