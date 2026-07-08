import { userRepository } from "@blue-pineapple/database";
import type { UserProfileUpdate } from "./user.types";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";

export class UserService {
  async createUser(data: { firstName: string; lastName: string; email?: string | null; phone?: string | null }): Promise<string> {
    const user = await userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email ?? null,
      phone: data.phone ?? null,
      status: "PENDING_VERIFICATION",
    });

    await auditService.logLoginRequested(data.email ?? data.phone ?? "unknown", { });

    const userCreatedPayload: { userId: string; email?: string; phone?: string } = { userId: user.id };
    if (data.email) userCreatedPayload.email = data.email ?? undefined;
    if (data.phone) userCreatedPayload.phone = data.phone ?? undefined;
    eventBus.emit("user.created", userCreatedPayload);

    return user.id;
  }

  async updateProfile(userId: string, profile: UserProfileUpdate) {
    return userRepository.update(userId, profile);
  }
}

export const userService = new UserService();
