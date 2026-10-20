# MKHR Frontend — Workspace Agent Instructions

This repository contains the enterprise frontend for **MKHR** (React 19, TypeScript 5.9, Vite 5, Tailwind CSS v4), connecting to the **MK Admin ERP System** backend API (`http://localhost:3000/api`).

---

## Core Guidelines & Policies

1. **Architecture & Routing (`src/main.tsx`)**:
   - Always register both prefixed and unprefixed aliases for every route (e.g., `/users` and `/system-admin/users`, `/employees` and `/hr/employees`) to maintain 100% parity with dynamic menu links stored in the database.
   - Guard all internal routes using `<SimpleProtectedRoute>` wrapped in `<DashboardLayout />`.

2. **API Client & Networking (`src/lib/api.ts`)**:
   - Always use the shared `api` client (`import api from "@/lib/api"`).
   - Preserve the automatic response unwrapping and silent `401` refresh token retry mechanism.

3. **Maker-Checker Workflows**:
   - Enforce the Maker-Checker two-person rule for employee records and HR actions (Promotion, Salary Increment, Termination, Reinstatement).
   - Gate sub-entity tabs (Education, Experience, Languages, Documents) on `APPROVED` status.

4. **Design System & Aesthetics**:
   - Use Tailwind CSS v4 design tokens and Radix UI primitives located in `src/components/ui`.
   - Maintain consistent status colors: Emerald (Approved/Active), Amber (Pending/Draft), Rose (Rejected/Terminated), Slate (Inactive).
   - Use Sonner for feedback toasts and inline validation for form fields.

5. **Ethiopian ERP Context**:
   - Support Amharic script (`fullNameAm`), Ethiopian Birr (`ETB`) currency formatting, and dual Ethiopian/Gregorian dates.

6. **Validation & Verification**:
   - Run `npm run test:e2e` and `npm run build` to verify changes against contracts and TypeScript compilation.

For full technical specifications, consult:
- **Skill:** [mk-frontend-management](file:///.agents/skills/mk-frontend-management/SKILL.md)
- **Rules:** [frontend-rules.md](file:///.agents/rules/frontend-rules.md)
