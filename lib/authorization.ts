import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

const permissions: Record<UserRole, readonly string[]> = {
  USER: ["read", "comment"],
  CONTRIBUTOR: ["read", "comment", "article:create"],
  EDITOR: ["read", "comment", "article:create", "article:update", "article:review", "issue:create", "issue:update", "comment:moderate"],
  REVIEWER: ["read", "article:review", "issue:update", "comment:moderate"],
  ADMIN: ["*"],
  SUPERADMIN: ["*"],
};

export async function requirePermission(permission: string) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, user: null, response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };
  const allowed = permissions[user.role].includes("*") || permissions[user.role].includes(permission);
  if (!allowed) return { ok: false as const, user, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { ok: true as const, user };
}
