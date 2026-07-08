import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../authorization/errors";
const JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
    // do not throw at import time; allow runtime checks in functions
}
export function signAccessToken(userId, sessionId) {
    if (!JWT_SECRET)
        throw new UnauthorizedError("JWT secret is not configured");
    const payload = { sub: userId, sid: sessionId };
    return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: "15m" });
}
export function verifyAccessToken(token) {
    if (!JWT_SECRET)
        throw new UnauthorizedError("JWT secret is not configured");
    try {
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
        return decoded;
    }
    catch (err) {
        throw new UnauthorizedError("Invalid or expired access token");
    }
}
export function decodeAccessToken(token) {
    try {
        const decoded = jwt.decode(token);
        return decoded;
    }
    catch {
        return null;
    }
}
