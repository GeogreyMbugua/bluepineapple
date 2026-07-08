# Session Management Strategy

This document details the Session Management model for the Blue Pineapple platform. It prioritizes strong security, real-time access control, and low-latency validation.

---

## 1. Why Stateful Sessions?
A pure stateless JWT approach (where roles, permissions, and session status are stored inside the token payload) introduces two critical vulnerabilities:
1. **No Instant Revocation:** If a user logs out, is suspended, or changes roles, their JWT remains valid until its hard expiration time (typically 15 minutes to 1 hour).
2. **Token Bloat:** Storing complex role and permission arrays in the token increases the HTTP request header size significantly.

### The Blue Pineapple Stateful JWT Model
To address this, we decouple **authentication** (the token) from **authorization/state** (the session):
- The **JWT Access Token** contains only the user ID (`sub`) and session ID (`sid`). It has a short lifetime (15 minutes).
- The **Session State** is stored centrally in **Redis** (high-speed cache) and persisted in **PostgreSQL** (source of truth).
- Every request checks the session status in Redis. If the session is missing, revoked, or expired, access is denied immediately.

---

## 2. Session Lifecycle

```
[Login/Verify OTP]
       │
       ▼
 ┌───────────┐      1. Create record in DB (status: ACTIVE)
 │   Write   │ ──── 2. Generate cryptographically secure Refresh Token
 └───────────┘      3. Store active session data in Redis Cache
       │
       ▼
 ┌───────────┐      1. Extract sid from JWT
 │ Validate  │ ──── 2. Query Redis for sid (falls back to DB on cache miss)
 └───────────┘      3. Check expiration and status
       │
       ▼
 ┌───────────┐      1. Delete from Redis
 │  Revoke   │ ──── 2. Mark revokedAt = now in DB
 └───────────┘      3. JWT becomes invalid instantly
```

---

## 3. Refresh Token Rotation (RTR)
To mitigate the risk of refresh token theft (e.g. via XSS or local storage access), we enforce **strict one-time use** for refresh tokens:
- When a client requests a new access token using their `refreshToken`, the server:
  1. Validates the incoming refresh token against the Database.
  2. If valid, generates a **new** refresh token and invalidates/deletes the old one.
  3. Returns the new access token and the new refresh token (rotated).
- **Replay/Reuse Attack Detection:** If an invalidated or already-used refresh token is presented:
  - The system assumes a breach has occurred.
  - **Breach Mitigation Action:** The system immediately revokes **all** active sessions belonging to that user (force sign-out across all devices) and logs a high-severity audit event.

---

## 4. Session Data Structure
The session data stored in Redis and returned from the database has the following schema:

```json
{
  "id": "sess_8f2b3c9a...",
  "userId": "usr_1a2b3c...",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2026-06-24T20:00:00.000Z",
  "expiresAt": "2026-07-24T20:00:00.000Z"
}
```
*(Roles and permissions are resolved dynamically from Postgres on each request to prevent stale permissions cache, or cached separately with a brief TTL depending on performance requirements. Under Phase 1C/1B, they are queried fresh from Postgres to guarantee strong consistency).*
