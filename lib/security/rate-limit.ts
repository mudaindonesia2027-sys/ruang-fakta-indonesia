import { db } from "@/lib/db";

export type RateLimitAction =
  | "ARTICLE_CREATED"
  | "ISSUE_CREATED"
  | "ROLE_CLAIM_CREATED"
  | "CLAIM_CREATED";

type RateLimitRule = {
  limit: number;
  windowMs: number;
};

const RULES: Record<RateLimitAction, RateLimitRule> = {
  ARTICLE_CREATED: { limit: 5, windowMs: 60 * 60 * 1000 },
  ISSUE_CREATED: { limit: 5, windowMs: 60 * 60 * 1000 },
  ROLE_CLAIM_CREATED: { limit: 3, windowMs: 60 * 60 * 1000 },
  CLAIM_CREATED: { limit: 10, windowMs: 60 * 60 * 1000 },
};

export async function checkRateLimit(
  userId: string,
  action: RateLimitAction,
) {
  const rule = RULES[action];
  const since = new Date(Date.now() - rule.windowMs);

  const count = await db.auditLog.count({
    where: {
      userId,
      action,
      createdAt: { gte: since },
    },
  });

  if (count >= rule.limit) {
    return {
      allowed: false as const,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil(rule.windowMs / 1000),
      ),
    };
  }

  return { allowed: true as const };
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return {
    success: false,
    error: "Terlalu banyak aktivitas dalam waktu singkat. Silakan coba lagi nanti.",
    retryAfterSeconds,
  };
}
