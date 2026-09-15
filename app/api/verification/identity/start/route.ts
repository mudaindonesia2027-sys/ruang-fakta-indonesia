import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { startIdentityVerification } from "@/lib/verification/identity";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

  try {
    const body = await request.json();
    const result = await startIdentityVerification(user.id, {
      nik: typeof body.nik === "string" ? body.nik : "",
      name: typeof body.name === "string" ? body.name : "",
      birthDate: typeof body.birthDate === "string" ? body.birthDate : "",
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        status: result.status,
        provider: result.provider,
        nikVerified: result.nikVerified,
        nameVerified: result.nameVerified,
        birthDateVerified: result.birthDateVerified,
        documentVerified: result.documentVerified,
        livenessVerified: result.livenessVerified,
        verifiedAt: result.verifiedAt,
      },
    });
  } catch (error) {
    console.error("Identity verification error:", error);
    const message = error instanceof Error ? error.message : "Gagal melakukan verifikasi identitas.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
