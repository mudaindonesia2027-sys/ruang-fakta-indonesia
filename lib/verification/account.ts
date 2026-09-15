import { AccountVerificationProvider, AccountVerificationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";

type SupabaseIdentity = {
  id?: string;
  provider?: string;
};

const providerMap: Record<string, AccountVerificationProvider> = {
  google: "GOOGLE",
  facebook: "FACEBOOK",
  apple: "APPLE",
  github: "GITHUB",
  linkedin: "LINKEDIN",
};

export async function syncAccountVerifications(
  userId: string,
  identities: SupabaseIdentity[] | null | undefined,
) {
  if (!identities?.length) return [];

  const synced = [];

  for (const identity of identities) {
    const provider = identity.provider ? providerMap[identity.provider] : undefined;
    const providerAccountId = identity.id;

    if (!provider || !providerAccountId) continue;

    const existing = await db.accountVerification.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
    });

    if (existing && existing.userId !== userId) {
      // Never reassign a provider account to another RUANG FAKTA account.
      continue;
    }

    const verification = await db.accountVerification.upsert({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      update: {
        status: "VERIFIED" as AccountVerificationStatus,
        verifiedAt: existing?.verifiedAt ?? new Date(),
        revokedAt: null,
      },
      create: {
        userId,
        provider,
        providerAccountId,
        status: "VERIFIED",
        verifiedAt: new Date(),
      },
    });

    synced.push(verification);

    if (!existing) {
      await audit({
        action: "ACCOUNT_VERIFIED",
        entity: "AccountVerification",
        entityId: verification.id,
        userId,
        details: { provider },
      });
    }
  }

  return synced;
}

export async function getVerifiedAccountProviders(userId: string) {
  const accounts = await db.accountVerification.findMany({
    where: { userId, status: "VERIFIED" },
    select: { provider: true, verifiedAt: true },
    orderBy: { verifiedAt: "asc" },
  });

  return accounts;
}
