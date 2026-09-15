import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { db } from "@/lib/db";

async function getSupabaseUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Route handler tidak perlu menulis cookie untuk operasi ini.
        },
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

function serializeComment(comment: any) {
  return {
    id: comment.id,
    content: comment.content,
    status: comment.status,
    claimStatus: comment.claimStatus,
    evidenceUrl: comment.evidenceUrl,
    evidenceType: comment.evidenceType,
    location: comment.location,
    isOfficialResponse: comment.isOfficialResponse,
    createdAt: comment.createdAt,
    user: comment.user
      ? {
          id: comment.user.id,
          name: comment.user.name,
          username: comment.user.username,
          avatarUrl: comment.user.avatarUrl,
          publicLabel: comment.user.publicLabel,
          organization: comment.user.organization,
          position: comment.user.position,
          verifiedIdentity: comment.user.verifiedIdentity,
          verifiedRole: comment.user.verifiedRole,
          verificationLabel: comment.user.verificationLabel,
        }
      : null,
    replies: Array.isArray(comment.replies)
      ? comment.replies.map(serializeComment)
      : [],
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const url = new URL(request.url);
  const take = Math.min(
    Math.max(Number(url.searchParams.get("take") || 20), 1),
    40
  );

  const issue = await db.issue.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!issue) {
    return NextResponse.json(
      { error: "Isu tidak ditemukan." },
      { status: 404 }
    );
  }

  const comments = await db.comment.findMany({
    where: {
      issueId: issue.id,
      parentId: null,
      status: "APPROVED",
    },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          publicLabel: true,
          organization: true,
          position: true,
          verifiedIdentity: true,
          verifiedRole: true,
          verificationLabel: true,
        },
      },
      replies: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "asc" },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              publicLabel: true,
              organization: true,
              position: true,
              verifiedIdentity: true,
              verifiedRole: true,
              verificationLabel: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(
    {
      comments: comments.map(serializeComment),
      take,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=15, stale-while-revalidate=30",
      },
    }
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const authUser = await getSupabaseUser();

  if (!authUser) {
    return NextResponse.json(
      { error: "Silakan masuk terlebih dahulu untuk berdiskusi." },
      { status: 401 }
    );
  }

  const { slug } = await context.params;
  const body = await request.json().catch(() => null);

  const content = String(body?.content || "").trim();
  const evidenceUrl = body?.evidenceUrl
    ? String(body.evidenceUrl).trim()
    : null;
  const evidenceType = body?.evidenceType
    ? String(body.evidenceType).trim()
    : null;
  const location = body?.location
    ? String(body.location).trim()
    : null;

  if (content.length < 10) {
    return NextResponse.json(
      { error: "Komentar minimal 10 karakter." },
      { status: 400 }
    );
  }

  if (content.length > 5000) {
    return NextResponse.json(
      { error: "Komentar terlalu panjang." },
      { status: 400 }
    );
  }

  const issue = await db.issue.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!issue) {
    return NextResponse.json(
      { error: "Isu tidak ditemukan." },
      { status: 404 }
    );
  }

  const user = await db.user.upsert({
    where: { email: authUser.email ?? `${authUser.id}@supabase.local` },
    update: {
      supabaseId: authUser.id,
      name:
        (authUser.user_metadata?.full_name as string | undefined) ||
        (authUser.user_metadata?.name as string | undefined) ||
        undefined,
      avatarUrl:
        (authUser.user_metadata?.avatar_url as string | undefined) ||
        undefined,
    },
    create: {
      supabaseId: authUser.id,
      email: authUser.email ?? `${authUser.id}@supabase.local`,
      name:
        (authUser.user_metadata?.full_name as string | undefined) ||
        (authUser.user_metadata?.name as string | undefined) ||
        "Pengguna",
      avatarUrl:
        (authUser.user_metadata?.avatar_url as string | undefined) ||
        null,
    },
  });

  const comment = await db.comment.create({
    data: {
      content,
      issueId: issue.id,
      userId: user.id,
      status: "PENDING",
      claimStatus: "UNREVIEWED",
      evidenceUrl,
      evidenceType,
      location,
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      success: true,
      message:
        "Komentar diterima dan menunggu moderasi sebelum tampil publik.",
      comment,
    },
    { status: 201 }
  );
}
