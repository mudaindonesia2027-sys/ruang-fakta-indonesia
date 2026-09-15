import type { IdentityProvider, IdentityVerificationInput, IdentityVerificationResult } from "./provider";

const BASE_URL = "https://api.verihubs.com";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export class VerihubsIdentityProvider implements IdentityProvider {
  async verifyIdentity(input: IdentityVerificationInput): Promise<IdentityVerificationResult> {
    const response = await fetch(`${BASE_URL}/data-verification/id-verification/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "App-ID": requiredEnv("VERIHUBS_APP_ID"),
        "API-Key": requiredEnv("VERIHUBS_API_KEY"),
      },
      body: JSON.stringify({
        nik: input.nik,
        name: input.name,
        birth_date: input.birthDate,
        ...(input.referenceId ? { reference_id: input.referenceId } : {}),
      }),
      cache: "no-store",
    });

    const raw = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error("Verihubs identity verification failed");
      Object.assign(error, { status: response.status, providerResponse: raw });
      throw error;
    }

    const data = raw?.data ?? raw ?? {};
    return {
      provider: "VERIHUBS",
      referenceId: data.reference_id ?? data.referenceId ?? input.referenceId,
      nikVerified: data.nik_verified === true || data.nik === true,
      nameVerified: data.name_verified === true || data.name === true,
      birthDateVerified: data.birth_date_verified === true || data.birth_date === true,
      documentVerified: false,
      livenessVerified: false,
      raw: {
        reference_id: data.reference_id ?? data.referenceId ?? input.referenceId,
        nik_verified: data.nik_verified ?? data.nik ?? false,
        name_verified: data.name_verified ?? data.name ?? false,
        birth_date_verified: data.birth_date_verified ?? data.birth_date ?? false,
      },
    };
  }
}
