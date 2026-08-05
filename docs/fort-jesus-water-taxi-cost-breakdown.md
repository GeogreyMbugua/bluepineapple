# Fort Jesus Water Taxi — Cost Breakdown

## Estimate: 50,000 KSH

---

## 1. Infrastructure Costs (What It Takes to Go Live)

| Component | Monthly | Annual (KSH) |
|---|---|---|
| Server (VPS — 1GB RAM, 1 CPU) | 1,200–2,000 | 14,400–24,000 |
| Database (PostgreSQL — managed or self-hosted) | 0–500 | 0–6,000 |
| Messaging (SMTP email + WhatsApp Business API) | 0–1,000 | 0–12,000 |
| Domain (.com/year) | — | 1,500 |
| SSL (Let's Encrypt) | Free | Free |
| Redis (cache/sessions, on same VPS) | Included | Included |
| **Total Infrastructure** | **1,200–3,500** | **15,000–42,000** |

The infrastructure alone is **way less than 50,000 KSH** — roughly 15,000–42,000 KSH/year.

---

## 2. What the 50,000 KSH Covers (Development)

The estimate is not just for servers — it covers the full build:

### Partner Portal
- Partner profile management, payout accounts, booking management, commission tracking, RBAC policies

### Admin Portal
- User/role/permission management, full CRUD for experiences, routes, vessels, departures, bookings, promotions, quotes, holds, cancellation policies, refunds, taxes, commissions, CRM, finance, audit logging

### Promotional Code Calculation
- Validate/apply promotions, stackability rules, per-user limits, usage tracking, couple discounts (10%), group discounts (8%), child discounts (50%), return ticket multiplier (1.8x)

### Messaging System
- Notification adapter interface, SMTP email config, event bus with 100+ event types (booking created, promotion applied, payment captured, etc.)

### Booking System
- Full lifecycle (create, confirm, cancel, complete, no-show), capacity management with atomic reserves, booking status history, guest management, payment tracking, reward transactions

### Fort Jesus Trip Page
- Hero, inclusions, itinerary, safety, pricing with route-fares planner, sticky book bar, WhatsApp booking links, dynamic fare calculation by stop count

### Design & Frontend
- Animated hero section, responsive grid layouts, framer-motion animations, coastal theme, mobile sticky booking bar

---

## 3. Summary

| Category | Cost |
|---|---|
| Infrastructure (server + DB + messaging) | 15,000–42,000 KSH/year |
| Development (partner portal + admin + promo codes + messaging + booking + Fort Jesus page) | 35,000–45,000 KSH |
| **Total Estimate** | **50,000 KSH** |

The infrastructure is indeed way less than 50,000 KSH. The bulk of the cost is the development work across all four systems plus the booking engine and the Fort Jesus trip page.