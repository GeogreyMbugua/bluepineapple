import { userRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
export class UserService {
    async createUser(data) {
        const user = await userRepository.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email ?? null,
            phone: data.phone ?? null,
            status: "PENDING_VERIFICATION",
        });
        await auditService.logLoginRequested(data.email ?? data.phone ?? "unknown", {});
        eventBus.emit("user.created", { userId: user.id, email: data.email ?? undefined, phone: data.phone ?? undefined });
        return user.id;
    }
    async updateProfile(userId, profile) {
        return userRepository.update(userId, profile);
    }
}
export const userService = new UserService();
