import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

const allowedTypes = new Set(["DOCUMENT", "OFFICIAL_SOURCE", "PHOTO", "VIDEO", "LINK", "OTHER"]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const { id } = await params;
    const claim = await db.claim.findUnique({ where: { id } });
    if (!claim) return NextResponse.json({ error: "Claim tidak ditemukan." }, { status: 404 });
    if (claim.authorId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (claim.status !== "UNVERIFIED" && claim.status !== "DISPUTED") {
      return NextResponse.json({ error: "Evidence hanya dapat ditambahkan pada claim yang belum final." }, { status: 400 });
    }

    const body = await request.json();
    const type = typeof body.type === "string" ? body.type.trim().toUpperCase() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : null;
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const location = typeof body.location === "string" ? body.location.trim() : null;
    const observedAt = typeof body.observedAt === "string" && body.observedAt.trim()
      ? new Date(body.observedAt)
      : null;

    if (!allowedTypes.has(type)) return NextResponse.json({ error: "Tipe evidence tidak valid." }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Judul evidence wajib diisi." }, { status: 400 });
    if (sourceUrl) {
      try {
        const url = new URL(sourceUrl);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        return NextResponse.json({ error: "sourceUrl harus berupa URL HTTP/HTTPS yang valid." }, { status: 400 });
      }
    }
    if (observedAt && Number.isNaN(observedAt.getTime())) {
      return NextResponse.json({ error: "observedAt tidak valid." }, { status: 400 });
    }

    const evidence = await db.claimEvidence.create({
      data: {
        claimId: id,
        type: type as never,
        title,
        sourceUrl,
        description,
        location,
        observedAt,
      },
    });

    await audit({
      action: "CLAIM_EVIDENCE_CREATED",
      entity: "ClaimEvidence",
      entityId: evidence.id,
      actorId: user.id,
      details: { claimId: id, type },
    });

    return NextResponse.json({ evidence }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menambahkan evidence.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
