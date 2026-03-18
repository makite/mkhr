/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { getCompanyLogoUrl } from "@/services/company-branding";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState<string>("/mk_logo.png");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setLogoUrl(getCompanyLogoUrl("/mk_logo.png"));
  }, []);

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
        if (!it) continue;
        if (it.isActive === false) continue;
        flat.push(it);
        if (Array.isArray(it.children) && it.children.length) walk(it.children);
      }
    };
    walk(items);

    const dashboard =
      flat.find(
        (i) => typeof i.path === "string" && /dashboard/i.test(i.path),
      ) ||
      flat.find(
        (i) => typeof i.title === "string" && /dashboard/i.test(i.title),
      ) ||
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
        email: username,
        password,
      });
      const body =
        response && typeof response === "object" ? (response as any) : {};
      const token = body?.data?.token ?? body?.token;
      const user = body?.data?.user ?? body?.user;
      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      // Redirect to first permitted dashboard/module from navigation API (api returns body directly)
      try {
        const navRes = await api.get<any>("/navigation");
        const items = navRes?.data?.items ?? navRes?.items ?? [];
        const target = pickDashboardPath(Array.isArray(items) ? items : []);
        navigate(target || "/system-admin/dashboard", { replace: true });
      } catch {
        navigate("/system-admin/dashboard", { replace: true });
      }

      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "success",
      });
    } catch (err: unknown) {
      setError((err as { message?: string }).message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4",
        className,
      )}
      {...props}
    >
      <Card className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden">
        <CardHeader className="text-center py-6">
          <img
            src={logoUrl}
            alt="MK Logo"
            className="w-24 h-24 mx-auto mb-4"
          />
          <CardTitle className="text-2xl font-bold text-gray-800">
            Login to Your Account
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8 bg-white">
          <form onSubmit={handleSubmit}>
            <FieldGroup className="space-y-6">
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin@mk.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label="show password"
                      title="show password"
                      size="icon-xs"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </Field>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-600"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="hover:text-green-700">
                  Forgot password?
                </Link>
              </div>

              {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

              <Field>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-secondary-foreground text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
