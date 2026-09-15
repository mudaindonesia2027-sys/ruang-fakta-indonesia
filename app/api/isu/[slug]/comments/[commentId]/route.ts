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
        setAll() {},
      },
    }
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ slug: string; commentId: string }>;
  }
) {
  const authUser = await getSupabaseUser();
  if (!authUser) {
    return NextResponse.json(
      { error: "Silakan masuk terlebih dahulu." },
      { status: 401 }
    );
  }

  const { slug, commentId } = await context.params;
  const body = await request.json().catch(() => null);
  const content = String(body?.content || "").trim();

  if (content.length < 5) {
    return NextResponse.json(
      { error: "Balasan minimal 5 karakter." },
      { status: 400 }
    );
  }

  if (content.length > 3000) {
    return NextResponse.json(
      { error: "Balasan terlalu panjang." },
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

  const parent = await db.comment.findFirst({
    where: {
      id: commentId,
      issueId: issue.id,
      status: "APPROVED",
    },
    select: { id: true },
  });

  if (!parent) {
    return NextResponse.json(
      { error: "Komentar induk tidak ditemukan." },
      { status: 404 }
    );
  }

  const user = await db.user.upsert({
    where: { email: authUser.email ?? `${authUser.id}@supabase.local` },
    update: { supabaseId: authUser.id },
    create: {
      supabaseId: authUser.id,
      email: authUser.email ?? `${authUser.id}@supabase.local`,
      name:
        (authUser.user_metadata?.full_name as string | undefined) ||
        (authUser.user_metadata?.name as string | undefined) ||
        "Pengguna",
    },
  });

  const reply = await db.comment.create({
    data: {
      content,
      issueId: issue.id,
      userId: user.id,
      parentId: parent.id,
      status: "PENDING",
      claimStatus: "UNREVIEWED",
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
      message: "Balasan diterima dan menunggu moderasi.",
      reply,
    },
    { status: 201 }
  );
}
