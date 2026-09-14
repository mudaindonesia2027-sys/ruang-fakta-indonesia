import { db } from "@/lib/db";

type AuditInput = {
  action: string;
  entity?: string;
  entityId?: string;
  userId?: string;
  actorId?: string;
  metadata?: unknown;
  details?: unknown;
};

function toJson(value: unknown) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

export async function createAuditLog(input: AuditInput) {
  try {
    return await db.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity ?? null,
        entityId: input.entityId ?? null,
        userId: input.userId ?? input.actorId ?? null,
        details: toJson(input.details ?? input.metadata),
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
    return null;
  }
}

export const audit = createAuditLog;
