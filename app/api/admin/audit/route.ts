import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const access = await requirePermission("verification:review");
  if (!access.ok) return access.response;

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action")?.trim();
    const entity = searchParams.get("entity")?.trim();
    const userId = searchParams.get("userId")?.trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 1), 100);

    const where = {
      ...(action ? { action: { equals: action } } : {}),
      ...(entity ? { entity: { equals: entity } } : {}),
      ...(userId ? { userId } : {}),
      ...(from || to ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
    };

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, name: true, username: true, role: true } } },
      }),
      db.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET admin audit error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil audit trail." }, { status: 500 });
  }
}
