import { db } from "@/lib/db";

export type RateLimitAction =
  | "ARTICLE_CREATED"
  | "ISSUE_CREATED"
  | "ROLE_CLAIM_CREATED"
  | "CLAIM_CREATED"
  | "ROLE_EVIDENCE_CREATED"
  | "CLAIM_EVIDENCE_CREATED";

type RateLimitRule = {
  limit: number;
  windowMs: number;
};

const RULES: Record<RateLimitAction, RateLimitRule> = {
  ARTICLE_CREATED: { limit: 5, windowMs: 60 * 60 * 1000 },
  ISSUE_CREATED: { limit: 5, windowMs: 60 * 60 * 1000 },
  ROLE_CLAIM_CREATED: { limit: 3, windowMs: 60 * 60 * 1000 },
  CLAIM_CREATED: { limit: 10, windowMs: 60 * 60 * 1000 },
  ROLE_EVIDENCE_CREATED: { limit: 12, windowMs: 60 * 60 * 1000 },
  CLAIM_EVIDENCE_CREATED: { limit: 20, windowMs: 60 * 60 * 1000 },
};

export async function checkRateLimit(
  userId: string,
  action: RateLimitAction,
) {
  const rule = RULES[action];
  const since = new Date(Date.now() - rule.windowMs);

  const [count, oldest] = await Promise.all([
    db.auditLog.count({
      where: {
        userId,
        action,
        createdAt: { gte: since },
      },
    }),
    db.auditLog.findFirst({
      where: {
        userId,
        action,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
  ]);

  if (count >= rule.limit && oldest) {
    const retryAt = oldest.createdAt.getTime() + rule.windowMs;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((retryAt - Date.now()) / 1000),
    );

    return {
      allowed: false as const,
      retryAfterSeconds,
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
