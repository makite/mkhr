import { StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Dashboard from "./modules/hr/dashboard/page.tsx";
import NotFound from "./pages/not-found-page.tsx";
import ProtectedRoute from "./auth/protected-route.tsx";
import EmployeeAdmin from "./modules/hr/employees/components/employee-admin.tsx";
import Employees from "./modules/hr/employees/page.tsx";

const HRSettings = lazy(() => import("./modules/hr/settings/page.tsx"));
const LoginPage = lazy(() => import("./pages/login-page.tsx"));
const DashboardLayout = lazy(() => import("./layouts/dashboard-layout.tsx"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="auth">
          <Route path="login" element={<LoginPage />} />
        </Route>

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/hr">
            <Route path="settings" element={<HRSettings />} />
            <Route path="administration" element={<EmployeeAdmin />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
