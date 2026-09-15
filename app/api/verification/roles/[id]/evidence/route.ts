import { EvidenceType } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

const allowedTypes = new Set<EvidenceType>([
  EvidenceType.DOCUMENT,
  EvidenceType.OFFICIAL_SOURCE,
  EvidenceType.PHOTO,
  EvidenceType.VIDEO,
  EvidenceType.LINK,
  EvidenceType.OTHER,
]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const { id } = await params;
    const roleClaim = await db.roleClaim.findUnique({ where: { id } });
    if (!roleClaim) return NextResponse.json({ error: "Role claim tidak ditemukan." }, { status: 404 });
    if (roleClaim.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (roleClaim.status !== "PENDING") {
      return NextResponse.json({ error: "Evidence hanya dapat ditambahkan pada role claim yang masih pending." }, { status: 400 });
    }

    const body = await request.json();
    const type = typeof body.type === "string" ? body.type.trim().toUpperCase() as EvidenceType : null;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : null;
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const documentRef = typeof body.documentRef === "string" ? body.documentRef.trim() : null;

    if (!type || !allowedTypes.has(type)) return NextResponse.json({ error: "Tipe evidence tidak valid." }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Judul evidence wajib diisi." }, { status: 400 });
    if (sourceUrl) {
      try {
        const url = new URL(sourceUrl);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        return NextResponse.json({ error: "sourceUrl harus berupa URL HTTP/HTTPS yang valid." }, { status: 400 });
      }
    }

    const evidence = await db.roleEvidence.create({
      data: { roleClaimId: id, type, title, sourceUrl, description, documentRef },
    });

    await audit({
      action: "ROLE_EVIDENCE_CREATED",
      entity: "RoleEvidence",
      entityId: evidence.id,
      actorId: user.id,
      details: { roleClaimId: id, type },
    });

    return NextResponse.json({ evidence }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menambahkan evidence.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
