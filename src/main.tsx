import { StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "sonner";
import SimpleProtectedRoute from "./auth/simple-protected-route";
import UserDetailPage from "./modules/system-admin/users/user-detail";
import NavigateSetter from "./router/navigate-setter";
import { applyCompanyBranding } from "./services/company-branding";

// Lazy loaded components
const DashboardLayout = lazy(() => import("./layouts/dashboard-layout"));
const LoginPage = lazy(() => import("./pages/login-page"));
const NotFound = lazy(() => import("./pages/not-found-page"));
const MyProfilePage = lazy(() => import("./pages/my-profile-page"));
const ForgotPasswordPage = lazy(() => import("./pages/forgot-password-page"));
const ResetPasswordPage = lazy(() => import("./pages/reset-password-page"));

// System Admin
const SystemAdminDashboard = lazy(
  () => import("./modules/system-admin/dashboard/page"),
);
const UsersPage = lazy(() => import("./modules/system-admin/users/page"));
const RolesPage = lazy(() => import("./modules/system-admin/role/page"));
const MenuManagementPage = lazy(
  () => import("./modules/system-admin/menu/page"),
);
const AccessManagementPage = lazy(
  () => import("./modules/system-admin/access/page"),
);
const CompanyProfilePage = lazy(
  () => import("./modules/system-admin/company-profile/page"),
);
const SystemAdminActivitiesReportPage = lazy(
  () => import("./modules/system-admin/reports/activities-page"),
);

// HR Admin
const HRDashboard = lazy(() => import("./modules/hr/dashboard/page"));
const EmployeesPage = lazy(() => import("./modules/hr/employees/page"));
const EmployeeDetailPage = lazy(
  () => import("./modules/hr/employees/components/employee-detail-page"),
);
const EmployeeAdminPage = lazy(
  () => import("./modules/hr/employees/components/employee-admin"),
);
const HRSettingsPage = lazy(() => import("./modules/hr/settings/page"));
const HrActionsApprovalPage = lazy(
  () => import("./modules/hr/actions-approval/page"),
);
const HRReportsPage = lazy(() => import("./modules/hr/reports/page"));
const UniversalImportPage = lazy(() => import("./modules/hr/import/page"));
const ProjectsGrantsPage = lazy(() => import("./modules/hr/projects/page"));

// Placeholder for missing modules
const PlaceholderPage = lazy(() => import("./components/placeholder-page"));

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";

// Apply branding/logo early (non-blocking). Defaults remain if API missing.
void applyCompanyBranding();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <NavigateSetter />
      <Toaster
        richColors
        position="top-right"
        closeButton
        expand={true}
        duration={4000}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes with layout */}
        <Route
          path="/"
          element={
            <SimpleProtectedRoute>
              <DashboardLayout />
            </SimpleProtectedRoute>
          }
        >
          {/* System Admin Dashboard & Aliases */}
          <Route path="dashboard" element={<SystemAdminDashboard />} />
          <Route path="/dashboard" element={<SystemAdminDashboard />} />
          <Route path="system-admin" element={<SystemAdminDashboard />} />
          <Route path="/system-admin" element={<SystemAdminDashboard />} />
          <Route
            path="system-admin/dashboard"
            element={<SystemAdminDashboard />}
          />
          <Route
            path="/system-admin/dashboard"
            element={<SystemAdminDashboard />}
          />

          {/* Users Management & Aliases */}
          <Route path="users" element={<UsersPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="system-admin/users" element={<UsersPage />} />
          <Route path="/system-admin/users" element={<UsersPage />} />
          <Route path="system-admin/users/:id" element={<UserDetailPage />} />
          <Route path="/system-admin/users/:id" element={<UserDetailPage />} />

          {/* Roles Management & Aliases */}
          <Route path="roles" element={<RolesPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="system-admin/roles" element={<RolesPage />} />
          <Route path="/system-admin/roles" element={<RolesPage />} />

          {/* Menu Management & Aliases */}
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="/menu" element={<MenuManagementPage />} />
          <Route path="system-admin/menu" element={<MenuManagementPage />} />
          <Route path="/system-admin/menu" element={<MenuManagementPage />} />

          {/* Access Management & Aliases */}
          <Route path="access" element={<AccessManagementPage />} />
          <Route path="/access" element={<AccessManagementPage />} />
          <Route
            path="system-admin/access"
            element={<AccessManagementPage />}
          />
          <Route
            path="/system-admin/access"
            element={<AccessManagementPage />}
          />

          {/* Company Profile & Aliases */}
          <Route path="company-profile" element={<CompanyProfilePage />} />
          <Route path="/company-profile" element={<CompanyProfilePage />} />
          <Route
            path="system-admin/company-profile"
            element={<CompanyProfilePage />}
          />
          <Route
            path="/system-admin/company-profile"
            element={<CompanyProfilePage />}
          />

          {/* Reports Activities */}
          <Route
            path="system-admin/reports/activities"
            element={<SystemAdminActivitiesReportPage />}
          />
          <Route
            path="/system-admin/reports/activities"
            element={<SystemAdminActivitiesReportPage />}
          />

          {/* Placeholders */}
          <Route path="system-admin/branches" element={<PlaceholderPage />} />
          <Route path="/system-admin/branches" element={<PlaceholderPage />} />
          <Route
            path="system-admin/fiscal-years"
            element={<PlaceholderPage />}
          />
          <Route
            path="/system-admin/fiscal-years"
            element={<PlaceholderPage />}
          />

          {/* HR Admin Dashboard & Aliases */}
          <Route path="hr-admin" element={<HRDashboard />} />
          <Route path="/hr-admin" element={<HRDashboard />} />
          <Route path="hr-admin/dashboard" element={<HRDashboard />} />
          <Route path="/hr-admin/dashboard" element={<HRDashboard />} />
          <Route path="hr/dashboard" element={<HRDashboard />} />
          <Route path="/hr/dashboard" element={<HRDashboard />} />

          {/* HR Settings & Aliases */}
          <Route path="hr/settings" element={<HRSettingsPage />} />
          <Route path="/hr/settings" element={<HRSettingsPage />} />
          <Route path="hr-admin/settings" element={<HRSettingsPage />} />
          <Route path="/hr-admin/settings" element={<HRSettingsPage />} />
          <Route path="settings" element={<HRSettingsPage />} />
          <Route path="/settings" element={<HRSettingsPage />} />
          <Route path="hr-admin/training" element={<PlaceholderPage />} />
          <Route path="/hr-admin/training" element={<PlaceholderPage />} />

          {/* Employee Management & Aliases */}
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="hr/employees" element={<EmployeesPage />} />
          <Route path="/hr/employees" element={<EmployeesPage />} />

          <Route path="employees/new" element={<EmployeeAdminPage />} />
          <Route path="/employees/new" element={<EmployeeAdminPage />} />
          <Route path="hr/employees/new" element={<EmployeeAdminPage />} />
          <Route path="/hr/employees/new" element={<EmployeeAdminPage />} />

          <Route path="employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="hr/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/hr/employees/:id" element={<EmployeeDetailPage />} />

          <Route path="employees/:id/edit" element={<EmployeeAdminPage />} />
          <Route path="/employees/:id/edit" element={<EmployeeAdminPage />} />
          <Route path="hr/employees/:id/edit" element={<EmployeeAdminPage />} />
          <Route path="/hr/employees/:id/edit" element={<EmployeeAdminPage />} />

          {/* HR Actions Approval & Aliases */}
          <Route
            path="hr/actions-approval"
            element={<HrActionsApprovalPage />}
          />
          <Route
            path="/hr/actions-approval"
            element={<HrActionsApprovalPage />}
          />
          <Route
            path="actions-approval"
            element={<HrActionsApprovalPage />}
          />
          <Route
            path="/actions-approval"
            element={<HrActionsApprovalPage />}
          />
          <Route path="hr-actions" element={<HrActionsApprovalPage />} />
          <Route path="/hr-actions" element={<HrActionsApprovalPage />} />

          {/* Data Import Hub & Aliases */}
          <Route path="hr/import" element={<UniversalImportPage mode="hr" />} />
          <Route path="/hr/import" element={<UniversalImportPage mode="hr" />} />
          <Route path="hr-admin/import" element={<UniversalImportPage mode="hr" />} />
          <Route path="/hr-admin/import" element={<UniversalImportPage mode="hr" />} />

          <Route
            path="system-admin/import"
            element={<UniversalImportPage mode="system-admin" />}
          />
          <Route
            path="/system-admin/import"
            element={<UniversalImportPage mode="system-admin" />}
          />

          <Route path="import" element={<UniversalImportPage />} />
          <Route path="/import" element={<UniversalImportPage />} />

                    {/* Projects & Grants Management */}
          <Route path="hr/projects" element={<ProjectsGrantsPage />} />
          <Route path="/hr/projects" element={<ProjectsGrantsPage />} />
          <Route path="hr-admin/projects" element={<ProjectsGrantsPage />} />
          <Route path="/hr-admin/projects" element={<ProjectsGrantsPage />} />
          <Route path="projects" element={<ProjectsGrantsPage />} />
          <Route path="/projects" element={<ProjectsGrantsPage />} />

          {/* HR Reports & Aliases */}
          <Route path="hr/reports" element={<HRReportsPage />} />
          <Route path="/hr/reports" element={<HRReportsPage />} />
          <Route path="reports" element={<HRReportsPage />} />
          <Route path="/reports" element={<HRReportsPage />} />

          {/* User Profile */}
          <Route path="profile" element={<MyProfilePage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="my-profile" element={<MyProfilePage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route path="self-service/profile" element={<MyProfilePage />} />
          <Route path="/self-service/profile" element={<MyProfilePage />} />

          {/* Other modules */}
          <Route path="/hr-leave/dashboard" element={<PlaceholderPage />} />
          <Route path="/hr-leave/manage" element={<PlaceholderPage />} />
          <Route path="/hr-leave/periods" element={<PlaceholderPage />} />
          <Route
            path="/vacancy-management/dashboard"
            element={<PlaceholderPage />}
          />
          <Route
            path="/vacancy-management/list"
            element={<PlaceholderPage />}
          />
          <Route path="/self-service/dashboard" element={<PlaceholderPage />} />
          <Route path="/help" element={<PlaceholderPage />} />
          <Route
            path="/payroll-management/dashboard"
            element={<PlaceholderPage />}
          />
          <Route
            path="/payroll-management/list"
            element={<PlaceholderPage />}
          />
          <Route
            path="/payroll-management/reports"
            element={<PlaceholderPage />}
          />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
