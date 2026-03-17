/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import type { BasicInfoValues } from "../schema/employeeSchema";
import type { EmployeeLookupData } from "../types/employee.type";
import type { UseFormReturn } from "react-hook-form";

interface EmployeePreviewProps {
  form: UseFormReturn<BasicInfoValues>;
  lookupData: EmployeeLookupData;
  completionProgress: number;
  employeeId?: string | null;
  employeeData?: any;
}

const getStatusBadge = (status?: string) => {
  const statusMap: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      icon: any;
    }
  > = {
    DRAFT: {
      label: "Draft",
      variant: "secondary",
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    PENDING: {
      label: "Pending",
      variant: "outline",
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
    },
    APPROVED: {
      label: "Approved",
      variant: "default",
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
    },
    REJECTED: {
      label: "Rejected",
      variant: "destructive",
      icon: <XCircle className="h-3 w-3 mr-1" />,
    },
  };
  return statusMap[status || "DRAFT"] || statusMap.DRAFT;
};

export const EmployeePreview = ({
  form,
  lookupData,
  completionProgress,
  employeeId,
  employeeData,
}: EmployeePreviewProps) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const resolveAssetUrl = (url: string | null) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const base = String(import.meta.env.VITE_API_BASE_URL || "");
    try {
      // If base is like http://localhost:5000/api, assets live at http://localhost:5000/
      const origin = new URL(base).origin;
      return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
    } catch {
      // Fallback: best-effort (keeps previous behavior)
      const origin = base.replace(/\/api\/?$/i, "");
      return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
    }
  };

  const withCacheBust = (url: string | null) => {
    if (!url) return null;
    const v = `v=${Date.now()}`;
    return url.includes("?") ? `${url}&${v}` : `${url}?${v}`;
  };

  // Use form values OR employeeData if available (for edit mode)
  const values = form.watch();

  // Determine which data to display (prefer employeeData for edit mode, form values for create mode)
  const firstName = employeeData?.firstName || values.firstName || "";
  const lastName = employeeData?.lastName || values.lastName || "";
  const positionId = employeeData?.positionId || values.positionId;
  const departmentId = employeeData?.departmentId || values.departmentId;
  const gradeId = employeeData?.gradeId || values.gradeId;
  const salary = employeeData?.basicSalary || values.basicSalary;
  const currency = employeeData?.currency || values.currency || "ETB";
  const requestStatus = employeeData?.requestStatus;

  // Find related data from lookup
  const position =
    lookupData.positions.find((p) => p.id === positionId) ||
    (employeeData?.positionRef
      ? { name: employeeData.positionRef.name }
      : null);
  const department =
    lookupData.departments.find((d) => d.id === departmentId) ||
    (employeeData?.department ? { name: employeeData.department.name } : null);
  const grade =
    lookupData.grades.find((g) => g.id === gradeId) ||
    (employeeData?.grade ? { name: employeeData.grade.name } : null);

  const getInitials = () => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`;
    if (firstName) return firstName[0];
    if (lastName) return lastName[0];
    return "?";
  };

  const status = requestStatus ? getStatusBadge(requestStatus) : null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!employeeId) {
        setPhotoUrl(null);
        return;
      }
      try {
        const res = await api.get(`/employees/${employeeId}/photo`);
        const url = res?.data?.photo?.url || res?.photo?.url || null;
        if (!cancelled) setPhotoUrl(withCacheBust(resolveAssetUrl(url)));
      } catch {
        if (!cancelled) setPhotoUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  async function compressImage(file: File, maxKB = 200): Promise<string> {
    const dataUrl = await fileToDataUrl(file);
    const img = document.createElement("img");
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });

    const maxSide = 512;
    let { width, height } = img;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, width, height);

    // try jpeg quality down until size ok
    let quality = 0.82;
    let out = canvas.toDataURL("image/jpeg", quality);
    while (out.length / 1024 > maxKB && quality > 0.35) {
      quality -= 0.08;
      out = canvas.toDataURL("image/jpeg", quality);
    }
    return out;
  }

  const onPickPhoto = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employeeId) return;
    try {
      setPhotoUploading(true);
      const dataUrl = await compressImage(file, 200);
      const res = await api.post(`/employees/${employeeId}/photo`, { dataUrl });
      const url = res?.data?.photo?.url || res?.photo?.url || null;
      setPhotoUrl(withCacheBust(resolveAssetUrl(url)));
      toast({
        title: "Success",
        description: "Employee photo updated",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setPhotoUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <Card className="sticky top-4 shadow-lg border-t-4 border-t-primary">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4 border-4 border-primary/10">
            {photoUrl ? <AvatarImage src={photoUrl} alt="Employee photo" /> : null}
            <AvatarFallback className="bg-primary/5 text-primary text-2xl font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />

          {employeeId && (
            <Button
              variant="outline"
              size="sm"
              onClick={onPickPhoto}
              disabled={photoUploading}
              className="mb-3"
            >
              {photoUploading ? "Uploading..." : photoUrl ? "Change photo" : "Upload photo"}
            </Button>
          )}

          <h3 className="font-semibold text-lg">
            {firstName || "First"} {lastName || "Last"}
          </h3>

          <p className="text-sm text-muted-foreground">
            {position?.name || "Position not set"}
          </p>

          {status && (
            <Badge
              variant={status.variant}
              className="mt-2 flex items-center gap-1"
            >
              {status.icon}
              {status.label}
            </Badge>
          )}

          {employeeId && (
            <p className="text-xs font-mono text-muted-foreground mt-1">
              ID: {employeeId.slice(0, 8)}
            </p>
          )}

          <Separator className="my-4" />

          <div className="w-full space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-medium">{department?.name || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Grade:</span>
              <span className="font-medium">{grade?.name || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Salary:</span>
              <span className="font-medium">
                {salary
                  ? `${currency} ${Number(salary).toLocaleString()}`
                  : "-"}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="w-full">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Profile Completion</span>
              <span className="font-semibold text-primary">
                {completionProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionProgress}%` }}
              />
            </div>
          </div>

          {!employeeId && completionProgress < 30 && (
            <div className="mt-4 w-full">
              <Badge
                variant="outline"
                className="w-full py-2 bg-amber-50 text-amber-700 border-amber-200"
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                Save basic info to continue
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
