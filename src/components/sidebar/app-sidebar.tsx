"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Settings,
  CalendarDays,
  GraduationCap,
  Wallet,
  Search,
  BarChart3,
  User,
  ChevronDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import { Link } from "react-router";

// Dummy API-ready menu data
const dummyMenu = [
  {
    MenuCode: 1,
    Description: "System Admin",
    Icon: Settings,
    NavigateUrl: "/system-admin",
    children: [
      {
        MenuCode: 101,
        Description: "Dashboard",
        NavigateUrl: "/dashboard",
        Icon: LayoutDashboard,
      },
      {
        MenuCode: 102,
        Description: "Company Profile",
        NavigateUrl: "/system-admin/company-profile",
        Icon: LayoutDashboard,
      },
      {
        MenuCode: 103,
        Description: "Default Settings",
        NavigateUrl: "/hr/settings",
        Icon: LayoutDashboard,
      },
      {
        MenuCode: 104,
        Description: "Branches",
        NavigateUrl: "/system-admin/branches",
        Icon: LayoutDashboard,
      },
      {
        MenuCode: 105,
        Description: "Fiscal Years",
        NavigateUrl: "/system-admin/fiscal-years",
        Icon: LayoutDashboard,
      },
    ],
  },
  {
    MenuCode: 2,
    Description: "HR Administration",
    Icon: CalendarDays,
    NavigateUrl: "/hr-admin",
    children: [
      {
        MenuCode: 201,
        Description: "Dashboard",
        NavigateUrl: "/hr-admin/dashboard",
        Icon: LayoutDashboard,
      },
      {
        MenuCode: 202,
        Description: "HR Settings",
        NavigateUrl: "/hr/settings",
        Icon: LayoutDashboard,
      },
      {
        MenuCode: 203,
        Description: "Employee Management",
        NavigateUrl: "/employees",
        Icon: LayoutDashboard,
      },
      {
        MenuCode: 204,
        Description: "Training",
        NavigateUrl: "/hr-admin/training",
        Icon: GraduationCap,
      },
    ],
  },
  {
    MenuCode: 3,
    Description: "HR Leave",
    Icon: CalendarDays,
    NavigateUrl: "/hr-leave",
    children: [
      {
        MenuCode: 301,
        Description: "Dashboard",
        NavigateUrl: "/hr-leave/dashboard",
        Icon: LayoutDashboard,
      },
      {
        MenuCode: 302,
        Description: "Manage Leave",
        NavigateUrl: "/hr-leave/manage",
        Icon: CalendarDays,
      },
      {
        MenuCode: 303,
        Description: "Periods",
        NavigateUrl: "/hr-leave/periods",
        Icon: CalendarDays,
      },
    ],
  },
  {
    MenuCode: 4,
    Description: "Vacancy Management",
    Icon: Search,
    NavigateUrl: "/vacancy-management",
    children: [
      {
        MenuCode: 401,
        Description: "Dashboard",
        NavigateUrl: "/vacancy-management/dashboard",
        Icon: LayoutDashboard,
      },
      {
        MenuCode: 402,
        Description: "Vacancies",
        NavigateUrl: "/vacancy-management/list",
        Icon: Search,
      },
    ],
  },
  {
    MenuCode: 5,
    Description: "Self Service Portal",
    Icon: User,
    NavigateUrl: "/self-service",
    children: [
      {
        MenuCode: 501,
        Description: "Dashboard",
        NavigateUrl: "/self-service/dashboard",
        Icon: LayoutDashboard,
      },
      {
        MenuCode: 502,
        Description: "Profile",
        NavigateUrl: "/self-service/profile",
        Icon: User,
      },
    ],
  },
  {
    MenuCode: 6,
    Description: "Payroll Management",
    Icon: Wallet,
    NavigateUrl: "/payroll-management",
    children: [
      {
        MenuCode: 601,
        Description: "Dashboard",
        NavigateUrl: "/payroll-management/dashboard",
        Icon: LayoutDashboard,
      },
      {
        MenuCode: 602,
        Description: "Payroll List",
        NavigateUrl: "/payroll-management/list",
        Icon: Wallet,
      },
      {
        MenuCode: 603,
        Description: "Reports",
        NavigateUrl: "/payroll-management/reports",
        Icon: BarChart3,
      },
    ],
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const [openMenus, setOpenMenus] = React.useState<{ [key: number]: boolean }>(
    {},
  );

  const toggleMenu = (code: number) => {
    setOpenMenus((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <Sidebar collapsible="icon" className="border-r bg-background" {...props}>
      {/* USER HEADER */}
      <SidebarHeader className="p-4 border-b bg-primary text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary font-semibold text-lg">
            Ab
          </div>

          {state === "expanded" && (
            <div>
              <p className="font-semibold text-secondary">Abebe</p>
              <p className="text-xs text-muted-secondary">Admin</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* MENU */}
      <SidebarContent className="p-2 space-y-1">
        {dummyMenu.map((item) => {
          const Icon = item.Icon;

          if (item.children && item.children.length > 0) {
            const isOpen = openMenus[item.MenuCode] ?? true; // default open

            return (
              <div key={item.MenuCode}>
                <button
                  onClick={() => toggleMenu(item.MenuCode)}
                  className="flex w-full items-center justify-between px-3 py-2 rounded-md hover:bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    {state === "expanded" && (
                      <span className="font-medium">{item.Description}</span>
                    )}
                  </div>

                  {state === "expanded" && (
                    <ChevronDown
                      className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {state === "expanded" && isOpen && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.Icon;
                      return (
                        <Link
                          key={child.MenuCode}
                          to={child.NavigateUrl || "#"}
                          className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-secondary"
                        >
                          <ChildIcon className="h-4 w-4 text-muted-foreground" />
                          {child.Description}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.MenuCode}
              to={item.NavigateUrl || "#"}
              className="flex items-center gap-3 px-3 py-2 rounded-md transition hover:bg-secondary text-muted-foreground"
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              {state === "expanded" && (
                <span className="font-medium">{item.Description}</span>
              )}
            </Link>
          );
        })}

        {/* SECTION DIVIDER */}
        <div className="border-t border-dashed my-3" />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
