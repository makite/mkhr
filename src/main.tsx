import { StrictMode, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import RegisterEmployee from "./pages/register-employee.tsx";
const Dashboard = lazy(() => import("./pages/dashboard.tsx"));
const AddScalePage = lazy(() => import("./pages/add-scale.tsx"));
const AddBranchPage = lazy(() => import("./pages/add-branch.tsx"));
const AddPostionPage = lazy(() => import("./pages/add-position.tsx"));
const AddEmpscalePage = lazy(() => import("./pages/add-empscale.tsx"));
const HRSettings = lazy(() => import("./pages/hr-settings-page.tsx"));
const LoginPage = lazy(() => import("./pages/login-page.tsx"));
const NotFound = lazy(() => import("./pages/not-found.tsx"));
const DashboardLayout = lazy(() => import("./layouts/dashboard-layout.tsx"));
const AddGradePage = lazy(() => import("@/pages/add-grade.tsx"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="auth">
          <Route path="login" element={<LoginPage />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/hr">
            <Route path="settings" element={<HRSettings />} />
            <Route path="settings/add_position" element={<AddPostionPage />} />
            <Route path="settings/add_grade" element={<AddGradePage />} />
            <Route path="settings/add_branch" element={<AddBranchPage />} />
            <Route path="settings/add_scale" element={<AddScalePage />} />
            <Route path="settings/add_empscale" element={<AddEmpscalePage />} />
            <Route path="administration" element={<RegisterEmployee />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
