---
name: mk-frontend-management
description: >-
  Architecture, conventions, component standards, routing, and API integration workflows for the MKHR Frontend application (React 19, Vite, Tailwind CSS v4, TypeScript).
  Use this skill whenever modifying frontend pages, adding UI modules, updating routes in main.tsx, binding backend APIs, or testing frontend end-to-end.
---

# MKHR Frontend — Architecture, Standards & Engineering Playbook

This skill defines the technical architecture, development standards, routing conventions, UI component guidelines, and API integration workflows for **MKHR** — the modern React/Vite enterprise frontend for the **MK Admin ERP System**.

---

## 1. Project Overview & Tech Stack

- **Application:** MKHR Frontend (Enterprise HR & System Administration ERP)
- **Repository Path:** `c:\Projects\Meku\NextJs\ERP\mkhr`
- **Backend API Path:** `c:\Projects\Meku\NextJs\ERP\mk-admin-system` (`http://localhost:3000/api`)
- **Dev Server URL:** `http://localhost:5173`
- **Company Context:** Meku Trading PLC — Addis Ababa, Ethiopia
- **Author / Lead:** Makite Desta (`makite.desta@mekuhr.et`)
- **Core Stack:**
  - **Runtime & Build:** React 19.x, TypeScript 5.9, Vite 5.x
  - **Styling:** Tailwind CSS v4 (`@import "tailwindcss";` in `src/index.css`), Radix UI primitives, Lucide React icons
  - **Data Grids:** TanStack React Table v8 (sorting, filtering, pagination)
  - **HTTP & Networking:** Axios with custom interceptors, silent token refresh, and cookie support
  - **Notifications:** Sonner rich toast notifications (`position="top-right"`, `richColors`)
  - **Date Utilities:** `date-fns` (standardized `yyyy-MM-dd` formatting)

---

## 2. Directory Structure & Module Breakdown

```
mkhr/
├── src/
│   ├── auth/                        # Route protection & role guards
│   │   ├── simple-protected-route.tsx   # Token-based route guard
│   │   └── protected-route.tsx          # Role-based route guard
│   ├── components/                  # Shared UI components & design system
│   │   ├── login/login-form.tsx     # Enterprise authentication form with remember-me
│   │   ├── ui/                      # 30+ Radix UI / Tailwind v4 components (button, card, dialog, table, tabs, sheet, sidebar, etc.)
│   │   └── placeholder-page.tsx     # Graceful fallback for in-progress modules
│   ├── layouts/
│   │   └── dashboard-layout.tsx     # App shell with dynamic sidebar, user profile header, search, and collapse toggle
│   ├── lib/
│   │   ├── api.ts                   # Axios singleton, auto-refresh interceptors, auth headers, error normalization
│   │   └── utils.ts                 # Styling utilities (cn helper wrapping clsx + tailwind-merge)
│   ├── modules/
│   │   ├── system-admin/            # System Administration Domain
│   │   │   ├── dashboard/           # System admin metrics, user counts, system status
│   │   │   ├── users/               # User table, toggle active, toggle lock, reset password, user-detail modal
│   │   │   ├── role/                # Role CRUD & granular permission assignment
│   │   │   ├── access/              # Granular RBAC matrix & dynamic role-menu binding
│   │   │   ├── menu/                # Dynamic menu builder, ordering, nesting, icon configuration
│   │   │   ├── company-profile/     # Company profile, branding, logo & favicon upload/sync
│   │   │   └── reports/             # System audit activity logs with user/action filtering
│   │   └── hr/                      # Human Resources Domain
│   │       ├── dashboard/           # HR metrics, headcount charts, gender/department distribution
│   │       ├── employees/           # Employee catalog, creation wizard, detail view, edit page
│   │       │   ├── components/      # EmployeeAdmin form, EmployeeDetailPage, EmployeePreview, action dialogs
│   │       │   ├── schema/          # Zod validation schema (employeeSchema.ts)
│   │       │   ├── services/        # employeeService.ts (CRUD, lookups, org data, salary matrix sync)
│   │       │   └── tabs/            # Sub-entity tabs: education, experience, language, documents
│   │       ├── actions-approval/    # Checker queue for HR actions (Promotion, Increment, Termination, Reinstate)
│   │       ├── settings/            # HR Master settings with tabbed management:
│   │       │   └── tabs/            # departments, branches, positions, grades, scales, salary-matrix, lookup-types, lookup-values, benefits
│   │       └── reports/             # HR summary reports & data export views
│   ├── pages/                       # Top-level route pages (login, profile, forgot-password, reset-password, 404)
│   ├── router/                      # Routing configuration & navigation helpers
│   │   ├── index.tsx                # routeConfig definitions
│   │   ├── navigate-setter.tsx      # Global navigate reference injector for Axios interceptor
│   │   └── navigation-config.tsx    # Static nav fallback & role-based filtering
│   ├── services/                    # Domain API service modules
│   │   ├── dashboard-service.ts     # Aggregated stats & activity feed
│   │   ├── navigation-service.ts    # Dynamic sidebar menu API calls
│   │   └── company-branding.ts      # Branding, favicon & logo persistence
│   ├── main.tsx                     # App bootstrap, router mounting, global providers
│   └── index.css                    # Tailwind CSS v4 entry point & design tokens
├── test-frontend-e2e.js             # Automated 7-phase E2E test suite
├── vite.config.ts                   # Vite configuration with @ path alias to ./src
├── tsconfig.json                    # TypeScript compiler options (strict, ESNext)
└── package.json                     # Dependencies & scripts (dev, build, test:e2e)
```

