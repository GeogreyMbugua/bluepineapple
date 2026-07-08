import type { AuthResult, RefreshResult, IdentityProviderOptions } from "../provider/identity-provider.types";
import { identityProvider } from "../provider/identity-provider";

export class LoginService {
  async requestOtp(identifier: string): Promise<{ expiresAt: string }> {
    return identityProvider.requestLoginOtp(identifier);
  }

  async verifyOtp(
    identifier: string,
    otpCode: string,
    options?: IdentityProviderOptions
  ): Promise<AuthResult> {
    return identityProvider.verifyOtp(identifier, otpCode, options);
  }

  async refresh(refreshToken: string): Promise<RefreshResult> {
    return identityProvider.refresh(refreshToken);
  }
}

export const loginService = new LoginService();
