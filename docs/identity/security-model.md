# Security Model

This document outlines the security controls, storage policies, and threat mitigation models for the Blue Pineapple Identity and Access Management (IAM) infrastructure.

---

## 1. Token Storage Strategy
To protect tokens from unauthorized access, we apply distinct storage strategies based on token type:

### Access Token (JWT)
- **Lifetime:** 15 minutes.
- **Storage:** Client-side memory (React/Next.js state).
- **Security:** Memory-only storage protects against Cross-Site Scripting (XSS) extraction. It is lost on page refresh, which is acceptable since the client can immediately request a new one using the silent refresh flow.

### Refresh Token
- **Lifetime:** 30 days (or until rotated/revoked).
- **Storage:** **HttpOnly, Secure, SameSite=Strict Cookie**.
- **Security:**
  - **HttpOnly:** Prevents client-side scripts from reading the token (mitigates XSS).
  - **Secure:** Enforces transmission only over encrypted connections (HTTPS).
  - **SameSite=Strict:** Mitigates Cross-Site Request Forgery (CSRF) by preventing the cookie from being sent on cross-site requests.

---

## 2. Mitigation of Common Attacks

### Cross-Site Scripting (XSS)
By restricting the Refresh Token to `HttpOnly` cookies and keeping the Access Token in memory, we ensure that an attacker executing arbitrary scripts on the client cannot steal persistent credentials.

### Cross-Site Request Forgery (CSRF)
Since our API routes are consumed in a first-party environment, setting `SameSite=Strict` on the session cookie is the primary defense. Additionally, requests to mutate state (e.g. Server Actions, POST/PUT/DELETE API endpoints) require a valid `Authorization: Bearer <JWT>` header. Since cookies are not automatically sent as headers, cross-site requests cannot provide the Bearer token.

### Refresh Token Theft (Replay Attack)
If an attacker somehow steals a refresh token:
1. They attempt to swap it for a new access token.
2. The server processes this swap, issue a rotated refresh token, and marks the old one as used.
3. When the legitimate user's client attempts to refresh using the same (now marked "used") token, the server detects **Replay Attack**.
4. **Action:** The server immediately invalidates the entire session tree for that user (all active sessions are deleted from Redis and marked revoked in Postgres), forcing a complete re-authentication (OTP verification) across all devices.

---

## 3. Cryptographic and Design Principles

### Fail-Secure Default
If any authentication validation fails (e.g. database offline, Redis connection timed out, malformed JWT, empty role lists, unhandled runtime exception), the system defaults to **Deny Access**.

### Maximum Session Lifetime
Regardless of activity, all sessions expire after a hard limit of 30 days from creation, forcing users to re-verify their identity via OTP.
