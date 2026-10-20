/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCompanyBranding } from "@/services/company-branding";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Shield,
  KeyRound,
  Sparkles,
} from "lucide-react";

const DEV_CREDENTIALS = [
  {
    role: "System Admin",
    badge: "Super Admin",
    email: "admin@erp.com",
    password: "Admin@123",
  },
];

export function LoginForm({ className }: { className?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const branding = useCompanyBranding();

  const isDev =
    import.meta.env.VITE_APP_ENV === "DEV" || import.meta.env.DEV;

  const handleQuickFill = (email: string, pass: string, roleName: string) => {
    setUsername(email);
    setPassword(pass);
    setError("");
    toast.info(`Filled ${roleName} credentials`, {
      description: email,
      duration: 2000,
    });
  };

  const normalizePath = (path: string): string => {
    if (!path || !path.startsWith("/")) return path;
    const p = path.replace(/^\/+/, "/");
    if (p === "/dashboard") return "/system-admin/dashboard";
    if (p === "/users") return "/system-admin/users";
    if (p === "/roles") return "/system-admin/roles";
    if (p === "/employees") return "/hr/employees";
    return p;
  };

  const pickDashboardPath = (items: any[]): string => {
    const flat: any[] = [];
    const walk = (arr: any[]) => {
      for (const it of arr || []) {
        if (!it || it.isActive === false) continue;
        flat.push(it);
        if (Array.isArray(it.children) && it.children.length) walk(it.children);
      }
    };
    walk(items);

    const dashboard =
      flat.find((i) => typeof i.path === "string" && /dashboard/i.test(i.path)) ||
      flat.find((i) => typeof i.title === "string" && /dashboard/i.test(i.title)) ||
      flat.find((i) => typeof i.id === "string" && /dashboard/i.test(i.id));

    if (dashboard?.path) return normalizePath(dashboard.path);

    const firstWithPath = flat.find(
      (i) => typeof i.path === "string" && i.path.startsWith("/"),
    );
    return firstWithPath?.path
      ? normalizePath(firstWithPath.path)
      : "/system-admin/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data: { user: any; token: string };
      }>("/auth/login", {
        email: username.trim(),
        password,
      });

      const body = (response && typeof response === "object" ? response : {}) as any;
      const token = body?.data?.token ?? body?.token;
      const user = body?.data?.user ?? body?.user;

      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      toast.success("Welcome back!", {
        description: `Logged in as ${user?.firstName || user?.name || user?.email || "User"}`,
      });

      // Redirect to dynamic permitted module
      try {
        const navRes = await api.get<any>("/navigation");
        const items = navRes?.data?.items ?? navRes?.items ?? [];
        const target = pickDashboardPath(Array.isArray(items) ? items : []);
        navigate(target || "/system-admin/dashboard", { replace: true });
      } catch {
        navigate("/system-admin/dashboard", { replace: true });
      }
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        "Invalid email or password. Please try again.";
      setError(msg);
      toast.error("Login failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/15 backdrop-blur-md border border-rose-400/30 flex items-start gap-2.5 text-white animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 text-rose-300 mt-0.5 shrink-0" />
          <div className="text-xs font-medium leading-relaxed">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email or Username */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-medium text-white/90 mb-1.5"
          >
            Email or Username
          </label>
          <div className="relative group">
            <input
              id="login-email"
              name="email"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. admin@erp.com"
              className="w-full pl-4 pr-10 py-3 text-sm rounded-xl bg-white text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 transition-all font-medium"
              style={{
                outlineColor: branding.primaryColor,
              }}
            />
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 transition-colors">
              <Mail className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-medium text-white/90"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-white/80 hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="••••••••••••"
              className="w-full pl-4 pr-10 py-3 text-sm rounded-xl bg-white text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 transition-all font-mono tracking-wide"
              style={{
                outlineColor: branding.primaryColor,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-white/90 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-white/40 bg-white/20 focus:ring-0 cursor-pointer"
              style={{ color: branding.primaryColor }}
            />
            <span>Remember me</span>
          </label>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white shadow-md hover:brightness-110 active:brightness-90 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            style={{
              backgroundColor: branding.primaryColor,
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Brand Security Note */}
        <div className="pt-2">
          <div className="w-full py-2.5 px-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center text-xs text-white/90 flex items-center justify-center gap-2">
            <Shield className="w-3.5 h-3.5 text-white/80 shrink-0" />
            <span className="font-medium text-[11px]">
              {branding.companyName} Enterprise ERP Portal
            </span>
          </div>
        </div>

        {/* DEV ONLY: Quick Credential Fill */}
        {isDev && (
          <div className="mt-4 pt-3 border-t border-white/15">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                <Sparkles className="w-3 h-3 text-amber-300" />
                DEV Environment:
              </span>
              <span className="text-[10px] text-white/60">
                Click to Auto-Fill
              </span>
            </div>
            {DEV_CREDENTIALS.map((cred) => (
              <button
                key={cred.role}
                type="button"
                onClick={() => handleQuickFill(cred.email, cred.password, cred.role)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white text-xs transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span className="font-semibold text-xs text-white">
                    {cred.role} ({cred.badge})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-sky-200">
                  {cred.email}
                </span>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
