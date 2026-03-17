import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type ApiSuccess<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

export default function ResetPasswordPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const token = useMemo(() => params.get("token") || "", [params]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid link",
        description: "Reset token is missing.",
        variant: "destructive",
      });
    }
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({
        title: "Invalid link",
        description: "Reset token is missing.",
        variant: "destructive",
      });
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await api.post<ApiSuccess<null>>("/auth/reset-password", {
        token,
        newPassword,
      });
      toast({
        title: "Success",
        description: "Password reset successful. Please login.",
        variant: "success",
      });
      navigate("/");
    } catch (err) {
      toast({
        title: "Error",
        description:
          (err as { message?: string })?.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden">
        <CardHeader className="text-center py-6">
          <img
            src="/mk_logo.png"
            alt="MK Logo"
            className="w-20 h-20 mx-auto mb-3"
          />
          <CardTitle className="text-2xl font-bold text-gray-800">
            Reset password
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Enter your new password.
          </div>
        </CardHeader>

        <CardContent className="p-8 bg-white">
          <form onSubmit={submit}>
            <FieldGroup className="space-y-6">
              <Field>
                <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm new password
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Field>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-secondary-foreground text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300"
              >
                {loading ? "Updating..." : "Update password"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Link to="/" className="hover:underline">
                  Back to login
                </Link>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

