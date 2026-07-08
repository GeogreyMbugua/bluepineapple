import type { AuthResult, RefreshResult, IdentityProviderOptions } from "../provider/identity-provider.types";
import { loginService } from "../auth/login.service";
import type { RequestOtpInput } from "../validators/login.schema";
import type { VerifyOtpInput } from "../validators/verify-otp.schema";
import type { RefreshTokenInput } from "../validators/refresh-token.schema";

export class AuthController {
  async requestOtp(validated: RequestOtpInput): Promise<{ expiresAt: string }> {
    return loginService.requestOtp(validated.identifier);
  }

  async verifyOtp(
    validated: VerifyOtpInput,
    options?: IdentityProviderOptions
  ): Promise<AuthResult> {
    return loginService.verifyOtp(validated.identifier, validated.otpCode, options);
  }

  async refreshToken(validated: RefreshTokenInput): Promise<RefreshResult> {
    return loginService.refresh(validated.refreshToken);
  }
}

export const authController = new AuthController();
