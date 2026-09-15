import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLatestIdentityVerification } from "@/lib/verification/identity";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

  const result = await getLatestIdentityVerification(user.id);
  if (!result) return NextResponse.json({ success: true, data: null });

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
      expiresAt: result.expiresAt,
      createdAt: result.createdAt,
    },
  });
}
