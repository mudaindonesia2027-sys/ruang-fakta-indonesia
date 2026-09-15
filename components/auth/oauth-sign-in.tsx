"use client";

import { createClient } from "@/lib/supabase/client";

type Provider = "google" | "facebook";

const labels: Record<Provider, string> = {
  google: "Lanjut dengan Google",
  facebook: "Lanjut dengan Facebook",
};

export default function OAuthSignIn({
  provider,
  next = "/",
}: {
  provider: Provider;
  next?: string;
}) {
  async function signIn() {
    const supabase = createClient();
    const origin = window.location.origin;
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    });

    if (error) alert(error.message);
  }

  return (
    <button className="primaryButton" onClick={signIn} type="button">
      {labels[provider]}
    </button>
  );
}
