import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bell, Search, ChevronDown } from "lucide-react";
import { Outlet } from "react-router";
import { useState, useEffect } from "react";

export default function DashboardLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/";
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-[80%]">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <InputGroup className="sm:w-sm md:w-md lg:w-lg w-xl ml-auto flex items-center">
              <InputGroupInput placeholder="Search..." />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
            </InputGroup>
            <div className="ml-auto flex items-center gap-4 relative">
              {/* Notifications */}
              <Button
                variant="outline"
                asChild
                size="icon-lg"
                className="hidden sm:flex px-2"
              >
                <Bell />
              </Button>

              {/* Profile Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 py-1"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {/* Avatar with initials */}
                  <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-medium">
                    {getInitials(username)}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => alert("View Profile")}
                    >
                      Profile
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => alert("Change Password")}
                    >
                      Change Password
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-2">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
