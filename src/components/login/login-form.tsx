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
  const { toast } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email: username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      window.location.href = "/hr-admin/dashboard";
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
            src="/mk_logo.png"
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
                <a href="/forgot-password" className="hover:text-green-700">
                  Forgot password?
                </a>
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
