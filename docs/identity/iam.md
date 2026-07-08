Core IAM Principles
When instructing your AI, prioritize these fundamental philosophies to ensure a secure and resilient architecture:
The Three Pillars: Your IAM module must answer three questions: Authentication (Who are you?), Authorization (What can you do?), and Accountability (Are you following the rules/Audit trails)
.
Claim-Based Access Control: Instead of individual apps managing their own auth logic, use a Central Identity Provider (IdP) model
. The IdP verifies identity and issues claims (structured information like user ID or roles) that your apps/api and apps/web can trust
.
Strong Consistency: For security-critical actions like revoking access or resetting passwords, you must avoid "eventual consistency"
. Decisions should be based on the exact and current state of the system to prevent windows of vulnerability
.
Separation of Concerns: Maintain your IAM logic separately from your core business apps
. This allows your applications to evolve independently while enabling multiple apps to use the same IAM solution
.
Design Specifications for Your Stack
Given your monorepo structure, these specifications should be implemented across your specific packages:
1. Data Modeling (packages/database/prisma)
User & Token Models: Implement a one-to-many relationship where a User can have multiple Tokens
.
Field Flexibility: Make non-essential fields (like names) optional to allow for streamlined signup flows (e.g., email-only registration)
.
Stateful Sessions: Since you are using Redis, consider a stateful JWT approach
. Store the tokenId in the JWT payload and reference a session in the database or Redis, allowing for instant token revocation
.
2. Authentication Flow (apps/api)
Two-Step Passwordless Flow:
Login: User provides an email; the API generates a short-lived numerical token (e.g., 8 digits) and saves it to the Token table
.
Authenticate: User submits the email token; the API validates it, generates a long-lived JWT (e.g., 12 hours), and returns it in the Authorization header
.
Multi-Factor Authentication (MFA): Treat MFA as the modern standard
. Require a second factor, such as a biometric scan or a code from an authenticator app, to protect against compromised passwords
.
3. Authorization Logic (packages/shared or apps/api)
Hybrid Model (RBAC + ABAC):
Use Role-Based Access Control (RBAC) for broad permissions (e.g., isAdmin)
.
Use Attribute-Based Access Control (ABAC) or resource-based logic for granular permissions (e.g., "is this user the owner of this specific resource?")
.
Pre-Handler Checks: Implement authorization as "pre-functions" or middleware that run before your route handlers
. This allows you to reject unauthorized requests before any business logic executes
.
Best Practices for Implementation
Infrastructure Resilience: Design for high availability and scalability so that IAM services do not become a bottleneck or a single point of failure
.
Secure Password Storage: If you do not use passwordless flows, never store passwords in clear text
. Use strong hashing functions to store a one-way representation of the password
.
Automated Lifecycle Management: Automate the onboarding and offboarding of users
. Ensuring that a user’s access is revoked instantly across all systems upon termination is critical for security
.
User Experience (UX): For customer-facing modules, focus on self-service (password resets, account creation) and Social Auth (signing in with Google/LinkedIn) to reduce friction and admin workload
.