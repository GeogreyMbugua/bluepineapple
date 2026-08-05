# Admin Portal — Dashboard Design Specification

## 1. Admin Capabilities (from RBAC)

The `ADMIN` role has these permissions:
- **Users:** `user.read`, `user.manage`
- **Partners:** `partner.read`, `partner.create`, `partner.update`
- **Bookings:** `booking.read`, `booking.create`, `booking.update`, `booking.manage`
- **Experiences:** `experience.read`, `experience.create`, `experience.update`, `experience.manage`
- **Rewards:** `reward.read`, `reward.manage`

`SUPER_ADMIN` has wildcard access to everything including `payment.*`, `property.*`, `investment.*`, `partner.delete`, `experience.delete`, `booking.cancel`.

---

## 2. Data Model Overview

| Domain | Key Models | Admin Relevance |
|--------|-----------|-----------------|
| **Users** | `User`, `UserRole`, `Role`, `Permission`, `Session`, `AuthLog` | Manage users, assign roles, view auth logs |
| **Partners** | `PartnerProfile`, `PartnerPayoutAccount`, `PartnerStatusHistory` | Approve/suspend partners, manage payouts |
| **Bookings** | `Booking`, `BookingGuest`, `BookingStatusHistory` | View/manage bookings, status changes |
| **Experiences** | `Experience`, `ExperienceRoute`, `Departure` | Create/edit experiences, manage routes and departures |
| **Rewards** | `RewardTransaction`, `RewardRule` | View/manage reward transactions and rules |
| **Payments** | `Payment` | Read/manage/refund (SUPER_ADMIN only) |
| **Properties** | `Property`, `PropertyImage` | Read/manage (SUPER_ADMIN only) |
| **Investments** | `Investment`, `InvestmentTransaction` | Read/manage (SUPER_ADMIN only) |
| **Operations** | `Vessel`, `Voyage`, `CrewMember`, `CheckIn`, `Boarding` | Fleet/voyage management (SUPER_ADMIN) |

---

## 3. Dashboard Layout Architecture

