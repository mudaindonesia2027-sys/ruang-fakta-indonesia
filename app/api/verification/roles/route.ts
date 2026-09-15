import { NextRequest, NextResponse } from "next/server";
import { RoleClaimStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return NextResponse.json({ success: false, error: "Jabatan/peran wajib diisi." }, { status: 400 });

    const roleClaim = await db.roleClaim.create({
      data: {
        userId: user.id,
        title,
        organization: typeof body.organization === "string" ? body.organization.trim() || null : null,
        project: typeof body.project === "string" ? body.project.trim() || null : null,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
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
