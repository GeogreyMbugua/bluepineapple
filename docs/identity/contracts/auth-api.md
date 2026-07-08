# Identity API Contract

> **Status:** Draft  
> **Version:** 1.0.0  
> **Package:** `@blue-pineapple/iam`

This document defines the stable HTTP contract for the authentication and identity layer.  
It is the single source of truth between `apps/api`, `apps/web`, and any future mobile clients.

---

## Base URL

```
/api/auth
```

## Conventions

- All requests and responses use `application/json`.
- Dates in responses are ISO-8601 strings.
- Authenticated endpoints require a valid `Authorization: Bearer <accessToken>` header.
- The `accessToken` expires after **15 minutes**. Use the `refreshToken` to obtain a new one.

---

## 1. Request OTP

Send a one-time passcode to the user's registered email or phone.

```http
POST /api/auth/request-otp
```

### Request

```json
{
  "identifier": "partner@example.com"
}
```

| Field       | Type   | Required | Description                           |
|-------------|--------|----------|---------------------------------------|
| `identifier`| string | yes      | Email address or phone number         |

### Response `200 OK`

```json
{
  "success": true,
  "message": "OTP sent"
}
```

### Errors

| Code | Reason                      |
|------|-----------------------------|
| 400  | `identifier` is required    |
| 401  | Invalid identifier (never reveal if user exists) |

---

## 2. Verify OTP

Validate the OTP and receive an access + refresh token pair.

```http
POST /api/auth/verify-otp
```

### Request

```json
{
  "identifier": "partner@example.com",
  "otpCode": "123456"
}
```

| Field      | Type   | Required | Description              |
|------------|--------|----------|--------------------------|
| `identifier` | string | yes    | Email or phone number    |
| `otpCode`  | string | yes      | 6-digit OTP code         |

### Response `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4-e5f6-...",
  "expiresAt": "2026-06-25T16:00:00.000Z",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "partner@example.com",
    "roles": ["PARTNER"],
    "permissions": ["partner.read", "booking.create"],
    "userType": "PARTNER"
  }
}
```

| Field          | Type   | Description                                    |
|----------------|--------|------------------------------------------------|
| `accessToken`  | string | JWT (15 min expiry), send in `Authorization`   |
| `refreshToken` | string | Long-lived token (30 days), store HttpOnly      |
| `expiresAt`    | string | When `accessToken` expires (ISO-8601)          |
| `user`         | object | Immediate user context (avoids extra round-trip) |

### Errors

| Code | Reason                          |
|------|---------------------------------|
| 400  | `identifier` or `otpCode` invalid |
| 401  | OTP expired, not found, or mismatch |

---

## 3. Refresh Session

Exchange a valid `refreshToken` for a new access token pair.

```http
POST /api/auth/refresh
```

### Request

```json
{
  "refreshToken": "a1b2c3d4-e5f6-..."
}
```

### Response `200 OK`

Same shape as Verify OTP:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresAt": "...",
  "user": {
    "id": "...",
    "email": "...",
    "roles": [],
    "permissions": [],
    "userType": "USER"
  }
}
```

### Errors

| Code | Reason                           |
|------|----------------------------------|
| 400  | `refreshToken` is required       |
| 401  | Token not found, revoked, or replay detected (all user sessions revoked) |

---

## 4. Logout

Revoke the current session.

```http
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

### Request

No body required. The session is derived from the access token.

### Response `200 OK`

```json
{
  "success": true
}
```

### Errors

| Code | Reason               |
|------|----------------------|
| 401  | Invalid access token |

---

## 5. Get Current User

Return the authenticated user's claims.

```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

### Response `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "partner@example.com",
  "roles": ["PARTNER"],
  "permissions": ["partner.read", "booking.create"],
  "userType": "PARTNER"
}
```

### Errors

| Code | Reason               |
|------|----------------------|
| 401  | Missing or invalid token |

---

## Route Summary

| Method | Path             | Auth | Description                      |
|--------|------------------|------|----------------------------------|
| POST   | `/request-otp`   | No   | Send a login OTP                 |
| POST   | `/verify-otp`    | No   | Verify OTP, receive tokens       |
| POST   | `/refresh`       | No   | Refresh access token             |
| POST   | `/logout`        | Yes  | Revoke current session           |
| GET    | `/me`            | Yes  | Return current authenticated user|

---

## Token Storage Recommendations

| Token         | Location             | Notes                                 |
|---------------|----------------------|---------------------------------------|
| `accessToken` | Memory / `Authorization` header | Short-lived, safe in client memory |
| `refreshToken`| HttpOnly cookie      | Long-lived, `Secure`, `SameSite=Strict`, CSRF-protected |

---

## Change Policy

- This contract is **stable** once `apps/api` is built against it.
- Breaking changes require a new major version of `@blue-pineapple/iam`.
- Additive fields (new optional keys in responses) are always safe.
