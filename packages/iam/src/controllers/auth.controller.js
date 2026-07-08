import { loginService } from "../auth/login.service";
export class AuthController {
    async requestOtp(validated) {
        return loginService.requestOtp(validated.identifier);
    }
    async verifyOtp(validated, options) {
        return loginService.verifyOtp(validated.identifier, validated.otpCode, options);
    }
    async refreshToken(validated) {
        return loginService.refresh(validated.refreshToken);
    }
}
export const authController = new AuthController();
