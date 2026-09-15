import { IdentityVerificationProvider, IdentityVerificationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { ManualIdentityProvider } from "./provider";
import type { IdentityVerificationInput } from "./provider";

const provider = new ManualIdentityProvider();

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

  // Do not persist NIK, name, or birth date. They are only accepted here
  // so the application can validate the submission before creating a review.
  const verification = await db.identityVerification.create({
    data: {
      userId,
      provider: IdentityVerificationProvider.MANUAL,
      status: IdentityVerificationStatus.PENDING,
    },
  });

  await provider.verifyIdentity({
    ...input,
    nik,
    name,
    birthDate,
    referenceId: verification.id,
  });

  await audit({
    action: "IDENTITY_VERIFICATION_STARTED",
    entity: "IdentityVerification",
    entityId: verification.id,
    actorId: userId,
    details: { provider: "MANUAL" },
  });

  return verification;
}

export async function reviewIdentityVerification(
  verificationId: string,
  reviewerId: string,
  approved: boolean,
  failureCode?: string,
) {
  const verification = await db.identityVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) throw new Error("Verifikasi identitas tidak ditemukan.");
  if (verification.status !== IdentityVerificationStatus.PENDING) {
    throw new Error("Verifikasi identitas ini sudah diproses.");
  }

  const status = approved
    ? IdentityVerificationStatus.VERIFIED
    : IdentityVerificationStatus.FAILED;

  const updated = await db.identityVerification.update({
    where: { id: verificationId },
    data: {
      status,
      verifiedAt: approved ? new Date() : null,
      failureCode: approved ? null : failureCode || "MANUAL_REVIEW_FAILED",
    },
  });

  await audit({
    action: approved ? "IDENTITY_VERIFIED" : "IDENTITY_VERIFICATION_FAILED",
    entity: "IdentityVerification",
    entityId: verificationId,
    actorId: reviewerId,
    details: { provider: "MANUAL", status },
  });

  return updated;
}

export async function getLatestIdentityVerification(userId: string) {
  return db.identityVerification.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
