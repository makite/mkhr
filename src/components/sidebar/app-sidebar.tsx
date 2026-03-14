"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import { Link, useLocation } from "react-router";
import { getNavigationForUser } from "@/router/navigation-config";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>(
    {},
  );
  const location = useLocation();

  // Get user roles from localStorage
  const getUserRoles = (): string[] => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const roles = Array.isArray(user.roles)
        ? user.roles
        : user.role
          ? [user.role]
          : [];
      // For testing purposes, provide default roles if none exist
      return roles.length > 0 ? roles : ["HR_ADMIN", "SYSTEM_ADMIN"];
    } catch {
      return ["HR_ADMIN", "SYSTEM_ADMIN"]; // Default roles for testing
    }
  };

  const userRoles = getUserRoles();
  const navigationItems = getNavigationForUser(userRoles);

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Check if a route is active
  const isRouteActive = (path: string): boolean => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r bg-background" {...props}>
      {/* USER HEADER */}
      <SidebarHeader className="p-4 border-b bg-primary text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary font-semibold text-lg">
            {userRoles[0]?.[0] || "U"}
          </div>

          {state === "expanded" && (
            <div>
              <p className="font-semibold text-secondary">
                {userRoles.includes("SYSTEM_ADMIN")
                  ? "System Admin"
                  : userRoles.includes("HR_ADMIN")
                    ? "HR Admin"
                    : userRoles.includes("HR_MANAGER")
                      ? "HR Manager"
                      : "User"}
              </p>
              <p className="text-xs text-muted-secondary">
                {userRoles.join(", ")}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* MENU */}
      <SidebarContent className="p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isOpen = openMenus[item.id] ?? true; // default open
          const isActive = isRouteActive(item.path);

          if (item.children && item.children.length > 0) {
            return (
              <div key={item.id}>
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={`flex w-full items-center justify-between px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-secondary text-primary"
                      : "hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    />
                    {state === "expanded" && (
                      <span className="font-medium">{item.title}</span>
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
                      const ChildIcon = child.icon;
                      const isChildActive = isRouteActive(child.path);

                      return (
                        <Link
                          key={child.id}
                          to={child.path}
                          className={`flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors ${
                            isChildActive
                              ? "bg-secondary text-primary"
                              : "hover:bg-secondary text-muted-foreground"
                          }`}
                        >
                          <ChildIcon className="h-4 w-4" />
                          {child.title}
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
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-secondary text-primary"
                  : "hover:bg-secondary text-muted-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              {state === "expanded" && (
                <span className="font-medium">{item.title}</span>
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
