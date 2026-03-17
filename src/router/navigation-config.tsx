/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LayoutDashboard,
  Settings,
  CalendarDays,
  GraduationCap,
  Search,
  BarChart3,
  User,
  Building,
  Users,
  Wallet,
} from "lucide-react";

export interface NavigationItem {
  id: string;
  title: string;
  icon: any;
  path: string;
  roles: string[];
  children?: NavigationItem[];
}

export const navigationConfig: NavigationItem[] = [
  // System Admin
  {
    id: "system-admin",
    title: "System Admin",
    icon: Settings,
    path: "/system-admin",
    roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"],
    children: [
      {
        id: "system-dashboard",
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/system-admin/dashboard",
        roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"],
      },
      {
        id: "users",
        title: "Users",
        icon: Users,
        path: "/system-admin/users",
        roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"],
      },
      {
        id: "roles",
        title: "Roles",
        icon: Settings,
        path: "/system-admin/roles",
        roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"],
      },
      {
        id: "company-profile",
        title: "Company Profile",
        icon: Building,
        path: "/system-admin/company-profile",
        roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"],
      },
      {
        id: "branches",
        title: "Branches",
        icon: Building,
        path: "/system-admin/branches",
        roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"],
      },
      {
        id: "fiscal-years",
        title: "Fiscal Years",
        icon: CalendarDays,
        path: "/system-admin/fiscal-years",
        roles: ["SYSTEM_ADMIN", "SUPER_ADMIN"],
      },
    ],
  },

  // HR Administration
  {
    id: "hr-admin",
    title: "HR Administration",
    icon: CalendarDays,
    path: "/hr-admin",
    roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"],
    children: [
      {
        id: "hr-dashboard",
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/hr-admin/dashboard",
        roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"],
      },
      {
        id: "hr-settings",
        title: "HR Settings",
        icon: Settings,
        path: "/hr/settings",
        roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"],
      },
      {
        id: "employees",
        title: "Employee Management",
        icon: Users,
        path: "/hr/employees",
        roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"],
      },
      {
        id: "training",
        title: "Training",
        icon: GraduationCap,
        path: "/hr-admin/training",
        roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"],
      },
    ],
  },

  // HR Leave
  {
    id: "hr-leave",
    title: "HR Leave",
    icon: CalendarDays,
    path: "/hr-leave",
    roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "EMPLOYEE"],
    children: [
      {
        id: "leave-dashboard",
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/hr-leave/dashboard",
        roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN", "EMPLOYEE"],
      },
      {
        id: "manage-leave",
        title: "Manage Leave",
        icon: CalendarDays,
        path: "/hr-leave/manage",
        roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"],
      },
      {
        id: "leave-periods",
        title: "Periods",
        icon: CalendarDays,
        path: "/hr-leave/periods",
        roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"],
      },
    ],
  },

  // Vacancy Management
  {
    id: "vacancy-management",
    title: "Vacancy Management",
    icon: Search,
    path: "/vacancy-management",
    roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"],
    children: [
      {
        id: "vacancy-dashboard",
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/vacancy-management/dashboard",
        roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"],
      },
      {
        id: "vacancies",
        title: "Vacancies",
        icon: Search,
        path: "/vacancy-management/list",
        roles: ["HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"],
      },
    ],
  },

  // Self Service Portal
  {
    id: "self-service",
    title: "Self Service Portal",
    icon: User,
    path: "/self-service",
    roles: ["EMPLOYEE", "HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"],
    children: [
      {
        id: "self-service-dashboard",
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/self-service/dashboard",
        roles: ["EMPLOYEE", "HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"],
      },
      {
        id: "profile",
        title: "Profile",
        icon: User,
        path: "/self-service/profile",
        roles: ["EMPLOYEE", "HR_ADMIN", "HR_MANAGER", "SUPER_ADMIN"],
      },
    ],
  },

  // Payroll Management
  {
    id: "payroll-management",
    title: "Payroll Management",
    icon: Wallet,
    path: "/payroll-management",
    roles: ["PAYROLL_ADMIN", "HR_ADMIN", "SUPER_ADMIN"],
    children: [
      {
        id: "payroll-dashboard",
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/payroll-management/dashboard",
        roles: ["PAYROLL_ADMIN", "HR_ADMIN", "SUPER_ADMIN"],
      },
      {
        id: "payroll-list",
        title: "Payroll List",
        icon: Wallet,
        path: "/payroll-management/list",
        roles: ["PAYROLL_ADMIN", "HR_ADMIN", "SUPER_ADMIN"],
      },
      {
        id: "payroll-reports",
        title: "Reports",
        icon: BarChart3,
        path: "/payroll-management/reports",
        roles: ["PAYROLL_ADMIN", "HR_ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
];

// Helper function to get navigation items based on user roles
export const getNavigationForUser = (
  userRoles: string[] = [],
): NavigationItem[] => {
  return navigationConfig
    .map((item) => {
      // Check if user has access to this main menu item
      const hasAccess = item.roles.some((role) => userRoles.includes(role));
      if (!hasAccess) return null;

      // Filter children based on user roles
      const filteredChildren = item.children
        ? item.children.filter((child) =>
            child.roles.some((role) => userRoles.includes(role)),
          )
        : undefined;

      return {
        ...item,
        children: filteredChildren,
      } as NavigationItem;
    })
    .filter((item): item is NavigationItem => item !== null); // Type guard to filter null items
};

// Helper function to check if user has access to a specific path
export const hasAccessToPath = (
  path: string,
  userRoles: string[] = [],
): boolean => {
  const findItem = (items: NavigationItem[]): NavigationItem | null => {
    for (const item of items) {
      if (item.path === path) return item;
      if (item.children) {
        const found = findItem(item.children);
        if (found) return found;
      }
    }
    return null;
  };

  const item = findItem(navigationConfig);
  if (!item) return false;

  return item.roles.some((role) => userRoles.includes(role));
};
