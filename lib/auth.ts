import { UserRole } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { syncAccountVerifications } from "@/lib/verification/account";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const appUser = await db.user.upsert({
    where: { supabaseId: user.id },
    update: {
      email: user.email || "",
      name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
    },
    create: {
      supabaseId: user.id,
      email: user.email || `user-${user.id}@invalid.local`,
      name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
      role: "USER",
    },
  });

  // OAuth identities are trusted by Supabase after the callback. We record only
  // the provider + opaque provider account ID; access/refresh tokens are never stored.
  await syncAccountVerifications(appUser.id, user.identities);

  return appUser;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: "UNAUTHENTICATED" as const };
  if (!roles.includes(user.role)) return { user, error: "FORBIDDEN" as const };
  return { user, error: null };
}
