import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/auth/jwt.service", () => ({
  verifyAccessToken: vi.fn(),
}));

vi.mock("../src/auth/session.service", () => ({
  validateSession: vi.fn(),
}));

vi.mock("@blue-pineapple/database", () => ({
  userRepository: {
    findByIdWithRolesAndPermissions: vi.fn(),
  },
}));

import { verifyAccessToken } from "../src/auth/jwt.service";
import { validateSession } from "../src/auth/session.service";
import { userRepository } from "@blue-pineapple/database";
import { authenticateRequest } from "../src/middleware/authenticate";
import { UnauthorizedError } from "../src/authorization/errors";

describe("authenticateRequest", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("authenticates a valid token and session", async () => {
    (verifyAccessToken as any).mockReturnValue({ sub: "u1", sid: "s1" });
    (validateSession as any).mockResolvedValue({ sessionId: "s1", userId: "u1" });
    (userRepository.findByIdWithRolesAndPermissions as any).mockResolvedValue({
      id: "u1",
      email: "test@example.com",
      phone: null,
      firstName: "T",
      lastName: "User",
      status: "ACTIVE",
      roles: ["ADMIN"],
      permissions: ["user.read"],
    });

    const req: any = { headers: { authorization: "Bearer good" } };
    const user = await authenticateRequest(req);
    expect(user.id).toBe("u1");
    expect(req.user).toBeDefined();
  });

  it("throws UnauthorizedError for invalid token", async () => {
    (verifyAccessToken as any).mockImplementation(() => { throw new Error("bad token"); });
    const req: any = { headers: { authorization: "Bearer bad" } };
    await expect(authenticateRequest(req)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("throws UnauthorizedError for missing session", async () => {
    (verifyAccessToken as any).mockReturnValue({ sub: "u2", sid: "s2" });
    (validateSession as any).mockResolvedValue(null);
    const req: any = { headers: { authorization: "Bearer ok" } };
    await expect(authenticateRequest(req)).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
