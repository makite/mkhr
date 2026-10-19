import { lazy } from "react";
import type { RouteObject } from "react-router";

// Extended route interface with metadata
interface RouteMeta {
  title: string;
  module: string;
  roles: string[];
}

interface ExtendedRouteObject extends Omit<RouteObject, 'children'> {
  meta?: RouteMeta;
  children?: ExtendedRouteObject[];
}

// Lazy loaded components for better performance
const DashboardLayout = lazy(() => import("../layouts/dashboard-layout"));
const LoginPage = lazy(() => import("../pages/login-page"));
const NotFound = lazy(() => import("../pages/not-found-page"));
const MyProfilePage = lazy(() => import("../pages/my-profile-page"));

// System Admin Routes
const SystemAdminDashboard = lazy(() => import("../modules/system-admin/dashboard/page"));
const UsersPage = lazy(() => import("../modules/system-admin/users/page"));
const RolesPage = lazy(() => import("../modules/system-admin/role/page"));
const MenuPage = lazy(() => import("../modules/system-admin/menu/page"));
const AccessPage = lazy(() => import("../modules/system-admin/access/page"));
const CompanyProfilePage = lazy(() => import("../modules/system-admin/company-profile/page"));
const SystemAdminActivitiesReportPage = lazy(
  () => import("../modules/system-admin/reports/activities-page"),
);

// HR Admin Routes
const HRDashboard = lazy(() => import("../modules/hr/dashboard/page"));
const EmployeesPage = lazy(() => import("../modules/hr/employees/page"));
const EmployeeDetailPage = lazy(() => import("../modules/hr/employees/components/employee-detail-page"));
const EmployeeAdminPage = lazy(() => import("../modules/hr/employees/components/employee-admin"));
const HRSettingsPage = lazy(() => import("../modules/hr/settings/page"));
const HRActionsApprovalPage = lazy(() => import("../modules/hr/actions-approval/page"));
const HRReportsPage = lazy(() => import("../modules/hr/reports/page"));

// Temporary placeholder components for missing modules
const PlaceholderPage = lazy(() => import("../components/placeholder-page"));

