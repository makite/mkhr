import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bell, Search, ChevronDown } from "lucide-react";
import { Link, Outlet } from "react-router";
import { useState, useEffect } from "react";

export default function DashboardLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) setUsername(storedUser);
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

      <SidebarInset className="w-full">
        {/* HEADER */}
        <header className="flex h-20 items-center bg-primary text-white border-b">
          <div className="flex w-full items-center gap-4 px-4">
            <SidebarTrigger className="bg-secondary hover:bg-secondary/90 text-primary w-10 h-10" />

            <Separator
              orientation="vertical"
              className="h-16 w-px bg-white/30"
            />

            {/* LOGO */}
            <SidebarHeader>
              <Link to="/dashboard">
                <img
                  src="../../../mk_logo.png"
                  alt="mk logo"
                  className="w-14 h-14"
                />
              </Link>
            </SidebarHeader>

            {/* SEARCH */}
            <InputGroup className="ml-6 w-full max-w-xl">
              <InputGroupInput
                placeholder="Search..."
                className="bg-white/10 border-white/30 text-white placeholder:text-white/70"
              />

              <InputGroupAddon className="text-white">
                <Search size={18} />
              </InputGroupAddon>

              <InputGroupAddon
                align="inline-end"
                className="text-white/70 text-sm"
              >
                12 results
              </InputGroupAddon>
            </InputGroup>

            {/* RIGHT SIDE */}
            <div className="ml-auto flex items-center gap-4">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Bell />
              </Button>

              {/* PROFILE */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-white hover:bg-white/20"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center font-semibold">
                    {getInitials(username)}
                  </div>

                  <ChevronDown className="w-4 h-4" />
                </Button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black border rounded-lg shadow-lg z-50 overflow-hidden">
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

        {/* PAGE CONTENT */}
        <div className="flex flex-1 flex-col gap-4 p-6 pt-4 bg-background">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
