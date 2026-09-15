import { NextRequest, NextResponse } from "next/server";
import { RoleClaimStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

  try {
    const limit = await checkRateLimit(user.id, "ROLE_CLAIM_CREATED");
    if (!limit.allowed) {
      return NextResponse.json(rateLimitResponse(limit.retryAfterSeconds), {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      });
    }

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const organization = typeof body.organization === "string" ? body.organization.trim() || null : null;
    const project = typeof body.project === "string" ? body.project.trim() || null : null;
    if (!title) return NextResponse.json({ success: false, error: "Jabatan/peran wajib diisi." }, { status: 400 });

    const duplicateSince = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await db.roleClaim.findFirst({
      where: {
        userId: user.id,
        title,
        organization,
        project,
        createdAt: { gte: duplicateSince },
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: "Klaim peran yang sama sudah dibuat dalam 24 jam terakhir." },
        { status: 409 },
      );
    }

    const validFrom = body.validFrom ? new Date(body.validFrom) : null;
    const validUntil = body.validUntil ? new Date(body.validUntil) : null;
    if (validFrom && Number.isNaN(validFrom.getTime())) {
      return NextResponse.json({ success: false, error: "Tanggal mulai tidak valid." }, { status: 400 });
    }
    if (validUntil && Number.isNaN(validUntil.getTime())) {
      return NextResponse.json({ success: false, error: "Tanggal berakhir tidak valid." }, { status: 400 });
    }
    if (validFrom && validUntil && validUntil < validFrom) {
      return NextResponse.json({ success: false, error: "Tanggal berakhir tidak boleh sebelum tanggal mulai." }, { status: 400 });
    }

    const roleClaim = await db.roleClaim.create({
      data: {
        userId: user.id,
        title,
        organization,
        project,
        validFrom,
        validUntil,
        status: RoleClaimStatus.PENDING,
      },
    });

    await audit({ action: "ROLE_CLAIM_CREATED", entity: "RoleClaim", entityId: roleClaim.id, actorId: user.id });
    return NextResponse.json({ success: true, data: roleClaim }, { status: 201 });
  } catch (error) {
    console.error("Role claim error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat klaim peran." }, { status: 400 });
  }
}
