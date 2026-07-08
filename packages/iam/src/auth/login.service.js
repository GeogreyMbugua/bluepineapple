import { identityProvider } from "../provider/identity-provider";
export class LoginService {
    async requestOtp(identifier) {
        return identityProvider.requestLoginOtp(identifier);
    }
    async verifyOtp(identifier, otpCode, options) {
        return identityProvider.verifyOtp(identifier, otpCode, options);
    }
    async refresh(refreshToken) {
        return identityProvider.refresh(refreshToken);
    }
}
export const loginService = new LoginService();
