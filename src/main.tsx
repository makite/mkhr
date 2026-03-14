import { StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "sonner";
import SimpleProtectedRoute from "./auth/simple-protected-route";
import UserDetailPage from "./modules/system-admin/users/user-detail";

// Lazy loaded components
const DashboardLayout = lazy(() => import("./layouts/dashboard-layout"));
const LoginPage = lazy(() => import("./pages/login-page"));
const NotFound = lazy(() => import("./pages/not-found-page"));

// System Admin
const SystemAdminDashboard = lazy(
  () => import("./modules/system-admin/dashboard/page"),
);
const UsersPage = lazy(() => import("./modules/system-admin/users/page"));
const RolesPage = lazy(() => import("./modules/system-admin/role/page"));

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

// Placeholder for missing modules
const PlaceholderPage = lazy(() => import("./components/placeholder-page"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
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
          <Route path="dashboard" element={<SystemAdminDashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route
            path="system-admin/company-profile"
            element={<PlaceholderPage />}
          />
          <Route path="system-admin/branches" element={<PlaceholderPage />} />
          <Route
            path="system-admin/fiscal-years"
            element={<PlaceholderPage />}
          />

          {/* HR Admin */}
          <Route path="hr-admin/dashboard" element={<HRDashboard />} />
          <Route path="hr/settings" element={<HRSettingsPage />} />
          <Route path="hr-admin/training" element={<PlaceholderPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employees/:id" element={<EmployeeDetailPage />} />
          <Route path="employees/:id/edit" element={<EmployeeAdminPage />} />

          {/* Other modules */}
          <Route path="hr-leave/dashboard" element={<PlaceholderPage />} />
          <Route path="hr-leave/manage" element={<PlaceholderPage />} />
          <Route path="hr-leave/periods" element={<PlaceholderPage />} />
          <Route
            path="vacancy-management/dashboard"
            element={<PlaceholderPage />}
          />
          <Route path="vacancy-management/list" element={<PlaceholderPage />} />
          <Route path="self-service/dashboard" element={<PlaceholderPage />} />
          <Route path="self-service/profile" element={<PlaceholderPage />} />
          <Route
            path="payroll-management/dashboard"
            element={<PlaceholderPage />}
          />
          <Route path="payroll-management/list" element={<PlaceholderPage />} />
          <Route
            path="payroll-management/reports"
            element={<PlaceholderPage />}
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
