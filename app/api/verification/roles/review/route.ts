import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/authorization";
import { audit } from "@/lib/audit";

export async function GET() {
  const access = await requirePermission("verification:review");
  if (!access.ok) return access.response;

  const items = await db.roleClaim.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { evidence: true },
    take: 100,
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const access = await requirePermission("verification:review");
  if (!access.ok) return access.response;

  try {
    const body = await request.json();
    const roleClaimId = typeof body.roleClaimId === "string" ? body.roleClaimId.trim() : "";
    const approved = body.approved === true;

    if (!roleClaimId) return NextResponse.json({ error: "roleClaimId wajib diisi." }, { status: 400 });

    const roleClaim = await db.roleClaim.findUnique({ where: { id: roleClaimId } });
    if (!roleClaim) return NextResponse.json({ error: "Role claim tidak ditemukan." }, { status: 404 });
    if (roleClaim.status !== "PENDING") return NextResponse.json({ error: "Role claim sudah diproses." }, { status: 400 });

    const updated = await db.roleClaim.update({
      where: { id: roleClaimId },
      data: {
        status: approved ? "VERIFIED" : "REJECTED",
        verifiedAt: approved ? new Date() : null,
      },
    });

    await audit({
      action: approved ? "ROLE_CLAIM_VERIFIED" : "ROLE_CLAIM_REJECTED",
      entity: "RoleClaim",
      entityId: roleClaimId,
      actorId: access.user.id,
      details: { status: updated.status },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      verifiedAt: updated.verifiedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memproses role claim.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
