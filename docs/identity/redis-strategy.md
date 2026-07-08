# Redis Strategy

This document details the Redis caching architecture, namespaces, and lookup strategies used by the Blue Pineapple session management layer.

---

## 1. Role of Redis
Redis acts as a low-latency, in-memory cache for stateful user sessions. Every incoming API request validates the user's `sid` (Session ID). Querying PostgreSQL on every HTTP request would create a database bottleneck. By placing Redis in front of PostgreSQL, session validation is reduced to sub-millisecond lookups.

---

## 2. Key Namespacing & Payload
To avoid collisions with other cached resources (e.g., page renders, rates, bookings), all session keys follow a strict hierarchical namespace pattern:

`bp:session:<sessionId>`

### Cache Payload Schema
The cached string is a serialized JSON object containing the user's active session metadata:

```json
{
  "userId": "usr_9b1deb4d...",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2026-06-24T20:00:00.000Z",
  "expiresAt": "2026-07-24T20:00:00.000Z"
}
```

---

## 3. TTL (Time-To-Live) Strategy
To guarantee Redis memory is utilized efficiently:
- The Redis TTL matches the session's actual expiration time:
  
  $$\text{Redis TTL} = \text{Session Expiration Date} - \text{Current Date}$$
  
- For a typical 30-day session, the TTL is initially set to 30 days.
- **Revocation TTL:** When a session is explicitly revoked or a user logs out, the key `bp:session:<sessionId>` is deleted from Redis immediately.

---

## 4. Cache-Aside (Read-Through) Pattern
Session lookups use a strict Cache-Aside sequence to guarantee data integrity:

```
    [Request to validate sid]
               │
               ▼
      ┌─────────────────┐
      │  Query Redis    │
      │  bp:session:sid │
      └─────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
  [Cache Hit]     [Cache Miss]
   Verify Exp          │
                       ▼
             ┌──────────────────┐
             │ Query PostgreSQL │
             │ Session Table    │
             └──────────────────┘
                       │
               ┌───────┴───────┐
               ▼               ▼
          [Found Active]   [Not Found/Revoked]
           Populate Redis      │
           with Session TTL    ▼
               │          [Deny Access]
               ▼
        [Grant Access]
```

---

## 5. Connection Resilience
The `SessionCacheService` will wrap Redis operations in try-catch blocks. 
- **Failover Policy:** If Redis is down (connection error), the system falls back directly to querying PostgreSQL. This degrades response times slightly but prevents system-wide login outages.
