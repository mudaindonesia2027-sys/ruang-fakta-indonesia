import { NextRequest, NextResponse } from "next/server";
import { ClaimStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

  try {
    const body = await request.json();
    const statement = typeof body.statement === "string" ? body.statement.trim() : "";
    if (!statement) return NextResponse.json({ success: false, error: "Pernyataan wajib diisi." }, { status: 400 });

    const claim = await db.claim.create({
      data: {
        authorId: user.id,
        statement,
        status: ClaimStatus.UNVERIFIED,
        articleId: typeof body.articleId === "string" ? body.articleId : null,
        issueId: typeof body.issueId === "string" ? body.issueId : null,
      },
    });

    await audit({ action: "CLAIM_CREATED", entity: "Claim", entityId: claim.id, actorId: user.id });
    return NextResponse.json({ success: true, data: claim }, { status: 201 });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat klaim." }, { status: 400 });
  }
}