// Route configuration with role-based access
export const routeConfig: ExtendedRouteObject[] = [
  // Public routes
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/auth",
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
    ],
  },

  // Protected routes with layout
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      // System Admin Dashboard & Core Management
      {
        path: "dashboard",
        element: <SystemAdminDashboard />,
        meta: { 
          title: "System Dashboard", 
          module: "system-admin",
          roles: ["SYSTEM_ADMIN", "SUPER_ADMIN", "ADMIN"] 
        },
      },
      {
        path: "system-admin/dashboard",
        element: <SystemAdminDashboard />,
        meta: { 
          title: "System Dashboard", 
          module: "system-admin",
          roles: ["SYSTEM_ADMIN", "SUPER_ADMIN", "ADMIN"] 
        },
      },
      {
        path: "users",
        element: <UsersPage />,
        meta: { 
          title: "Users", 
          module: "system-admin",
          roles: ["SYSTEM_ADMIN", "SUPER_ADMIN", "ADMIN"] 
        },
      },
      {
        path: "system-admin/users",
        element: <UsersPage />,
        meta: { 
          title: "Users", 
          module: "system-admin",
          roles: ["SYSTEM_ADMIN", "SUPER_ADMIN", "ADMIN"] 
        },
      },
      {
        path: "roles",
        element: <RolesPage />,
        meta: { 
          title: "Roles", 
          module: "system-admin",
          roles: ["SYSTEM_ADMIN", "SUPER_ADMIN", "ADMIN"] 
        },
      },
      {
        path: "system-admin/roles",
        element: <RolesPage />,
        meta: { 
          title: "Roles", 
          module: "system-admin",
          roles: ["SYSTEM_ADMIN", "SUPER_ADMIN", "ADMIN"] 
        },
      },
      {
        path: "system-admin/menu",
        element: <MenuPage />,
        meta: { 
          title: "Menu Management", 
          module: "system-admin",
          roles: ["SYSTEM_ADMIN", "SUPER_ADMIN", "ADMIN"] 
        },
      },
      {
        path: "system-admin/access",
        element: <AccessPage />,
        meta: { 
          title: "Access Management", 
          module: "system-admin",
          roles: ["SYSTEM_ADMIN", "SUPER_ADMIN", "ADMIN"] 
        },
      },
      {
        path: "system-admin/company-profile",
        element: <CompanyProfilePage />,
        meta: { 
          title: "Company Profile", 
          module: "system-admin",
          roles: ["SYSTEM_ADMIN", "SUPER_ADMIN", "ADMIN"] 
        },
      },
      {
        path: "company-profile",
        element: <CompanyProfilePage />,
        meta: { 
          title: "Company Profile", 
          module: "system-admin",
          roles: ["SYSTEM_ADMIN", "SUPER_ADMIN", "ADMIN"] 
        },
      },
      {
        path: "system-admin/reports/activities",
        element: <SystemAdminActivitiesReportPage />,
        meta: {
          title: "Activities Report",
          module: "system-admin",
          roles: ["ADMIN", "SUPER_ADMIN"],
        },
      },

      // HR Admin Module & Settings
      {
        path: "hr-admin/dashboard",
        element: <HRDashboard />,
        meta: { 
          title: "HR Dashboard", 
          module: "hr-admin",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },
      {
        path: "hr/dashboard",
        element: <HRDashboard />,
        meta: { 
          title: "HR Dashboard", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },
      {
        path: "hr-admin/settings",
        element: <HRSettingsPage />,
        meta: { 
          title: "HR Settings", 
          module: "hr-admin",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },
      {
        path: "hr/settings",
        element: <HRSettingsPage />,
        meta: { 
          title: "HR Settings", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },
      {
        path: "settings",
        element: <HRSettingsPage />,
        meta: { 
          title: "Settings", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },

      // Employees Page & CRUD Routes
      {
        path: "employees",
        element: <EmployeesPage />,
        meta: { 
          title: "Employees", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },
      {
        path: "hr/employees",
        element: <EmployeesPage />,
        meta: { 
          title: "Employees", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },
      {
        path: "employees/new",
        element: <EmployeeAdminPage />,
        meta: { 
          title: "New Employee", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },
      {
        path: "hr/employees/new",
        element: <EmployeeAdminPage />,
        meta: { 
          title: "New Employee", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },
      {
        path: "employees/:id",
        element: <EmployeeDetailPage />,
        meta: { 
          title: "Employee Details", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },
      {
        path: "hr/employees/:id",
        element: <EmployeeDetailPage />,
        meta: { 
          title: "Employee Details", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },
      {
        path: "employees/:id/edit",
        element: <EmployeeAdminPage />,
        meta: { 
          title: "Edit Employee", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },
      {
        path: "hr/employees/:id/edit",
        element: <EmployeeAdminPage />,
        meta: { 
          title: "Edit Employee", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },

      // HR Actions Approval
      {
        path: "hr/actions-approval",
        element: <HRActionsApprovalPage />,
        meta: { 
          title: "Actions Approval", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },
      {
        path: "actions-approval",
        element: <HRActionsApprovalPage />,
        meta: { 
          title: "Actions Approval", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },

      // HR Reports
      {
        path: "hr/reports",
        element: <HRReportsPage />,
        meta: { 
          title: "HR Reports", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },
      {
        path: "reports",
        element: <HRReportsPage />,
        meta: { 
          title: "HR Reports", 
          module: "hr",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "HR", "ADMIN"] 
        },
      },

      // User Profile
      {
        path: "profile",
        element: <MyProfilePage />,
        meta: { 
          title: "My Profile", 
          module: "self-service",
          roles: [] 
        },
      },
      {
        path: "my-profile",
        element: <MyProfilePage />,
        meta: { 
          title: "My Profile", 
          module: "self-service",
          roles: [] 
        },
      },
      {
        path: "self-service/profile",
        element: <MyProfilePage />,
        meta: { 
          title: "My Profile", 
          module: "self-service",
          roles: [] 
        },
      },

      // Placeholder routes for secondary modules
      {
        path: "system-admin/branches",
        element: <PlaceholderPage />,
        meta: { 
          title: "Branches", 
          module: "system-admin",
          roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"] 
        },
      },
      {
        path: "system-admin/fiscal-years",
        element: <PlaceholderPage />,
        meta: { 
          title: "Fiscal Years", 
          module: "system-admin",
          roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"] 
        },
      },
      {
        path: "hr-admin/training",
        element: <PlaceholderPage />,
        meta: { 
          title: "Training", 
          module: "hr-admin",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"] 
        },
      },
      {
        path: "hr-leave/dashboard",
        element: <PlaceholderPage />,
        meta: { 
          title: "Leave Dashboard", 
          module: "hr-leave",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "EMPLOYEE"] 
        },
      },
      {
        path: "hr-leave/manage",
        element: <PlaceholderPage />,
        meta: { 
          title: "Manage Leave", 
          module: "hr-leave",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"] 
        },
      },
      {
        path: "hr-leave/periods",
        element: <PlaceholderPage />,
        meta: { 
          title: "Leave Periods", 
          module: "hr-leave",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"] 
        },
      },
      {
        path: "vacancy-management/dashboard",
        element: <PlaceholderPage />,
        meta: { 
          title: "Vacancy Dashboard", 
          module: "vacancy",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"] 
        },
      },
      {
        path: "vacancy-management/list",
        element: <PlaceholderPage />,
        meta: { 
          title: "Vacancies", 
          module: "vacancy",
          roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"] 
        },
      },
      {
        path: "self-service/dashboard",
        element: <PlaceholderPage />,
        meta: { 
          title: "Self Service Dashboard", 
          module: "self-service",
          roles: ["EMPLOYEE", "HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"] 
        },
      },
      {
        path: "payroll-management/dashboard",
        element: <PlaceholderPage />,
        meta: { 
          title: "Payroll Dashboard", 
          module: "payroll",
          roles: ["PAYROLL_ADMIN", "HR_ADMIN", "SUPER_ADMIN"] 
        },
      },
      {
        path: "payroll-management/list",
        element: <PlaceholderPage />,
        meta: { 
          title: "Payroll List", 
          module: "payroll",
          roles: ["PAYROLL_ADMIN", "HR_ADMIN", "SUPER_ADMIN"] 
        },
      },
      {
        path: "payroll-management/reports",
        element: <PlaceholderPage />,
        meta: { 
          title: "Payroll Reports", 
          module: "payroll",
          roles: ["PAYROLL_ADMIN", "HR_ADMIN", "SUPER_ADMIN"] 
        },
      },
    ],
  },

  // 404 fallback
  {
    path: "*",
    element: <NotFound />,
  },
];

// Helper function to get routes by module
export const getRoutesByModule = (module: string) => {
  const routes: ExtendedRouteObject[] = [];
  
  const findRoutes = (routes: ExtendedRouteObject[], targetModule: string) => {
    routes.forEach(route => {
      if (route.meta?.module === targetModule) {
        routes.push(route);
      }
      if (route.children) {
        findRoutes(route.children, targetModule);
      }
    });
  };
  
  findRoutes(routeConfig, module);
  return routes;
};

// Helper function to check if user has access to route
export const hasRouteAccess = (route: ExtendedRouteObject, userRoles: string[] = []): boolean => {
  if (!route.meta?.roles || route.meta.roles.length === 0) {
    return true; // Public route
  }
  
  return route.meta.roles.some((role: string) => userRoles.includes(role));
};

export default routeConfig;
