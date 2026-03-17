import { useEffect, useState } from "react";

import api from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return (parts[0][0] || "U").toUpperCase();
  return `${parts[0][0] || "U"}${parts[1][0] || ""}`.toUpperCase();
}

export default function MyProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<ApiSuccess<{ user: CurrentUser }>>(
          "/auth/profile",
        );
        if (!cancelled) setMe(res.data?.user || null);
      } catch (e) {
        if (!cancelled) setMe(null);
        toast({
          title: "Error",
          description:
            (e as { message?: string })?.message || "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const name =
    [me?.firstName, me?.lastName].filter(Boolean).join(" ") || me?.email || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{initialsFrom(name || "User")}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-2xl font-bold truncate">
            {loading ? "Loading..." : name || "My profile"}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {me?.email || ""}
          </div>
        </div>
        <div className="ml-auto">
          {me?.role ? <Badge variant="secondary">{me.role}</Badge> : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={me?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={me?.phone || ""} disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>First name</Label>
              <Input value={me?.firstName || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Last name</Label>
              <Input value={me?.lastName || ""} disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input value={me?.employee?.employeeId || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={me?.employee?.company?.name || ""} disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input value={me?.employee?.branch?.name || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input value={me?.employee?.department?.name || ""} disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