### 3.1 Shell Structure
```
┌─────────────────────────────────────────────────────┐
│  Header: Logo | Search | Notifications | Admin Menu  │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  Sidebar │          Main Content Area               │
│          │                                          │
│  - nav   │   (Server Component, data fetched        │
│  - links │    server-side, rendered as RSC)          │
│          │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### 3.2 Navigation Items (Sidebar)

| Section | Item | Icon | Required Permission |
|---------|------|------|---------------------|
| **Main** | Dashboard | `LayoutDashboard` | — |
| **Users** | Users | `Users` | `user.read` |
| | Roles & Permissions | `Shield` | `user.manage` |
| **Partners** | Partners | `Handshake` | `partner.read` |
| | Payout Accounts | `Wallet` | `partner.read` |
| **Bookings** | Bookings | `CalendarCheck` | `booking.read` |
| | Departures | `Ship` | `booking.read` |
| **Experiences** | Experiences | `Compass` | `experience.read` |
| | Routes | `Map` | `experience.read` |
| **Rewards** | Rewards | `Gift` | `reward.read` |
| | Reward Rules | `Settings` | `reward.manage` |
| **Finance** *(SUPER_ADMIN)* | Payments | `CreditCard` | `payment.read` |
| | Refunds | `Undo` | `payment.refund` |
| **Properties** *(SUPER_ADMIN)* | Properties | `Building2` | `property.read` |
| | Investments | `TrendingUp` | `investment.read` |
| **Operations** *(SUPER_ADMIN)* | Vessels | `Ship` | — |
| | Voyages | `Navigation` | — |
| | Crew | `UserCheck` | — |
| **System** | Audit Logs | `FileText` | — |
| | Sessions | `Clock` | — |

---

## 4. Dashboard (Home) Page

### 4.1 KPI Cards Row

| Card | Metric | Source | Admin Relevance |
|------|--------|--------|-----------------|
| **Total Users** | Count of all users | `User` | Platform growth |
| **Active Partners** | Count where `status = ACTIVE` | `PartnerProfile` | Partner health |
| **Pending Partners** | Count where `status = PENDING` | `PartnerProfile` | Needs approval |
| **Today's Bookings** | Count where `date = today()` | `Booking` | Daily operations |
| **Revenue Today** | Sum of `totalAmount` for today | `Booking` | Financial health |
| **Active Sessions** | Count non-revoked sessions | `Session` | Security monitoring |

### 4.2 Charts Section

| Chart | Data | Time Range |
|-------|------|-----------|
| **Bookings Trend** | Daily booking counts | Last 7 days / 30 days |
| **Revenue Trend** | Daily revenue | Last 7 days / 30 days |
| **Partner Growth** | New partners per month | Last 6 months |
| **User Registrations** | New users per day | Last 7 days |

### 4.3 Recent Activity Table

| Column | Source | Notes |
|--------|--------|-------|
| Time | `Booking.createdAt` / `AuthLog.createdAt` | Relative time (e.g., "2m ago") |
| User/Actor | `User.firstName + lastName` | |
| Action | Derived | "Created booking", "Updated partner", "Logged in" |
| Target | Booking reference / Partner name | |
| Status | `Booking.status` / success | Color-coded badge |

### 4.4 Quick Actions Panel

| Action | Permission | Route |
|--------|-----------|-------|
| Create User | `user.manage` | `/admin/users/new` |
| Approve Partner | `partner.update` | `/admin/partners` |
| Create Experience | `experience.create` | `/admin/experiences/new` |
| View Pending Bookings | `booking.manage` | `/admin/bookings?status=PENDING` |

---

## 5. Users Page (`/admin/users`)

### 5.1 Data Table

| Column | Sortable | Filterable | Notes |
|--------|----------|-----------|-------|
| Name | ✅ | | `firstName + lastName` |
| Email | ✅ | ✅ | Unique identifier |
| Phone | | | |
| Status | ✅ | ✅ | `ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION` — badge colors |
| Roles | | ✅ | Pill badges, multi-select filter |
| Last Login | ✅ | | `lastLoginAt` |
| Created | ✅ | ✅ | `createdAt` |

### 5.2 Actions (per row)

| Action | Permission | UI |
|--------|-----------|-----|
| View Details | `user.read` | Eye icon → `/admin/users/[id]` |
| Edit | `user.manage` | Pencil icon → inline or modal |
| Assign Role | `user.manage` | Dropdown with checkboxes |
| Suspend | `user.manage` | Button with confirmation |
| Activate | `user.manage` | Button |
| Impersonate | `user.manage` | Button (SUPER_ADMIN only) |

### 5.3 Bulk Actions

- Select multiple users → Assign Role, Change Status, Delete

---

## 6. Partners Page (`/admin/partners`)

### 6.1 Data Table

| Column | Notes |
|--------|-------|
| Partner Code | `partnerCode` |
| Company Name | `companyName` |
| Contact | Linked `User.email` |
| Status | `PENDING`, `ACTIVE`, `SUSPENDED`, `TERMINATED` |
| Commission Rate | `commissionRate` |
| Bookings Count | Aggregate from `Booking` |
| Revenue | Sum of `Booking.totalAmount` |
| Joined | `joinedAt` |

### 6.2 Actions

| Action | Permission |
|--------|-----------|
| Approve | `partner.update` |
| Suspend | `partner.update` |
| View Payout Accounts | `partner.read` |
| View Bookings | `booking.read` |

---

## 7. Bookings Page (`/admin/bookings`)

### 7.1 Data Table

| Column | Notes |
|--------|-------|
| Reference | `bookingReference` |
| Experience | Via `Departure → Experience` |
| Partner | `PartnerProfile.companyName` |
| Guest | `Guest` info |
| Status | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| Payment Status | `PENDING`, `PAID`, `FAILED`, `REFUNDED` |
| Amount | `totalAmount` |
| Date | `createdAt` |
| Source | `PARTNER` or `DIRECT` |

### 7.2 Filters

- Status
- Payment Status
- Partner
- Date range
- Experience

---

## 8. Experiences Page (`/admin/experiences`)

### 8.1 Data Table

| Column | Notes |
|--------|-------|
| Name | `name` |
| Category | `TRANSPORT`, `LEISURE`, `ADVENTURE`, etc. |
| Price | `defaultPrice` |
| Status | `isActive` |
| Featured | `isFeatured` badge |
| Routes | Count of `ExperienceRoute` |
| Created | `createdAt` |

### 8.2 Actions

| Action | Permission |
|--------|-----------|
| Create New | `experience.create` |
| Edit | `experience.update` |
| Manage Routes | `experience.manage` |
| Toggle Active | `experience.manage` |
| Toggle Featured | `experience.manage` |

---

## 9. Rewards Page (`/admin/rewards`)

### 9.1 Transactions Table

| Column | Notes |
|--------|-------|
| ID | `id` |
| Booking | `bookingId` → reference |
| Partner | `PartnerProfile.companyName` |
| Rule | `RewardRule.name` |
| Points | `pointsEarned` |
| Cash Value | `cashValue` |
| Status | `PENDING`, `APPROVED`, `PAID_OUT`, `EXPIRED`, `REVERSED` |
| Created | `createdAt` |

### 9.2 Reward Rules Management

| Column | Notes |
|--------|-------|
| Name | `name` |
| Points per Booking | `pointsPerBooking` |
| Cash Multiplier | `cashMultiplier` |
| Active | `isActive` |
| Valid From | `effectiveFrom` |
| Valid To | `effectiveTo` |

---

## 10. User Detail Page (`/admin/users/[id]`)

### 10.1 Header
- Avatar, Name, Email, Phone
- Status badge
- Role pills with edit button
- Action buttons: Suspend, Activate, Send OTP

### 10.2 Tabs

| Tab | Content |
|-----|---------|
| **Profile** | User details form (editable) |
| **Roles** | Current roles, assign/remove roles |
| **Sessions** | Active sessions table with revoke button |
| **Auth Logs** | Recent login/OTP events from `AuthLog` |
| **Bookings** | User's bookings (if guest has bookings) |
| **Partner** | Linked partner profile (if any) |

---

## 11. API Routes Needed

### 11.1 Dashboard
- `GET /api/admin/dashboard` — KPIs + charts data + recent activity

### 11.2 Users
- `GET /api/admin/users` — list with filters, pagination
- `GET /api/admin/users/[id]` — detail with roles, sessions, logs
- `PATCH /api/admin/users/[id]` — update profile
- `POST /api/admin/users/[id]/roles` — assign role
- `DELETE /api/admin/users/[id]/roles` — remove role
- `POST /api/admin/users/[id]/suspend` — suspend user
- `POST /api/admin/users/[id]/activate` — activate user
- `DELETE /api/admin/users/[id]/sessions/[sessionId]` — revoke session

### 11.3 Partners
- `GET /api/admin/partners` — list with filters
- `GET /api/admin/partners/[id]` — detail with bookings, payouts
- `PATCH /api/admin/partners/[id]` — update (approve/suspend)
- `GET /api/admin/partners/[id]/payouts` — payout accounts

### 11.4 Bookings
- `GET /api/admin/bookings` — list with filters
- `GET /api/admin/bookings/[id]` — detail with guests, status history
- `PATCH /api/admin/bookings/[id]` — update status/notes

### 11.5 Experiences
- `GET /api/admin/experiences` — list
- `POST /api/admin/experiences` — create
- `GET /api/admin/experiences/[id]` — detail
- `PATCH /api/admin/experiences/[id]` — update
- `DELETE /api/admin/experiences/[id]` — delete (SUPER_ADMIN)
- `GET /api/admin/experiences/[id]/routes` — routes
- `POST /api/admin/experiences/[id]/routes` — add route

### 11.6 Rewards
- `GET /api/admin/rewards/transactions` — list
- `GET /api/admin/rewards/rules` — list
- `POST /api/admin/rewards/rules` — create rule
- `PATCH /api/admin/rewards/rules/[id]` — update rule

### 11.7 Audit
- `GET /api/admin/audit-logs` — `AuthLog` entries with filters

---

## 12. UI Component Library (to build)

| Component | Purpose |
|-----------|---------|
| `AdminShell` | Layout wrapper with sidebar + header |
| `Sidebar` | Navigation with permission-based visibility |
| `AdminHeader` | Breadcrumbs, search, notifications, admin menu |
| `DataTable` | Reusable sortable/filterable table |
| `StatusBadge` | Color-coded status pills |
| `RolePill` | Role display with colors |
| `KPICard` | Dashboard metric card with sparkline |
| `ChartCard` | Wrapper for Recharts/Chart.js |
| `ConfirmDialog` | Confirmation modal for destructive actions |
| `Toast` | Success/error notifications |
| `EmptyState` | When no data exists |
| `SkeletonLoader` | Loading states |
| `PermissionGuard` | Client-side permission check |
| `DateRangePicker` | For filtering by date |

---

## 13. Design Tokens (aligned with existing brand)

| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#1B3A5C` | Primary buttons, headers |
| Navy Deep | `#122A44` | Sidebar background |
| Gold | `#C9A227` | Accent, highlights, active states |
| Sea | `#4FA8C9` | Links, info |
| Paper | `#FBF9F4` | Page background |
| White | `#FFFFFF` | Cards, surfaces |
| Success | `oklch(0.60 0.18 145)` | Active/approved states |
| Warning | `oklch(0.75 0.18 75)` | Pending states |
| Error | `oklch(0.58 0.22 25)` | Suspended/error states |

