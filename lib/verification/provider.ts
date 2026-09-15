export type IdentityVerificationInput = {
  nik: string;
  name: string;
  birthDate: string;
  referenceId?: string;
};

export type IdentityVerificationResult = {
  provider: "VERIHUBS" | "PRIVY" | "VIDA";
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
