import { IdentityVerificationProvider, IdentityVerificationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { VerihubsIdentityProvider } from "./verihubs";
import type { IdentityVerificationInput } from "./provider";

const providers = {
  VERIHUBS: new VerihubsIdentityProvider(),
} as const;

function normalizeNik(value: string) {
  return value.replace(/\D/g, "");
}

function validBirthDate(value: string) {
  return /^\d{2}-\d{2}-\d{4}$/.test(value);
}

export async function startIdentityVerification(userId: string, input: IdentityVerificationInput) {
  const nik = normalizeNik(input.nik);
  const name = input.name.trim();
  const birthDate = input.birthDate.trim();

  if (!/^\d{16}$/.test(nik)) throw new Error("NIK harus terdiri dari 16 digit.");
  if (!name) throw new Error("Nama wajib diisi.");
  if (!validBirthDate(birthDate)) throw new Error("Tanggal lahir harus berformat DD-MM-YYYY.");

  const verification = await db.identityVerification.create({
    data: {
      userId,
      provider: IdentityVerificationProvider.VERIHUBS,
      status: IdentityVerificationStatus.PENDING,
    },
  });

  try {
    const result = await providers.VERIHUBS.verifyIdentity({
      nik,
      name,
      birthDate,
      referenceId: verification.id,
    });

    const verified = result.nikVerified && result.nameVerified && result.birthDateVerified;
    const status = verified ? IdentityVerificationStatus.VERIFIED : IdentityVerificationStatus.FAILED;

    const updated = await db.identityVerification.update({
      where: { id: verification.id },
      data: {
        status,
        providerReference: result.referenceId ?? null,
        nikVerified: result.nikVerified,
        nameVerified: result.nameVerified,
        birthDateVerified: result.birthDateVerified,
        documentVerified: result.documentVerified,
        livenessVerified: result.livenessVerified,
        verifiedAt: verified ? new Date() : null,
        failureCode: verified ? null : "IDENTITY_NOT_MATCHED",
        metadata: result.raw as object,
      },
    });

    await audit({
      action: verified ? "IDENTITY_VERIFIED" : "IDENTITY_VERIFICATION_FAILED",
      entity: "IdentityVerification",
      entityId: verification.id,
      actorId: userId,
      details: { provider: result.provider, status },
    });

    return updated;
  } catch (error) {
    await db.identityVerification.update({
      where: { id: verification.id },
      data: { status: IdentityVerificationStatus.FAILED, failureCode: "PROVIDER_ERROR" },
    });
    throw error;
  }
}

export async function getLatestIdentityVerification(userId: string) {
  return db.identityVerification.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
