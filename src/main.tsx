import { StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import Dashboard from "./pages/dashboard-page.tsx";
import NotFound from "./pages/not-found-page.tsx";
import EmployeeAdmin from "./pages/employee-admin.tsx";
const HRSettings = lazy(() => import("./pages/hr-settings-page.tsx"));
const LoginPage = lazy(() => import("./pages/login-page.tsx"));
const DashboardLayout = lazy(() => import("./layouts/dashboard-layout.tsx"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="auth">
          <Route path="login" element={<LoginPage />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hr">
            <Route path="settings" element={<HRSettings />} />
            <Route path="administration" element={<EmployeeAdmin />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
