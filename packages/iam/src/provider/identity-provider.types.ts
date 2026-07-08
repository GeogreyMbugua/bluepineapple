import type { JwtClaims } from "../types/claims";

export interface IdentityProviderOptions {
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  claims: JwtClaims;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  claims: JwtClaims;
}

export interface LogoutResult {
  success: boolean;
}
