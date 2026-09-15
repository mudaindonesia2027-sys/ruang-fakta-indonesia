import { NextRequest, NextResponse } from "next/server";
import { IssuePriority, IssueStatus, Prisma, UserRole, VerificationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/authorization";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { slugify, uniqueSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

function enumValue<T extends Record<string, string>>(values: T, value: unknown) {
  return typeof value === "string" && Object.values(values).includes(value) ? value as T[keyof T] : undefined;
}

function safeHttpUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

async function resolveCategory(input: unknown) {
  if (typeof input !== "string" || !input.trim()) return null;
  const value = input.trim();
  const existing = await db.category.findFirst({ where: { OR: [{ id: value }, { slug: slugify(value) }, { name: value }] } });
  if (existing) return existing.id;
  const slug = await uniqueSlug(value, async candidate => Boolean(await db.category.findUnique({ where: { slug: candidate } })));
  return (await db.category.create({ data: { name: value, slug } })).id;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const viewer = await getCurrentUser();
    const canManage = Boolean(viewer && [UserRole.EDITOR, UserRole.REVIEWER, UserRole.ADMIN, UserRole.SUPERADMIN].includes(viewer.role));
    const requestedStatus = enumValue(IssueStatus, searchParams.get("status"));
    const status = canManage ? requestedStatus : requestedStatus && [IssueStatus.OPEN, IssueStatus.MONITORING, IssueStatus.INVESTIGATING, IssueStatus.VERIFIED, IssueStatus.RESOLVED].includes(requestedStatus as IssueStatus) ? requestedStatus : undefined;
    const priority = enumValue(IssuePriority, searchParams.get("priority"));
    const search = searchParams.get("search")?.trim();
    const where: Prisma.IssueWhereInput = {
      ...(status ? { status } : canManage ? {} : { status: { in: [IssueStatus.OPEN, IssueStatus.MONITORING, IssueStatus.INVESTIGATING, IssueStatus.VERIFIED, IssueStatus.RESOLVED] } }),
      ...(priority ? { priority } : {}),
      ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { summary: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }] } : {}),
    };
    const issues = await db.issue.findMany({
      where,
      select: {
        id: true, title: true, slug: true, summary: true, description: true, status: true, priority: true, verificationStatus: true,
        province: true, regency: true, district: true, village: true, hamlet: true, coverImage: true, updatedAt: true,
        category: { select: { name: true } },
        _count: { select: { updates: true, sources: true, comments: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: Math.min(Math.max(Number(searchParams.get("limit")) || 100, 1), 100),
    });
    return NextResponse.json({ success: true, data: issues.map(issue => ({ ...issue, categoryName: issue.category?.name ?? null })) });
  } catch (error) {
    console.error("GET issues error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil isu." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const access = await requirePermission("issue:create");
  if (!access.ok) return access.response;
  try {
    const limit = await checkRateLimit(access.user.id, "ISSUE_CREATED");
    if (!limit.allowed) {
      return NextResponse.json(rateLimitResponse(limit.retryAfterSeconds), {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      });
    }

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.content === "string" ? body.content.trim() : typeof body.description === "string" ? body.description.trim() : "";
    if (!title || !description) return NextResponse.json({ success: false, error: "Judul dan isi isu wajib diisi." }, { status: 400 });
    const slug = await uniqueSlug(typeof body.slug === "string" && body.slug.trim() ? body.slug : title, async candidate => Boolean(await db.issue.findUnique({ where: { slug: candidate } })));
    const categoryId = await resolveCategory(body.categoryId ?? body.category);
    const canManage = [UserRole.EDITOR, UserRole.REVIEWER, UserRole.ADMIN, UserRole.SUPERADMIN].includes(access.user.role);
    const status = canManage ? enumValue(IssueStatus, body.status) ?? IssueStatus.OPEN : IssueStatus.OPEN;
    const priority = canManage ? enumValue(IssuePriority, body.priority) ?? IssuePriority.MEDIUM : IssuePriority.MEDIUM;
    const verificationStatus = canManage ? enumValue(VerificationStatus, body.verificationStatus) ?? VerificationStatus.UNVERIFIED : VerificationStatus.UNVERIFIED;
    const coverImage = safeHttpUrl(body.coverImage);
    const videoUrl = safeHttpUrl(body.videoUrl);
    const sourceUrl = safeHttpUrl(body.sourceUrl);
    if (body.coverImage && !coverImage) return NextResponse.json({ success: false, error: "URL gambar tidak valid." }, { status: 400 });
    if (body.videoUrl && !videoUrl) return NextResponse.json({ success: false, error: "URL video tidak valid." }, { status: 400 });
    if (body.sourceUrl && !sourceUrl) return NextResponse.json({ success: false, error: "URL sumber harus menggunakan http atau https." }, { status: 400 });
    const issue = await db.issue.create({
      data: {
        title, slug, description, status, priority, verificationStatus,
        summary: typeof body.summary === "string" && body.summary.trim() ? body.summary.trim() : null,
        categoryId,
        province: typeof body.province === "string" ? body.province.trim() || null : null,
        regency: typeof body.regency === "string" ? body.regency.trim() || null : null,
        district: typeof body.district === "string" ? body.district.trim() || null : null,
        village: typeof body.village === "string" ? body.village.trim() || null : null,
        hamlet: typeof body.hamlet === "string" ? body.hamlet.trim() || null : null,
        address: typeof body.address === "string" ? body.address.trim() || null : null,
        location: typeof body.location === "string" ? body.location.trim() || null : null,
        coverImage,
        videoUrl,
        reporterName: typeof body.reporterName === "string" ? body.reporterName.trim() || null : null,
        reporterId: access.user.id,
      },
      include: { category: true },
    });
    if (sourceUrl) {
      const source = await db.source.create({ data: { title: typeof body.sourceName === "string" && body.sourceName.trim() ? body.sourceName.trim() : sourceUrl, url: sourceUrl } });
      await db.issueSource.create({ data: { issueId: issue.id, sourceId: source.id } });
    }
    await audit({ action: "ISSUE_CREATED", entity: "Issue", entityId: issue.id, actorId: access.user.id });
    return NextResponse.json({ success: true, data: issue }, { status: 201 });
  } catch (error) {
    console.error("POST issue error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat isu." }, { status: 500 });
  }
}
