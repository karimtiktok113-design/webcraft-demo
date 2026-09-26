# WebCraft Goods Demo Showcase Portal — Security Specification

## 1. Data Invariants

1. **Identity & Role Lock**: Only users with verified admin privileges (`karimfiverr20@gmail.com` or presence in `/admins/{uid}`) can create/modify client permissions, change `demoDurationMinutes`, approve time extension requests, or modify global settings.
2. **Client Self-Immutability**: A client may NEVER update their own `status`, `role`, `demoDurationMinutes`, `allowedProductIds`, or timer values.
3. **Session Expiration Enforceability**: Demo sessions have an authoritative `expiresAt` calculated as `startedAt + (durationMinutes * 60 * 1000)`. Once expired (`currentTime >= expiresAt`), access to demo execution is blocked.
4. **Product Access Partitioning**: A client may only view/launch products whose `id` exists in their `allowedProductIds` or if `allowedProductIds` contains `'*'`.
5. **Auditing Immortality**: Activity logs are append-only. No user can delete or update existing audit logs.
6. **Isolated Demo Execution**: Protected HTML applications run in isolated, sandboxed iframes. Client localStorage keys are strictly namespaced per client and product (`wc_demo_${clientId}_${productId}_*`).

---

## 2. The "Dirty Dozen" Payloads (Vulnerability Test Scenarios)

1. **Payload 1 (Privilege Escalation)**: Unprivileged client writes `{ role: 'admin' }` to their `/clients/{uid}` document. Expected: `PERMISSION_DENIED`.
2. **Payload 2 (Ghost Field Attack)**: Unprivileged client adds `{ isMasterAdmin: true, bonusTime: 99999 }` to their profile during preference update. Expected: `PERMISSION_DENIED`.
3. **Payload 3 (Timer Extension Hijack)**: Expired client writes `{ expiresAt: 9999999999999, status: 'active' }` to `/demoSessions/{uid}`. Expected: `PERMISSION_DENIED`.
4. **Payload 4 (Product Permission Tampering)**: Client writes `{ allowedProductIds: ['*'] }` to grant themselves full library access. Expected: `PERMISSION_DENIED`.
5. **Payload 5 (Audit Log Truncation)**: Client or malicious actor sends `deleteDoc(/activityLogs/{logId})`. Expected: `PERMISSION_DENIED`.
6. **Payload 6 (PII Harvesting Attack)**: Unauthenticated visitor or Client A queries `/clients/{clientB_id}` or lists all clients. Expected: `PERMISSION_DENIED`.
7. **Payload 7 (Unpublished Product Leak)**: Client queries `/products` where `isPublished == false`. Expected: `PERMISSION_DENIED`.
8. **Payload 8 (Malformed Data Flooding)**: Client attempts to push 2MB junk text into `message` in `/accessRequests`. Expected: `PERMISSION_DENIED` (exceeds 2048 chars).
9. **Payload 9 (ID Poisoning Attack)**: Client creates an access request with invalid ID `req/../../root`. Expected: `PERMISSION_DENIED` (fails `isValidId`).
10. **Payload 10 (Impersonated Access Request)**: Client A submits access request with `clientId: 'client_B_uid'`. Expected: `PERMISSION_DENIED`.
11. **Payload 11 (Settings Vandalism)**: Unauthenticated or non-admin user updates `/adminSettings/global`. Expected: `PERMISSION_DENIED`.
12. **Payload 12 (Self-Approval Exploitation)**: Client submits update to `/accessRequests/{id}` setting `status: 'approved'`. Expected: `PERMISSION_DENIED`.

---

## 3. Security Test Runner Specifications

The Firestore security rules enforce:
- Administrative role check: `isSignedIn() && (request.auth.token.email == 'karimfiverr20@gmail.com' || exists(/databases/$(database)/documents/admins/$(request.auth.uid)))`
- Default-deny catch-all rule: `match /{document=**} { allow read, write: if false; }`
- Client read-only access to their own profile, published products, their own demo session, and their own access requests.
- Admin full management access to all collections.
