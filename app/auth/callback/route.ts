import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { syncAccountVerifications } from "@/lib/verification/account";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next") || "/dashboard";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth_callback", requestUrl.origin));
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const appUser = await getCurrentUser();
      if (appUser) {
        await syncAccountVerifications(appUser.id, user.identities);
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