---

## 14. Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 768px` | Sidebar collapses to bottom nav or hamburger drawer; cards stack single column; tables become horizontal scroll or card list |
| `768px - 1024px` | Sidebar is icon-only; 2-column grid for KPI cards |
| `> 1024px` | Full sidebar with labels; 3-4 column grid; full table view |

---

## 15. Implementation Sequence

1. **API layer first** — build all `/api/admin/*` routes with IAM middleware
2. **Shared admin components** — `DataTable`, `Sidebar`, `StatusBadge`, `KPICard`
3. **Dashboard page** — KPI cards + charts + recent activity
4. **Users module** — list + detail + role management
5. **Partners module** — list + detail + status management
6. **Bookings module** — list + detail
7. **Experiences module** — list + CRUD
8. **Rewards module** — transactions + rules
9. **Audit logs** — generic log viewer

---

## 16. Key Decisions to Make

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Charts library** | Recharts, Chart.js, ApexCharts | Recharts (React-native, lightweight) |
| **Table library** | TanStack Table, custom | TanStack Table v8 (headless, flexible) |
| **Form library** | React Hook Form + Zod | React Hook Form + Zod (already used) |
| **Date handling** | date-fns, dayjs | date-fns (already likely in deps) |
| **Server vs Client** | RSC + Server Actions, API routes | Hybrid: RSC for reads, Server Actions for mutations |
