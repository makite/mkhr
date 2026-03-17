import { useState } from "react";
import { Link, useNavigate } from "react-router";

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

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post<ApiSuccess<null>>("/auth/request-password-reset", { email });
      toast({
        title: "Check your email",
        description: "If this email exists, you will receive a reset link shortly.",
        variant: "success",
      });
      navigate("/");
    } catch (err) {
      toast({
        title: "Error",
        description: (err as { message?: string })?.message || "Failed to send reset link",
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
            Forgot password
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            We’ll email you a reset link.
          </div>
        </CardHeader>

        <CardContent className="p-8 bg-white">
          <form onSubmit={submit}>
            <FieldGroup className="space-y-6">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@mk.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-secondary-foreground text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300"
              >
                {loading ? "Sending..." : "Send reset link"}
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