---

## 3. Strict Routing & Route Alias Conventions (`src/main.tsx`)

Routes are registered inside `<BrowserRouter>` in [`src/main.tsx`](file:///c:/Projects/Meku/NextJs/ERP/mkhr/src/main.tsx) wrapped with `<SimpleProtectedRoute>` and `<DashboardLayout />`.

### Mandatory Menu Alias Rule
Because menu links in the database (`GET /api/navigation`) can be stored with or without domain prefixes, **every route must support both prefixed and unprefixed aliases** to guarantee zero 404 errors:

| Feature / Domain | Primary Path | Alias Paths | Component |
|---|---|---|---|
| **System Dashboard** | `/dashboard` | `/system-admin/dashboard`, `/system-admin` | `<SystemAdminDashboard />` |
| **Users** | `/users` | `/system-admin/users`, `/users/:id`, `/system-admin/users/:id` | `<UsersPage />` / `<UserDetailPage />` |
| **Roles** | `/roles` | `/system-admin/roles` | `<RolesPage />` |
| **Menu Management** | `/menu` | `/system-admin/menu` | `<MenuManagementPage />` |
| **Access Management** | `/access` | `/system-admin/access` | `<AccessManagementPage />` |
| **Company Profile** | `/company-profile` | `/system-admin/company-profile` | `<CompanyProfilePage />` |
| **Audit Activity Reports** | `/system-admin/reports/activities` | `/system-admin/reports` | `<SystemAdminActivitiesReportPage />` |
| **HR Dashboard** | `/hr/dashboard` | `/hr-admin/dashboard`, `/hr-admin` | `<HRDashboard />` |
| **HR Settings** | `/hr/settings` | `/hr-admin/settings`, `/settings` | `<HRSettingsPage />` |
| **Employees Catalog** | `/employees` | `/hr/employees` | `<EmployeesPage />` |
| **Employee Creation** | `/employees/new` | `/hr/employees/new` | `<EmployeeAdminPage />` |
| **Employee Detail View**| `/employees/:id` | `/hr/employees/:id` | `<EmployeeDetailPage />` |
| **Employee Edit View**  | `/employees/:id/edit`| `/hr/employees/:id/edit` | `<EmployeeAdminPage />` |
| **Actions Approval Queue**| `/actions-approval` | `/hr/actions-approval`, `/hr-actions` | `<HrActionsApprovalPage />` |
| **HR Reports** | `/reports` | `/hr/reports` | `<HRReportsPage />` |
| **User Profile** | `/profile` | `/my-profile`, `/self-service/profile` | `<MyProfilePage />` |
| **Public Auth Pages** | `/`, `/auth/login`, `/forgot-password`, `/reset-password` | N/A | `<LoginPage />`, `<ForgotPasswordPage />`, `<ResetPasswordPage />` |

---

## 4. API Client & Silent Token Refresh Architecture (`src/lib/api.ts`)

- **Always import the configured Axios client:**
  ```typescript
  import api from "@/lib/api";
  ```
- **Automatic Interceptor Behavior:**
  - Injects `Authorization: Bearer <token>` from `localStorage` on outgoing requests.
  - Automatically unwraps `response.data` in the success interceptor.
  - Handles `401 Unauthorized` by attempting a silent token refresh via `POST /auth/refresh-token` (using HTTP-only cookie). If successful, updates the token in `localStorage` and automatically replays the original request.
  - If refresh fails or a `403` occurs, clears session keys (`token`, `user`), triggers `toast.error("session out! please login again")`, and redirects to `/` via [`setNavigate`](file:///c:/Projects/Meku/NextJs/ERP/mkhr/src/router/navigate-setter.tsx).

---

## 5. Maker-Checker Enterprise Workflow

The ERP enforces segregation of duties (two-person rule) for critical operations:

### A. Employee Lifecycle
1. **Maker (HR Specialist / Admin):**
   - Submits `POST /api/employees` via [`employeeService.createEmployee()`](file:///c:/Projects/Meku/NextJs/ERP/mkhr/src/modules/hr/employees/services/employee-service.ts).
   - Generates an employee with initial status `requestStatus = "PENDING"`.
   - Edits are permitted only while `requestStatus` is `PENDING` or `DRAFT`.
2. **Checker (HR Manager / Admin):**
   - Reviews pending employees in the Actions Approval queue or Employee Detail page.
   - Approves via `PUT /api/employees/:id/approve` (sets `requestStatus = "APPROVED"`).
   - Rejects via `PUT /api/employees/:id/reject` with mandatory rejection reason.
3. **Sub-Entity Gate (`requireApprovedEmployee`):**
   - Backend blocks sub-entities (education, experience, documents, languages) until the employee is `APPROVED` and not `TERMINATED`.

### B. HR Actions Lifecycle (`/api/hr-actions`)
1. **Action Requests (Maker):**
   - Promotion: `POST /api/employees/:id/actions/promotion`
   - Salary Increment: `POST /api/employees/:id/actions/salary-increment`
   - Termination: `POST /api/employees/:id/actions/termination`
   - Reinstatement: `POST /api/employees/:id/actions/reinstate`
2. **Approval Queue (Checker):**
   - Queue listed via `GET /api/hr-actions?status=PENDING`.
   - Approved via `PUT /api/hr-actions/:actionId/approve`.
   - Rejected via `PUT /api/hr-actions/:actionId/reject`.

---

## 6. HR Master Settings & Organization Matrix

The HR Settings module ([`src/modules/hr/settings/page.tsx`](file:///c:/Projects/Meku/NextJs/ERP/mkhr/src/modules/hr/settings/page.tsx)) manages 8 distinct enterprise configuration domains:

1. **Departments Tab:** Hierarchical organization tree (`/api/departments/tree`) and parent-child assignment.
2. **Branches Tab:** Physical office branches (`/api/branches/tree`).
3. **Positions Tab:** Job titles and position catalog (`/api/positions`).
4. **Grades Tab:** Salary grade levels (`/api/grades`).
5. **Scales Tab:** Salary scales/steps (`/api/scales`).
6. **Salary Matrix Tab:** 2D interactive grid mapping Scales $\times$ Grades with step values (`/api/salary-matrix/full`).
7. **Lookups Tabs:** System lookup types (`/api/lookups/types`) and dynamic values (`TITLE`, `GENDER`, `MARITAL_STATUS`, `COUNTRY`, `EMPLOYMENT_TYPE`, `TERMINATION_REASON`).
8. **Benefits Tab:** Benefits catalog (`/api/benefits/types`) and employee benefit assignments (`/api/benefits/assignments`).

---

## 7. UI / UX Design & Component Standards

1. **Enterprise Aesthetics:**
   - Slate / Indigo / Emerald color palette tailored for executive ERP applications.
   - Status badge styling must follow standard status tokens:
     - `APPROVED` / `ACTIVE`: Emerald green (`bg-emerald-50 text-emerald-700 border-emerald-200`)
     - `PENDING` / `DRAFT`: Amber orange (`bg-amber-50 text-amber-700 border-amber-200`)
     - `REJECTED` / `TERMINATED`: Rose red (`bg-rose-50 text-rose-700 border-rose-200`)
     - `INACTIVE`: Neutral slate (`bg-slate-100 text-slate-600 border-slate-200`)
2. **Forms & Validations:**
   - Implement client-side validation using Zod and React Hook Form where applicable.
   - Display field-level validation errors inline; use Sonner toasts only for request-level outcomes.
   - Disable submit buttons and show loading spinners during async mutations.
3. **Responsive Navigation:**
   - Dynamic navigation must collapse smoothly on desktop and adapt into a sliding drawer on mobile.
   - Preserve sidebar active state according to current URL pathname.

---

## 8. Localization & Ethiopian ERP Standards

- **Ge'ez / Amharic Support:** Ensure dual name fields (`fullName` in English, `fullNameAm` in Amharic script).
- **Currency Display:** Format all financial amounts with currency code `ETB` and comma grouping (e.g., `ETB 24,500.00`).
- **Date Handling:**
  - Store dates in ISO format (`yyyy-MM-dd`).
  - Support both Gregorian date pickers and Ethiopian calendar text inputs.

---

## 9. Verification & Quality Assurance

Before completing any frontend task, run the full validation suite:

```bash
# 1. Run Automated 7-Phase E2E Alignment Suite
npm run test:e2e

# 2. Verify TypeScript Compilation & Production Build
npm run build
```
