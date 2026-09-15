export type IdentityVerificationInput = {
  nik: string;
  name: string;
  birthDate: string;
  referenceId?: string;
};

export type IdentityVerificationResult = {
  provider: "MANUAL" | "VERIHUBS" | "PRIVY" | "VIDA";
  referenceId?: string;
  nikVerified: boolean;
  nameVerified: boolean;
  birthDateVerified: boolean;
  documentVerified: boolean;
  livenessVerified: boolean;
  raw?: unknown;
};

export interface IdentityProvider {
  verifyIdentity(input: IdentityVerificationInput): Promise<IdentityVerificationResult>;
}

/**
 * Initial provider for RUANG FAKTA. It creates a pending verification
 * without sending sensitive identity data to a third party.
 * A reviewer must complete the verification manually.
 */
export class ManualIdentityProvider implements IdentityProvider {
  async verifyIdentity(input: IdentityVerificationInput): Promise<IdentityVerificationResult> {
    return {
      provider: "MANUAL",
      referenceId: input.referenceId,
      nikVerified: false,
      nameVerified: false,
      birthDateVerified: false,
      documentVerified: false,
      livenessVerified: false,
    };
  }
}
