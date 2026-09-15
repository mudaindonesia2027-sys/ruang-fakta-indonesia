import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/authorization";
import { reviewIdentityVerification } from "@/lib/verification/identity";

export async function GET() {
  const access = await requirePermission("verification:review");
  if (!access.ok) return access.response;

  const items = await db.identityVerification.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      userId: true,
      provider: true,
      status: true,
      createdAt: true,
    },
    take: 100,
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const access = await requirePermission("verification:review");
  if (!access.ok) return access.response;

  try {
    const body = await request.json();
    const verificationId = typeof body.verificationId === "string" ? body.verificationId.trim() : "";
    const approved = body.approved === true;
    const failureCode = typeof body.failureCode === "string" ? body.failureCode.trim() : undefined;

    if (!verificationId) {
      return NextResponse.json({ error: "verificationId wajib diisi." }, { status: 400 });
    }

    if (!approved && !failureCode) {
      return NextResponse.json({ error: "failureCode wajib diisi saat menolak verifikasi." }, { status: 400 });
    }

    const verification = await reviewIdentityVerification(
      verificationId,
      access.user.id,
      approved,
      failureCode,
    );

    return NextResponse.json({
      id: verification.id,
      status: verification.status,
      verifiedAt: verification.verifiedAt,
      failureCode: verification.failureCode,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memproses verifikasi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
