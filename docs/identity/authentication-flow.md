# Identity & Access Management: Authentication Flow

This document details the end-to-end authentication lifecycle of the Blue Pineapple platform, starting from a user requesting an OTP to issuing stateful JWT sessions.

## 1. OTP Login Request Flow
The login process begins when a user submits their unique identifier (email or phone number).

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Application
    participant API as Next.js API / Route Handler
    participant LoginSvc as LoginService
    participant UserRepo as UserRepository
    participant OtpRepo as OtpRepository
    participant AuditSvc as AuditService
    participant NotifSvc as Notification Service

    User->>API: POST /api/auth/login { identifier (email/phone) }
    API->>LoginSvc: requestOtp(identifier)
    LoginSvc->>UserRepo: findByEmail() or findByPhone()
    alt User Not Found
        LoginSvc->>UserRepo: create(identifier) (Auto-Register / Pending Verification)
    end
    LoginSvc->>OtpRepo: invalidateAllActive(userId, purpose: LOGIN)
    LoginSvc->>LoginSvc: Generate cryptographically secure 6-digit OTP
    LoginSvc->>LoginSvc: Hash OTP (SHA-256 + Salt)
    LoginSvc->>OtpRepo: create({ userId, hashedOtp, purpose: LOGIN, expiresAt: now + 5m })
    LoginSvc->>AuditSvc: logOtpSent(userId, purpose: LOGIN, channel)
    LoginSvc->>NotifSvc: Send plain-text OTP via SMS (Twilio) or Email (Resend)
    LoginSvc-->>API: { success: true }
    API-->>User: HTTP 200 { message: "OTP sent" }
```

---

## 2. OTP Verification & Session Issuance Flow
Once the OTP is received, the client submits it for verification. Verification instantly creates a stateful session.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Application
    participant API as Next.js API / Route Handler
    participant AuthSvc as AuthenticateService
    participant OtpRepo as OtpRepository
    participant SessionSvc as SessionService
    participant CacheSvc as SessionCacheService
    participant SessionRepo as SessionRepository
    participant JwtSvc as JwtService
    participant AuditSvc as AuditService

    User->>API: POST /api/auth/verify { identifier, otpCode }
    API->>AuthSvc: authenticate(identifier, otpCode)
    AuthSvc->>OtpRepo: findLatestActive(userId, purpose: LOGIN)
    alt OTP Not Found or Expired
        AuthSvc->>AuditSvc: logLoginFailure(identifier, reason: "OTP_NOT_FOUND_OR_EXPIRED")
        AuthSvc-->>API: throw ForbiddenError / UnauthorizedError
    end
    AuthSvc->>AuthSvc: Hash and compare incoming otpCode with stored hashedOtp
    alt Hashes Do Not Match
        AuthSvc->>AuditSvc: logLoginFailure(identifier, reason: "INVALID_OTP")
        AuthSvc-->>API: throw ForbiddenError
    end
    AuthSvc->>OtpRepo: markAsUsed(otpId)
    AuthSvc->>AuditSvc: logOtpVerified(userId, purpose: LOGIN)
    
    AuthSvc->>SessionSvc: createSession(userId, context: { ipAddress, userAgent })
    SessionSvc->>SessionRepo: create({ userId, refreshToken, expiresAt, ipAddress, userAgent })
    SessionSvc->>CacheSvc: setSession(sessionId, sessionData)
    SessionSvc->>AuditSvc: logSessionCreated(userId, sessionId, expiresAt)
    SessionSvc-->>AuthSvc: { sessionId, refreshToken, expiresAt }
    
    AuthSvc->>JwtSvc: signAccessToken({ sub: userId, sid: sessionId })
    AuthSvc->>AuditSvc: logLoginSuccess(userId, identifier)
    AuthSvc-->>API: { accessToken, refreshToken }
    API-->>User: HTTP 200 { accessToken } + HttpOnly cookie { refreshToken }
```

---

## 3. Stateful Access Token Verification Flow
For every subsequent request to protected resources, the client attaches the JWT access token in the `Authorization: Bearer <token>` header.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Application
    participant AuthMdl as Authenticate Middleware
    participant JwtSvc as JwtService
    participant CacheSvc as SessionCacheService
    participant UserRepo as UserRepository

    User->>AuthMdl: Request with Bearer Token
    AuthMdl->>JwtSvc: verifyAccessToken(token)
    alt Token Invalid / Expired
        AuthMdl-->>User: HTTP 401 Unauthorized
    end
    JwtSvc-->>AuthMdl: decode payload { sub: userId, sid: sessionId }
    
    AuthMdl->>CacheSvc: getSession(sessionId)
    alt Session Not in Redis (Cache Miss)
        AuthMdl->>CacheSvc: Fetch/Load from Postgres (SessionRepository) and populate Redis
    end
    alt Session Revoked or Expired
        AuthMdl-->>User: HTTP 401 Unauthorized (Session Revoked)
    end
    
    AuthMdl->>UserRepo: findByIdWithRolesAndPermissions(userId)
    UserRepo-->>AuthMdl: { user, roles, permissions }
    
    AuthMdl->>AuthMdl: Attach AuthUser context to Request
    AuthMdl-->>User: Proceed to protected handler
```
