import { createSession, validateSession, revokeSession } from "../src/auth/session.service";
import { signAccessToken, verifyAccessToken, decodeAccessToken } from "../src/auth/jwt.service";

async function run() {
  const userId = process.env.TEST_USER_ID || "00000000-0000-0000-0000-000000000000";
  console.log("Creating session for user:", userId);
  try {
    const { sessionId, refreshToken, expiresAt } = await createSession(userId, { ipAddress: "127.0.0.1", userAgent: "scratch" });
    console.log("sessionId", sessionId, "expiresAt", expiresAt);

    const access = signAccessToken(userId, sessionId);
    console.log("access token:", access.slice(0, 64) + "...");

    const payload = verifyAccessToken(access);
    console.log("verified payload:", payload);

    const decoded = decodeAccessToken(access);
    console.log("decoded:", decoded);

    const session = await validateSession(sessionId);
    console.log("validated session from cache/db:", session?.sessionId);

    // cleanup
    await revokeSession(sessionId);
    console.log("revoked session");
  } catch (err) {
    console.error("test failed", err);
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(1));
