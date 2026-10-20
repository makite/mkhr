# MKHR Frontend — Development & Engineering Rules

These rules govern all architectural, component, styling, and integration modifications within the **MKHR Frontend** application.

---

## 1. Routing & Dynamic Menu Alignment (`src/main.tsx`)

1. **Mandatory Route Aliasing**:
   - Because menu items in the database (`GET /api/navigation`) can be stored with or without domain prefixes, **every route must support both prefixed and unprefixed aliases** in [`src/main.tsx`](file:///c:/Projects/Meku/NextJs/ERP/mkhr/src/main.tsx).
   - Examples:
     - `/users` AND `/system-admin/users`
     - `/roles` AND `/system-admin/roles`
     - `/employees` AND `/hr/employees`
     - `/settings` AND `/hr/settings` AND `/hr-admin/settings`
     - `/actions-approval` AND `/hr/actions-approval` AND `/hr-actions`
2. **Dynamic Route Coverage**:
   - When introducing a new page or tab, immediately register both aliases in [`src/main.tsx`](file:///c:/Projects/Meku/NextJs/ERP/mkhr/src/main.tsx) and add it to [`src/router/navigation-config.tsx`](file:///c:/Projects/Meku/NextJs/ERP/mkhr/src/router/navigation-config.tsx) as a fallback.
3. **Route Guards**:
   - All internal pages must be mounted inside `<SimpleProtectedRoute>` wrapped with `<DashboardLayout />`.
   - Public auth pages (`/`, `/auth/login`, `/forgot-password`, `/reset-password`) must remain outside the dashboard layout shell.

---

## 2. API Communication & Data Handling (`src/lib/api.ts`)

1. **Client Singleton**:
   - Always import and use the central client: `import api from "@/lib/api";`.
   - Never instantiate raw `fetch` or direct `axios` instances inside UI components.
2. **Response Envelope Unwrapping**:
   - The backend API responds with an envelope: `{ success: boolean, data?: any, message?: string }`.
   - When consuming responses in services or components, use safe optional chaining with fallback:
     ```typescript
     const list = res?.data?.items ?? res?.items ?? [];
     ```
3. **Token Management & Auth Interceptor**:
   - Never remove or bypass the `401` interceptor in [`src/lib/api.ts`](file:///c:/Projects/Meku/NextJs/ERP/mkhr/src/lib/api.ts). It automatically executes silent refresh via `/auth/refresh-token` and retries the original request.
   - On unrecoverable authentication errors (`401`/`403`), the interceptor clears local storage and routes the user to `/` with an alert.

---

## 3. Maker-Checker & HR Workflow Integrity

1. **Two-Person Rule (Maker-Checker)**:
   - Creating an employee sets status to `PENDING`.
   - Sub-entity tabs (Education, Experience, Languages, Documents) are gated on the backend by `requireApprovedEmployee`. The UI must clearly reflect this gate to users before approval.
   - Approvals and rejections (`PUT /api/employees/:id/approve`, `PUT /api/employees/:id/reject`) require appropriate checker roles (`HR_MANAGER`, `ADMIN`, `SUPER_ADMIN`).
2. **HR Action Pipeline**:
   - Promotion, Salary Increment, Termination, and Reinstatement are distinct action types submitted to `/api/employees/:id/actions/:type`.
   - All action approvals and rejections must flow through the central checker queue (`/actions-approval` $\rightarrow$ `/api/hr-actions`).
   - Destructive actions (termination, rejection) must always require user confirmation and a mandatory reason.

---

## 4. UI / UX Design & Component Standards

1. **Design System**:
   - Use Tailwind CSS v4 tokens and existing components from [`src/components/ui/`](file:///c:/Projects/Meku/NextJs/ERP/mkhr/src/components/ui/).
   - Do not write inline styles or ad-hoc custom CSS classes when existing Radix UI primitives exist.
2. **Enterprise Color & Status Consistency**:
   - Always map status badges consistently across all tables and cards:
     - `APPROVED` / `ACTIVE`: Emerald green (`bg-emerald-50 text-emerald-700 border-emerald-200`)
     - `PENDING` / `DRAFT`: Amber orange (`bg-amber-50 text-amber-700 border-amber-200`)
     - `REJECTED` / `TERMINATED`: Rose red (`bg-rose-50 text-rose-700 border-rose-200`)
     - `INACTIVE`: Neutral slate (`bg-slate-100 text-slate-600 border-slate-200`)
3. **Feedback & Notifications**:
   - Use Sonner (`toast.success`, `toast.error`, `toast.info`) for operation outcomes.
   - Forms must display inline field errors; never rely solely on toasts for missing form inputs.
   - Always display loading states (skeletons or disabled button spinners) during asynchronous operations.

---

## 5. Localization & Ethiopian Business Context

1. **Bilingual Identity**:
   - Employee forms and profiles must support and display Amharic Ge'ez script alongside English (`fullNameAm`).
2. **Currency Standards**:
   - Currency amounts must be rendered with `ETB` code and proper thousand separators (e.g., `ETB 18,500.00`).
3. **Date Formats**:
   - Use `date-fns` with format `yyyy-MM-dd` when sending dates to backend endpoints.
   - Dual calendar support: display Gregorian dates alongside Ethiopian calendar references where relevant.

---

## 6. Testing & Quality Verification

Before declaring any frontend change complete:
1. Run the automated 7-phase E2E test suite:
   ```bash
   npm run test:e2e
   ```
2. Run TypeScript compilation to ensure zero type errors:
   ```bash
   npm run build
   ```

---

## 7. State Management & TanStack Query (`@tanstack/react-query`)

1. **Centralized Query Keys**:
   - Always define and consume query keys from [`src/lib/query-keys.ts`](file:///c:/Projects/Meku/NextJs/ERP/mkhr/src/lib/query-keys.ts) to guarantee consistent caching across routes and modals.
2. **Cache Policies & Background Sync**:
   - Apply `CACHE_POLICIES.STATIC_LOOKUPS` for dropdowns (`TITLE`, `GENDER`, etc.): 10m stale time + 10m background refresh interval.
   - Apply `CACHE_POLICIES.ORGANIZATION_DATA` for departments, branches, scales, and salary matrix: 5m stale time + 5m background sync.
   - Apply `CACHE_POLICIES.DASHBOARD_DATA` for executive metrics: 1m stale time + 2m auto-polling.
3. **Mutation Invalidation**:
   - After mutations (creating/approving employees, updating organization trees, adding lookups), use [`useInvalidateQueries()`](file:///c:/Projects/Meku/NextJs/ERP/mkhr/src/hooks/use-queries.ts) to purge stale cache and automatically refresh data.
