import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authorization";

export async function POST(request: NextRequest) {
  const access = await requirePermission("article:create");
  if (!access.ok) return access.response;

  try {
    const body = await request.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url || url.length > 2000) {
      return NextResponse.json({ success: false, error: "URL media wajib diisi dan maksimal 2.000 karakter." }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ success: false, error: "URL media tidak valid." }, { status: 400 });
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ success: false, error: "Media hanya boleh menggunakan URL HTTP atau HTTPS." }, { status: 400 });
    }

    const type = typeof body.type === "string" ? body.type.trim().slice(0, 50) : "IMAGE";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 255) || null : null;

    return NextResponse.json({ success: true, data: { url: parsed.toString(), type, name } });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json({ success: false, error: "Gagal memproses media." }, { status: 500 });
  }
}
