---
name: mk-frontend-management
description: >-
  Architecture, conventions, component standards, routing, and API integration workflows for the MKHR Frontend application (React 19, Vite, Tailwind CSS v4, TypeScript).
  Use this skill whenever modifying frontend pages, adding UI modules, updating routes in main.tsx, binding backend APIs, or testing frontend end-to-end.
---

# MKHR Frontend — Application Skill & Development Standards

This skill defines the technical architecture, development standards, routing conventions, and integration workflows for **MKHR** — the modern React/Vite frontend for the **MK Admin ERP System**.

---

## 1. Project Overview & Identity

- **Application:** MKHR Frontend
- **Repository Path:** `C:\Projects\Meku\NextJs\ERP\mkhr`
- **Company:** Meku Trading PLC — Addis Ababa, Ethiopia
- **Author / Lead:** Makite Desta (`makite.desta@mekuhr.et`)
- **Core Stack:** React 19.x, TypeScript 5.9, Vite 5.x, Tailwind CSS v4, Radix UI primitives, Lucide Icons, TanStack React Table, Axios
- **Dev Server URL:** `http://localhost:5173`
- **Backend API URL:** `http://localhost:3000/api` (`VITE_API_BASE_URL` in `.env`)

---

## 2. Directory Structure & Architecture

```
mkhr/
├── src/
│   ├── auth/                        # Route protection & role guards
│   │   ├── simple-protected-route.tsx
│   │   └── protected-route.tsx
│   ├── components/                  # Shared UI components & design system
│   │   ├── login/login-form.tsx     # Authentication form
│   │   ├── ui/                      # Radix/Tailwind components (button, card, dialog, table, tabs, etc.)
│   │   └── placeholder-page.tsx
│   ├── layouts/
│   │   └── dashboard-layout.tsx     # App shell with dynamic sidebar, user header, and search
│   ├── lib/
│   │   ├── api.ts                   # Axios client, baseURL, interceptors, auth headers, token refresh
│   │   └── utils.ts                 # Styling utilities (cn helper)
│   ├── modules/
│   │   ├── system-admin/            # Admin Management Module
│   │   │   ├── dashboard/           # System admin metrics
│   │   │   ├── users/               # User management table & user-detail dialog
│   │   │   ├── role/                # Role CRUD & permissions assignment
│   │   │   ├── access/              # Granular RBAC & menu-role binding
│   │   │   ├── menu/                # Dynamic menu builder & ordering
│   │   │   ├── company-profile/     # Company profile, branding, logo upload
│   │   │   └── reports/             # Audit activity logs
│   │   └── hr/                      # HR Management Module
│   │       ├── dashboard/           # HR metrics & employee charts
│   │       ├── employees/           # Employee catalog, detail view, creation wizard
│   │       │   ├── tabs/            # Basic info, education, experience, language, docs
│   │       │   └── components/      # Actions dialogs (promotion, increment, termination, reinstate)
│   │       ├── actions-approval/    # Checker queue for HR actions
│   │       ├── settings/            # Departments, branches, positions, grades, scales, salary matrix, lookups, benefits
│   │       └── reports/             # HR summary reports & exports
│   ├── pages/                       # Standalone pages (login, profile, forgot-password, reset-password, 404)
│   ├── router/                      # Routing configuration & navigation helpers
│   │   ├── index.tsx                # routeConfig definition
│   │   └── navigation-config.tsx    # Static nav fallback & role filtering
│   ├── services/                    # Domain API service classes
│   │   ├── dashboard-service.ts     # Aggregated stats & activity feed
│   │   ├── navigation-service.ts    # Dynamic sidebar menu API calls
│   │   └── company-branding.ts      # Branding & logo persistence
│   ├── main.tsx                     # App bootstrap, router mounting, global providers
│   └── index.css                    # Global Tailwind CSS imports
├── test-frontend-e2e.js             # Automated E2E test suite (24/24 passing)
├── vite.config.ts                   # Vite configuration with @ path alias
├── tsconfig.json                    # TypeScript compiler options
└── package.json                     # Dependencies & scripts (dev, build, test:e2e)
```

---

