import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Bell, Search, KeyRound, LogOut, User as UserIcon } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { getCompanyLogoUrl } from "@/services/company-branding";

type ApiSuccess<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

type CurrentUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role?: string | null;
  employee?: {
    employeeId?: string | null;
    department?: { name?: string | null } | null;
    branch?: { name?: string | null } | null;
    company?: { name?: string | null } | null;
  } | null;
};

export default function DashboardLayout() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [meLoading, setMeLoading] = useState(true);
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("/mk_logo.png");

  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setMeLoading(true);
        const res = await api.get<ApiSuccess<{ user: CurrentUser }>>(
          "/auth/profile",
        );
        const user = res.data?.user;
        if (!cancelled) {
          setMe(user || null);
        }
      } catch {
        if (!cancelled) setMe(null);
      } finally {
        if (!cancelled) setMeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setLogoUrl(getCompanyLogoUrl("/mk_logo.png"));
  }, []);

  const handleLogout = () => {
    (async () => {
      try {
        await api.post("/auth/logout");
      } catch {
        // ignore
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    })();
  };

  const displayName =
    [me?.firstName, me?.lastName].filter(Boolean).join(" ") ||
    me?.email ||
    "User";

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return (parts[0][0] || "U").toUpperCase();
    return `${parts[0][0] || "U"}${parts[1][0] || ""}`.toUpperCase();
  };

  const openProfile = () => navigate("/my-profile");

  const openChangePassword = () => {
    setPwdForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setPwdOpen(true);
  };

  const savePassword = async () => {
    if (!pwdForm.oldPassword || !pwdForm.newPassword) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    try {
      setPwdSaving(true);
      await api.post("/auth/change-password", {
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
      });
      toast({ title: "Success", description: "Password changed", variant: "success" });
      setPwdOpen(false);
    } catch (e) {
      toast({
        title: "Error",
        description: (e as { message?: string })?.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setPwdSaving(false);
    }
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
              <Link to="/system-admin/dashboard">
                <img
                  src={logoUrl}
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-white hover:bg-white/20"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-white text-primary font-semibold">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start leading-tight">
                      <span className="text-sm font-medium">
                        {meLoading ? "Loading..." : displayName}
                      </span>
                      <span className="text-xs text-white/80">{me?.role || ""}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="space-y-0.5">
                    <div className="text-sm font-medium">{displayName}</div>
                    <div className="text-xs text-muted-foreground">{me?.email || ""}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={openProfile}>
                    <UserIcon className="size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={openChangePassword}>
                    <KeyRound className="size-4" />
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                    <LogOut className="size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Change password dialog */}
        <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pwd-old">Current password</Label>
                <Input
                  id="pwd-old"
                  type="password"
                  value={pwdForm.oldPassword}
                  onChange={(e) => setPwdForm((p) => ({ ...p, oldPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pwd-new">New password</Label>
                <Input
                  id="pwd-new"
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm((p) => ({ ...p, newPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pwd-confirm">Confirm new password</Label>
                <Input
                  id="pwd-confirm"
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPwdOpen(false)} disabled={pwdSaving}>
                Cancel
              </Button>
              <Button onClick={savePassword} disabled={pwdSaving}>
                {pwdSaving ? "Saving..." : "Update password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* PAGE CONTENT */}
        <div className="flex flex-1 flex-col gap-4 p-6 pt-4 bg-background">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
