import { UserRole } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return db.user.upsert({
    where: { supabaseId: user.id },
    update: {
      email: user.email || "",
      name: user.user_metadata?.full_name || user.user_metadata?.name || null
    },
    create: {
      supabaseId: user.id,
      email: user.email || `user-${user.id}@invalid.local`,
      name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      role: "USER"
    }
  });
}

export async function requireRole(...roles: UserRole[]) {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: "UNAUTHENTICATED" as const };
  if (!roles.includes(user.role)) return { user, error: "FORBIDDEN" as const };
  return { user, error: null };
}