## 3. Routing Conventions & Route Aliases (`src/main.tsx`)

The application mounts routes directly in `src/main.tsx` inside `<BrowserRouter>` wrapped with `<DashboardLayout />`.

### Crucial Rule for Menu Routes
To guarantee that clicking any dynamic database menu link never displays a 404 "Not Found", **both prefixed and unprefixed route aliases must always be registered** in `src/main.tsx`:

| Feature | Primary Path | Alias Paths | Component |
|---|---|---|---|
| **System Dashboard** | `/dashboard` | `/system-admin/dashboard`, `/system-admin` | `<SystemAdminDashboard />` |
| **Users** | `/users` | `/system-admin/users`, `/users/:id` | `<UsersPage />` / `<UserDetailPage />` |
| **Roles** | `/roles` | `/system-admin/roles` | `<RolesPage />` |
| **Menu Management** | `/menu` | `/system-admin/menu` | `<MenuManagementPage />` |
| **Access Management** | `/access` | `/system-admin/access` | `<AccessManagementPage />` |
| **Company Profile** | `/company-profile` | `/system-admin/company-profile` | `<CompanyProfilePage />` |
| **HR Dashboard** | `/hr/dashboard` | `/hr-admin/dashboard`, `/hr-admin` | `<HRDashboard />` |
| **HR Settings** | `/hr/settings` | `/hr-admin/settings`, `/settings` | `<HRSettingsPage />` |
| **Employees** | `/employees` | `/hr/employees`, `/employees/new`, `/employees/:id` | `<EmployeesPage />` / `<EmployeeAdminPage />` / `<EmployeeDetailPage />` |
| **Actions Approval** | `/actions-approval` | `/hr/actions-approval`, `/hr-actions` | `<HrActionsApprovalPage />` |
| **Reports** | `/reports` | `/hr/reports`, `/system-admin/reports/activities` | `<HRReportsPage />` / `<SystemAdminActivitiesReportPage />` |
| **My Profile** | `/profile` | `/my-profile`, `/self-service/profile` | `<MyProfilePage />` |

---

## 4. API Integration & Service Patterns

### A. HTTP Client (`src/lib/api.ts`)
- Always import the configured API client:
  ```typescript
  import api from "@/lib/api";
  ```
- **Automatic Interceptor:** `api.interceptors.response` returns `response.data`.
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "...",
    "data": { ... },
    "timestamp": "..."
  }
  ```
- When unwrapping in services, safely access `res.data` or fallback to root:
  ```typescript
  const items = res?.data?.items ?? res?.items ?? [];
  ```

### B. Required Lookups
The frontend expects the following lookup types seeded in the backend:
- `TITLE`, `GENDER`, `MARITAL_STATUS`, `COUNTRY` (with Ethiopia `ET`), `EMPLOYMENT_TYPE`, and `TERMINATION_REASON`.

### C. Maker-Checker HR Workflow
- Creating an employee (`POST /api/employees`) initiates a `PENDING` record.
- Checker activates via `PUT /api/employees/:id/approve`.
- HR promotions, increments, terminations, and reinstatements are submitted via `POST /api/employees/:id/actions/:type` and approved via `PUT /api/hr-actions/:id/approve`.

---

## 5. Localization & Ethiopian ERP Standards

Always maintain Ethiopian business context across all frontend screens and forms:
- **Names:** Ethiopian names (e.g., Makite Desta, Biruk Tesfaye, Selamawit Hailu).
- **Amharic Script:** Display and accept Amharic fields (`fullNameAm`, labels).
- **Currency:** Ethiopian Birr (`ETB`) with comma formatting (`ETB 24,000.00`).
- **Date Inputs:** Support both Gregorian date pickers and Ethiopian calendar text inputs (`1994/08/20` Grg vs `1986/12/14` Eth).

---

## 6. End-to-End Testing & Verification

Run the automated frontend test suite anytime to verify server availability, CORS headers, routing alignment, lookups, and all domain contracts:

```bash
cd C:\Projects\Meku\NextJs\ERP\mkhr
npm run test:e2e
```

To verify production TypeScript compilation:
```bash
npm run build
```
