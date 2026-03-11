/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
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

  return (
    <Card className="sticky top-4 shadow-lg border-t-4 border-t-primary">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4 border-4 border-primary/10">
            <AvatarFallback className="bg-primary/5 text-primary text-2xl font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

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
