import { ClaimStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/authorization";
import { audit } from "@/lib/audit";

const reviewStatuses = new Set<ClaimStatus>([
  ClaimStatus.SUPPORTED,
  ClaimStatus.VERIFIED,
  ClaimStatus.NOT_PROVEN,
  ClaimStatus.FALSE,
  ClaimStatus.DISPUTED,
]);

export async function GET() {
  const access = await requirePermission("verification:review");
  if (!access.ok) return access.response;

  const items = await db.claim.findMany({
    where: { status: { in: [ClaimStatus.UNVERIFIED, ClaimStatus.DISPUTED] } },
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
    const claimId = typeof body.claimId === "string" ? body.claimId.trim() : "";
    const status = typeof body.status === "string" ? body.status.trim().toUpperCase() as ClaimStatus : null;

    if (!claimId) return NextResponse.json({ error: "claimId wajib diisi." }, { status: 400 });
    if (!status || !reviewStatuses.has(status)) return NextResponse.json({ error: "Status claim tidak valid." }, { status: 400 });

    const claim = await db.claim.findUnique({
      where: { id: claimId },
      include: { evidence: { select: { id: true } } },
    });
    if (!claim) return NextResponse.json({ error: "Claim tidak ditemukan." }, { status: 404 });
    if (![ClaimStatus.UNVERIFIED, ClaimStatus.DISPUTED].includes(claim.status)) {
      return NextResponse.json({ error: "Claim sudah berada pada status final." }, { status: 400 });
    }
    if ((status === ClaimStatus.VERIFIED || status === ClaimStatus.SUPPORTED) && claim.evidence.length === 0) {
      return NextResponse.json({ error: "Claim tidak dapat dinyatakan supported/verified tanpa evidence." }, { status: 400 });
    }

    const updated = await db.claim.update({
      where: { id: claimId },
      data: { status, reviewedAt: new Date(), reviewedBy: access.user.id },
    });

    await audit({
      action: "CLAIM_REVIEWED",
      entity: "Claim",
      entityId: claimId,
      actorId: access.user.id,
      details: { status: updated.status },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      reviewedAt: updated.reviewedAt,
      reviewedBy: updated.reviewedBy,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memproses claim.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
