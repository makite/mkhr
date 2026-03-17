"use client";

import * as React from "react";
import {
  ChevronDown,
  Settings,
  HelpCircle,
  Search,
  LayoutDashboard,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import { Link, useLocation } from "react-router";
import { navigationService, type NavItem } from "@/services/navigation-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

// Custom Tooltip components since we can't assume they exist
const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>(
    {},
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const location = useLocation();

  // Check if sidebar is expanded (state can be "expanded" or "collapsed")
  const isExpanded = state === "expanded";

  // Get user roles from localStorage
  const getUserRoles = (): string[] => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const roles = Array.isArray(user.roles)
        ? user.roles
        : user.role
          ? [user.role]
          : [];
      return roles.length > 0 ? roles : ["HR_ADMIN", "SYSTEM_ADMIN"];
    } catch {
      return ["HR_ADMIN", "SYSTEM_ADMIN"];
    }
  };

  const getUserInfo = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        name: user.name || user.username || "Admin User",
        email: user.email || "admin@company.com",
        avatar: user.avatar,
      };
    } catch {
      return {
        name: "Admin User",
        email: "admin@company.com",
        avatar: null,
      };
    }
  };

  const userRoles = getUserRoles();
  const userInfo = getUserInfo();
  const [navigationItems, setNavigationItems] = React.useState<NavItem[]>([]);
  const [navLoading, setNavLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setNavLoading(true);
        const items = await navigationService.getMyNavigation();
        if (!cancelled) setNavigationItems(items);
      } catch {
        // fallback to empty menu; user will still have routes accessible via direct link
        if (!cancelled) setNavigationItems([]);
      } finally {
        if (!cancelled) setNavLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Get user role display name
  const getUserRoleDisplay = () => {
    if (userRoles.includes("SYSTEM_ADMIN")) return "System Administrator";
    if (userRoles.includes("HR_ADMIN")) return "HR Administrator";
    if (userRoles.includes("HR_MANAGER")) return "HR Manager";
    if (userRoles.includes("PAYROLL_ADMIN")) return "Payroll Administrator";
    if (userRoles.includes("EMPLOYEE")) return "Employee";
    return "Team Member";
  };

  // Get role color using Tailwind primary/secondary
  const getRoleBadgeColor = () => {
    if (userRoles.includes("SYSTEM_ADMIN"))
      return "bg-primary text-primary-foreground";
    if (userRoles.includes("HR_ADMIN"))
      return "bg-secondary text-secondary-foreground";
    if (userRoles.includes("HR_MANAGER"))
      return "bg-primary/80 text-primary-foreground";
    if (userRoles.includes("PAYROLL_ADMIN"))
      return "bg-secondary/80 text-secondary-foreground";
    return "bg-muted text-muted-foreground";
  };

  // Get avatar background using Tailwind primary
  const getAvatarBackground = () => {
    return "bg-primary text-primary-foreground";
  };

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => {
      // Close all other menus and toggle the clicked one
      const newState: { [key: string]: boolean } = {};

      // If we want only one menu open at a time
      // Uncomment the line below and comment the other return

      // Option 1: Only one menu open at a time
      newState[id] = !prev[id];

      // Option 2: Multiple menus can be open (toggle only the clicked one)
      // return { ...prev, [id]: !prev[id] };

      return newState;
    });
  };

  // Check if a route is active
  const isRouteActive = (path: string): boolean => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  // Filter navigation items based on search
  const filterNavigationItems = (items: typeof navigationItems) => {
    if (!searchQuery || !isExpanded) return items;

    return items.filter((item) => {
      const matchesTitle = item.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesChildren = item.children?.some((child) =>
        child.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return matchesTitle || matchesChildren;
    });
  };

  const filteredItems = filterNavigationItems(navigationItems);

  // Initialize open menus based on active routes
  React.useEffect(() => {
    if (!isExpanded) return;

    const newOpenMenus: { [key: string]: boolean } = {};

    // Find which parent menus should be open based on active child routes
    navigationItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) =>
          isRouteActive(child.path),
        );
        if (hasActiveChild) {
          newOpenMenus[item.id] = true;
        }
      }
    });

    // Only update if there are changes
    if (Object.keys(newOpenMenus).length > 0) {
      setOpenMenus(newOpenMenus);
    }
  }, [location.pathname]);

  // Fix for the TypeScript error in AvatarFallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <TooltipProvider>
      <Sidebar
        collapsible="icon"
        className="border-r bg-background shadow-lg"
        {...props}
      >
        {/* Company Header */}
        <SidebarHeader className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-md transition-transform hover:scale-105`}
              >
                {isExpanded ? "ERP" : "E"}
              </div>
              {isExpanded && (
                <div className="animate-in fade-in slide-in-from-left-5">
                  <h2 className="font-bold text-lg text-foreground">MK ERP</h2>
                  <p className="text-xs text-muted-foreground">v1.0.0</p>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar - Expanded only */}
          {isExpanded && (
            <div className="mt-4 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu..."
                className="pl-8 bg-background border-input focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </SidebarHeader>

        {/* User Profile Section */}
        <div className={`p-4 ${isExpanded ? "border-b border-border" : ""}`}>
          <div className="flex items-center gap-3">
            <Avatar
              className={`h-12 w-12 border-2 border-background shadow-md transition-all hover:scale-105 hover:shadow-lg ${getAvatarBackground()}`}
            >
              <AvatarImage src={userInfo.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(userInfo.name)}
              </AvatarFallback>
            </Avatar>

            {isExpanded && (
              <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-5">
                <p className="font-semibold text-foreground truncate">
                  {userInfo.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}
                  >
                    {getUserRoleDisplay()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {userInfo.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Menu */}
        <SidebarContent className="p-2">
          <div className="overflow-y-auto max-h-[calc(100vh-300px)] custom-scrollbar">
            <div className="space-y-1 pr-1">
              {navLoading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading menu...</div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const Icon = item.icon || LayoutDashboard;
                  const isOpen = openMenus[item.id] || false;
                  const isActive = isRouteActive(item.path);

                  if (item.children && item.children.length > 0) {
                    return (
                      <div key={item.id} className="space-y-1">
                        <button
                          onClick={() => toggleMenu(item.id)}
                          className={`group relative flex w-full items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                              : "hover:bg-accent text-foreground hover:text-accent-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                                isActive
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                            {isExpanded && (
                              <span className="font-medium truncate">
                                {item.title}
                              </span>
                            )}
                          </div>

                          {isExpanded && (
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              } ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                            />
                          )}
                        </button>

                        {isExpanded && isOpen && (
                          <div className="ml-8 mt-1 space-y-0.5 animate-in slide-in-from-left-5">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon || LayoutDashboard;
                              const isChildActive = isRouteActive(child.path);

                              return (
                                <Link
                                  key={child.id}
                                  to={child.path}
                                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${
                                    isChildActive
                                      ? "bg-accent text-accent-foreground font-medium"
                                      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  <ChildIcon
                                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                                      isChildActive
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                  <span className="flex-1">{child.title}</span>
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
                      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                          : "hover:bg-accent text-foreground hover:text-accent-foreground"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      />
                      {isExpanded && (
                        <span className="font-medium flex-1 truncate">
                          {item.title}
                        </span>
                      )}
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No menu items found
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-border space-y-1">
              <Link
                to="/help"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-all duration-200 group ${
                  !isExpanded ? "justify-center" : ""
                }`}
              >
                <HelpCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                {isExpanded && (
                  <span className="font-medium">Help & Support</span>
                )}
              </Link>

              <Link
                to="/settings"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-all duration-200 group ${
                  !isExpanded ? "justify-center" : ""
                }`}
              >
                <Settings className="h-5 w-5 transition-transform group-hover:scale-110" />
                {isExpanded && <span className="font-medium">Settings</span>}
              </Link>

              {/* <button
                onClick={() => {
                  // Handle logout
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-destructive/10 text-destructive hover:text-destructive transition-all duration-200 group ${
                  !isExpanded ? "justify-center" : ""
                }`}
              >
                <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
                {isExpanded && <span className="font-medium">Logout</span>}
              </button> */}
            </div>
          </div>
        </SidebarContent>

        {/* Version Info */}
        {isExpanded && (
          <div className="p-4 text-xs text-muted-foreground border-t border-border">
            <div className="flex items-center justify-between">
              <span>© {new Date().getFullYear()} MK ERP</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                v1.0.0
              </span>
            </div>
          </div>
        )}

        <SidebarRail />
      </Sidebar>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </TooltipProvider>
  );
}
