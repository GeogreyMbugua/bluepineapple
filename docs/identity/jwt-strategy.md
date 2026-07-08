# JWT Strategy

This document describes the cryptographic specifications, payload structure, and verification guidelines for JSON Web Tokens (JWT) used in the Blue Pineapple platform.

---

## 1. Cryptographic Algorithm
We use **HS256 (HMAC with SHA-256)** for token signature:
- **HS256** uses a single shared secret key (`JWT_SECRET`) to both sign and verify tokens. Since our backend service (IAM package and API endpoints) exists within a consolidated monorepo that shares environment configurations, a symmetric algorithm is optimal.
- In the future, if external third-party services need to verify our tokens without access to the signing secret, we can migrate to **RS256 (RSA Signature with SHA-256)** (asymmetric keys).

---

## 2. Token Payload (Claims)
To prevent token bloat and guarantee absolute up-to-date role/permission validation, the access token contains **only** identity identifiers. It does *not* contain authorization data.

### Access Token Claims

```json
{
  "iss": "blue-pineapple-iam",
  "sub": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "sid": "sess_f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "aud": "blue-pineapple-platform",
  "exp": 1782334800,
  "iat": 1782333900
}
```

| Claim | Name | Value / Purpose |
|---|---|---|
| `iss` | Issuer | Identifies the issuing authority (`blue-pineapple-iam`). |
| `sub` | Subject | Unique identifier of the authenticated user (`userId`). |
| `sid` | Session ID | Unique identifier of the stateful session (`sessionId`). Used to validate active state. |
| `aud` | Audience | Intended recipient of the token (`blue-pineapple-platform`). |
| `exp` | Expiration Time | Unix timestamp. Access tokens are short-lived (**15 minutes**). |
| `iat` | Issued At | Unix timestamp indicating when the token was created. |

---

## 3. Cryptographic Secret Management
- The signing secret must be loaded via the environment variable `JWT_SECRET`.
- Production requirements: The key must be a cryptographically secure random string with a minimum length of 256 bits (32 bytes), generated via:
  ```bash
  openssl rand -base64 32
  ```

---

## 4. Verification Policy
When a request is intercepted by the authenticate middleware:
1. **Signature Integrity:** The signature must be verified using `JWT_SECRET`. If verification fails, throw `UnauthorizedError` immediately.
2. **Temporal Validation:**
   - The current time must be after `nbf` (if present).
   - The current time must be before `exp`.
3. **Session Check:** The `sid` claim must be extracted and cross-checked against the active sessions stored in Redis/Postgres.
