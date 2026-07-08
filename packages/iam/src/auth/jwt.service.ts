import jwt from "jsonwebtoken";
import { SessionTokenPayload } from "./session.types";
import { UnauthorizedError } from "../authorization/errors";

const JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
  // do not throw at import time; allow runtime checks in functions
}

export function signAccessToken(userId: string, sessionId: string): string {
  if (!JWT_SECRET) throw new UnauthorizedError("JWT secret is not configured");
  const payload: SessionTokenPayload = { sub: userId, sid: sessionId };
  return jwt.sign(payload as object, JWT_SECRET, { algorithm: "HS256", expiresIn: "15m" });
}

export function verifyAccessToken(token: string): SessionTokenPayload {
  if (!JWT_SECRET) throw new UnauthorizedError("JWT secret is not configured");
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    return decoded as SessionTokenPayload;
  } catch (err) {
    throw new UnauthorizedError("Invalid or expired access token");
  }
}

export function decodeAccessToken(token: string): SessionTokenPayload | null {
  try {
    const decoded = jwt.decode(token) as SessionTokenPayload | null;
    return decoded;
  } catch {
    return null;
  }
}
