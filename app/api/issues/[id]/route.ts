import { NextRequest, NextResponse } from "next/server";
import { CommentStatus, IssuePriority, IssueStatus, Prisma, VerificationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { requirePermission } from "@/lib/authorization";

export const dynamic = "force-dynamic";

function valid<T extends Record<string,string>>(values:T, value: unknown): T[keyof T] | undefined {
  return typeof value === "string" && Object.values(values).includes(value) ? value as T[keyof T] : undefined;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const issue = await db.issue.findUnique({
      where: { id },
      include: {
        category: true,
        updates: { orderBy: { createdAt: "desc" } },
        sources: { include: { source: true } },
        comments: { where: { status: CommentStatus.APPROVED }, orderBy: { createdAt: "asc" }, include: { replies: { where: { status: CommentStatus.APPROVED }, orderBy: { createdAt: "asc" } } } },
      },
    });
    if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: issue });
  } catch (error) {
    console.error("GET issue error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil isu." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("issue:update");
  if (!access.ok) return access.response;
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await db.issue.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    const data: Prisma.IssueUpdateInput = {};
    for (const field of ["title","summary","description","content","location","province","regency","district","village","hamlet","address","coverImage","videoUrl","reporterName"] as const) {
      if (body[field] !== undefined) {
        const target = field === "content" ? "description" : field;
        if (typeof body[field] === "string" || body[field] === null) Object.assign(data, { [target]: typeof body[field] === "string" ? body[field].trim() : null });
      }
    }
    const status = valid(IssueStatus, body.status); if (status) data.status = status;
    const priority = valid(IssuePriority, body.priority); if (priority) data.priority = priority;
    const verificationStatus = valid(VerificationStatus, body.verificationStatus); if (verificationStatus) data.verificationStatus = verificationStatus;
    if (typeof body.categoryId === "string" && body.categoryId.trim()) data.category = { connect: { id: body.categoryId.trim() } };
    if (body.categoryId === null) data.category = { disconnect: true };
    const issue = await db.issue.update({ where: { id }, data, include: { category: true } });
    await audit({ action: "ISSUE_UPDATED", entity: "Issue", entityId: id, actorId: access.user.id, metadata: { status: issue.status } });
    return NextResponse.json({ success: true, data: issue });
  } catch (error) {
    console.error("PATCH issue error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui isu." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePermission("issue:delete");
  if (!access.ok) return access.response;
  try {
    const { id } = await params;
    const existing = await db.issue.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    await db.issue.delete({ where: { id } });
    await audit({ action: "ISSUE_DELETED", entity: "Issue", entityId: id, actorId: access.user.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE issue error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus isu." }, { status: 500 });
  }
}
