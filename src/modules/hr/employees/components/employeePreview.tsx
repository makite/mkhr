import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { BasicInfoValues } from "@/modules/hr/employees/schema/employeeSchema";
import { AlertCircle } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { EmployeeLookupData } from "../types/employee.type";

interface EmployeePreviewProps {
  form: UseFormReturn<BasicInfoValues>;
  lookupData: EmployeeLookupData;
  completionProgress: number;
}

export const EmployeePreview = ({
  form,
  lookupData,
  completionProgress,
}: EmployeePreviewProps) => {
  const values = form.watch();

  const firstName = values.firstName;
  const lastName = values.lastName;
  const positionId = values.positionId;
  const departmentId = values.departmentId;
  const gradeId = values.gradeId;
  const salary = values.basicSalary;

  const position = lookupData.positions.find((p) => p.id === positionId);
  const department = lookupData.departments.find((d) => d.id === departmentId);
  const grade = lookupData.grades.find((g) => g.id === gradeId);

  const getInitials = () => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`;
    if (firstName) return firstName[0];
    if (lastName) return lastName[0];
    return "?";
  };

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
                {salary ? `${values.currency} ${salary.toLocaleString()}` : "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline" className="bg-yellow-50">
                Draft
              </Badge>
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
            <p className="text-xs text-muted-foreground mt-2">
              {completionProgress < 50
                ? "Add more details to complete profile"
                : completionProgress < 80
                  ? "Getting there! Add remaining details"
                  : "Almost complete!"}
            </p>
          </div>

          {completionProgress < 30 && (
            <div className="mt-4 w-full">
              <Badge
                variant="outline"
                className="w-full py-2 bg-amber-50 text-amber-700 border-amber-200 gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Please fill required fields
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
