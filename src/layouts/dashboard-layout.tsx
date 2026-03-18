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
import {
  Bell,
  Search,
  KeyRound,
  LogOut,
  User as UserIcon,
  X,
} from "lucide-react";
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

type NavItem = {
  id?: string;
  title?: string | null;
  path?: string | null;
  isActive?: boolean | null;
  children?: NavItem[] | null;
};

export default function DashboardLayout() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [meLoading, setMeLoading] = useState(true);
  const [me, setMe] = useState<CurrentUser | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("/mk_logo.png");

  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [navLoading, setNavLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setNavLoading(true);
        const navRes = await api.get<any>("/navigation");
        const items = navRes?.data?.items ?? navRes?.items ?? [];
        if (!cancelled) setNavItems(Array.isArray(items) ? items : []);
      } catch {
        if (!cancelled) setNavItems([]);
      } finally {
        if (!cancelled) setNavLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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

  const normalizePath = (path: string): string => {
    if (!path) return "/";
    if (!path.startsWith("/")) return `/${path}`;
    return path.replace(/^\/+/, "/");
  };

  const flattenNav = (items: NavItem[]): Array<{ title: string; path: string }> => {
    const out: Array<{ title: string; path: string }> = [];
    const walk = (arr: NavItem[]) => {
      for (const it of arr || []) {
        if (!it) continue;
        if (it.isActive === false) continue;
        const title = String(it.title ?? "").trim();
        const path = String(it.path ?? "").trim();
        if (title && path) out.push({ title, path: normalizePath(path) });
        if (Array.isArray(it.children) && it.children.length) walk(it.children);
      }
    };
    walk(items);
    return out;
  };

  const navFlat = flattenNav(navItems);
  const searchText = searchQuery.trim().toLowerCase();
  const searchResults = searchText
    ? navFlat
        .filter(
          (i) =>
            i.title.toLowerCase().includes(searchText) ||
            i.path.toLowerCase().includes(searchText),
        )
        .slice(0, 10)
    : [];

  const goToResult = (path: string) => {
    const p = normalizePath(path);
    setSearchOpen(false);
    setSearchQuery("");
    navigate(p);
  };

  const submitSearch = () => {
    if (searchResults.length > 0) {
      goToResult(searchResults[0].path);
    }
  };

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
        <header className="bg-primary text-white border-b">
          <div className="flex w-full items-center gap-3 px-3 sm:px-4 h-16 sm:h-20">
            <SidebarTrigger className="bg-secondary hover:bg-secondary/90 text-primary w-10 h-10 shrink-0" />

            <Separator
              orientation="vertical"
              className="hidden sm:block h-12 sm:h-16 w-px bg-white/30"
            />

            {/* LOGO */}
            <SidebarHeader>
              <Link to="/system-admin/dashboard">
                <img
                  src={logoUrl}
                  alt="mk logo"
                  className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                />
              </Link>
            </SidebarHeader>

            {/* SEARCH */}
            <div className="hidden md:block ml-4 w-full max-w-xl relative">
              <InputGroup>
                <InputGroupInput
                  placeholder="Search menus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitSearch();
                    }
                  }}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/70"
                />

                <InputGroupAddon className="text-white">
                  <Search size={18} />
                </InputGroupAddon>

                <InputGroupAddon
                  align="inline-end"
                  className="text-white/70 text-sm"
                >
                  {navLoading
                    ? "…"
                    : searchText
                      ? `${searchResults.length} results`
                      : ""}
                </InputGroupAddon>
              </InputGroup>

              {searchText && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-md border border-white/20 bg-white text-foreground shadow-lg overflow-hidden">
                  {searchResults.map((r) => (
                    <button
                      key={`${r.path}-${r.title}`}
                      type="button"
                      onClick={() => goToResult(r.path)}
                      className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between gap-3"
                    >
                      <span className="font-medium">{r.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.path}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              {/* Mobile search */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/20"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                title="Search"
              >
                <Search />
              </Button>

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

        {/* Mobile search dialog */}
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Search</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search menus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitSearch();
                    }
                  }}
                  autoFocus
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSearchQuery("");
                  }}
                  aria-label="Clear search"
                  title="Clear"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {searchText && (
                <div className="text-sm text-muted-foreground">
                  {navLoading ? "Loading..." : `${searchResults.length} results`}
                </div>
              )}

              <div className="max-h-[45vh] overflow-auto rounded-md border">
                {searchText && searchResults.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    No results
                  </div>
                ) : (
                  searchResults.map((r) => (
                    <button
                      key={`${r.path}-${r.title}`}
                      type="button"
                      onClick={() => goToResult(r.path)}
                      className="w-full text-left px-3 py-2 hover:bg-muted flex flex-col gap-0.5"
                    >
                      <span className="font-medium">{r.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.path}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
