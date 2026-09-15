import { NextRequest, NextResponse } from "next/server";
import { ClaimStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

  try {
    const limit = await checkRateLimit(user.id, "CLAIM_CREATED");
    if (!limit.allowed) {
      return NextResponse.json(rateLimitResponse(limit.retryAfterSeconds), {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      });
    }

    const body = await request.json();
    const statement = typeof body.statement === "string" ? body.statement.trim() : "";
    if (!statement) return NextResponse.json({ success: false, error: "Pernyataan wajib diisi." }, { status: 400 });

    const articleId = typeof body.articleId === "string" ? body.articleId : null;
    const issueId = typeof body.issueId === "string" ? body.issueId : null;
    const duplicateSince = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const duplicate = await db.claim.findFirst({
      where: {
        authorId: user.id,
        statement,
        articleId,
        issueId,
        createdAt: { gte: duplicateSince },
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: "Klaim yang sama sudah dibuat dalam 24 jam terakhir." },
        { status: 409 },
      );
    }

    const claim = await db.claim.create({
      data: {
        authorId: user.id,
        statement,
        status: ClaimStatus.UNVERIFIED,
        articleId,
        issueId,
      },
    });

    await audit({ action: "CLAIM_CREATED", entity: "Claim", entityId: claim.id, actorId: user.id });
    return NextResponse.json({ success: true, data: claim }, { status: 201 });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat klaim." }, { status: 400 });
  }
}
