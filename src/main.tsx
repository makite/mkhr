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

// Placeholder for missing modules
const PlaceholderPage = lazy(() => import("./components/placeholder-page"));

// Apply branding/logo early (non-blocking). Defaults remain if API missing.
void applyCompanyBranding();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <NavigateSetter />
      <Toaster
        richColors
        position="top-right"
        closeButton
        expand={true}
        duration={4000}
      />{" "}
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
          {/* System Admin */}
          <Route
            path="/system-admin/dashboard"
            element={<SystemAdminDashboard />}
          />
          <Route path="/system-admin/users" element={<UsersPage />} />
          <Route path="/system-admin/users/:id" element={<UserDetailPage />} />
          <Route path="/system-admin/roles" element={<RolesPage />} />
          <Route
            path="system-admin/company-profile"
            element={<CompanyProfilePage />}
          />
          <Route path="system-admin/branches" element={<PlaceholderPage />} />
          <Route
            path="system-admin/fiscal-years"
            element={<PlaceholderPage />}
          />
          <Route path="system-admin/menu" element={<MenuManagementPage />} />
          <Route
            path="system-admin/access"
            element={<AccessManagementPage />}
          />
          <Route
            path="system-admin/reports/activities"
            element={<SystemAdminActivitiesReportPage />}
          />

          {/* HR Admin */}
          <Route path="hr-admin/dashboard" element={<HRDashboard />} />
          <Route path="hr/settings" element={<HRSettingsPage />} />
          <Route path="hr-admin/training" element={<PlaceholderPage />} />
          <Route path="/hr/employees" element={<EmployeesPage />} />
          <Route path="/hr/employees/:id" element={<EmployeeDetailPage />} />
          <Route
            path="/hr/employees/:id/edit"
            element={<EmployeeAdminPage />}
          />
          <Route path="/hr/employees/new" element={<EmployeeAdminPage />} />
          <Route
            path="/hr/actions-approval"
            element={<HrActionsApprovalPage />}
          />
          <Route path="/hr/reports" element={<HRReportsPage />} />

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
          <Route path="/self-service/profile" element={<PlaceholderPage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route path="/help" element={<PlaceholderPage />} />
          <Route path="/settings" element={<PlaceholderPage />} />
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

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
