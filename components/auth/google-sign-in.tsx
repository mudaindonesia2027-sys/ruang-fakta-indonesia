"use client";

import { createClient } from "@/lib/supabase/client";

export default function GoogleSignIn() {
  async function signInWithGoogle() {
    const supabase = createClient();
    const origin = window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`
      }
    });

    if (error) {
      alert(error.message);
    }
  }

  return (
    <button className="primaryButton" onClick={signInWithGoogle}>
      Lanjut dengan Google
    </button>
  );
}
