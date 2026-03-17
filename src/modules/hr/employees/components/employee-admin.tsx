/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ChevronLeft, Building2, FileCheck, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useEmployeeData } from "@/modules/hr/employees/services/useEmployeeData";
import { BasicInfoTab } from "@/modules/hr/employees/tabs/basic_info-tab";
import { DocumentTab } from "@/modules/hr/employees/tabs/document-tab";
import { EducationTab } from "@/modules/hr/employees/tabs/education-tab";
import { ExperienceTab } from "@/modules/hr/employees/tabs/experience-tab";
import { LanguageTab } from "@/modules/hr/employees/tabs/langauge-tab";
import { EmployeePreview } from "@/modules/hr/employees/components/employeePreview";
import {
  type BasicInfoValues,
  basicInfoSchema,
} from "@/modules/hr/employees/schema/employeeSchema";

interface Employee extends BasicInfoValues {
  id: string;
  employeeId: string;
  requestStatus: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export default function EmployeeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isEditMode = !!id;
  const [formVersion, setFormVersion] = useState(0);

  const {
    loading: dataLoading,
    lookupData,
    filteredPositions,
    filteredScales,
    updateFilteredPositions,
    updateFilteredScales,
  } = useEmployeeData();

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "basic",
  );
  const [completionProgress, setCompletionProgress] = useState(0);
  const [employeeId, setEmployeeId] = useState<string | null>(id || null);
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [canEditBasicInfo, setCanEditBasicInfo] = useState(true);

  // Form for basic info
  const form = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      fullNameAm: "",
      titleId: "",
      genderId: "",
      nationality: "",
      maritalStatus: "",
      dateOfBirthGrg: undefined,
      dateOfBirthEth: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      employmentTypeId: "",
      hireDate: undefined,
      departmentId: "",
      positionId: "",
      gradeId: "",
      scaleId: "",
      branchId: "",
      supervisorId: "",
      basicSalary: undefined,
      currency: "ETB",
      pfContRate: 0,
      tin: "",
      pensionPfNumber: "",
      bankAccount: "",
      yearsOfExperience: undefined,
      relevantExperience: false,
      isActive: true,
    },
  });

  // Watch for grade changes
  const selectedGradeId = useWatch({
    control: form.control,
    name: "gradeId",
  });
  // Fetch employee data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchEmployeeData(id);
    }
  }, [id, isEditMode]);

  // Re-filter positions/scales once lookupData is ready (important for edit mode)
  useEffect(() => {
    if (!dataLoading && selectedGradeId) {
      updateFilteredPositions(selectedGradeId);
      updateFilteredScales(selectedGradeId);
    }
  }, [dataLoading]);

  const fetchEmployeeData = async (employeeId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/employees/${employeeId}`);
      console.log("API Response:", response);

      // Response can be either { data: { employee } } or { employee } or the employee itself.
      const employee = response?.data?.employee ?? response?.data ?? response;
      console.log("Employee data:", employee);

      setEmployeeData(employee);
      setEmployeeId(employee.id);

      // Check if user can edit basic info (only DRAFT or PENDING)
      setCanEditBasicInfo(
        employee.requestStatus === "DRAFT" ||
          employee.requestStatus === "PENDING",
      );

      // Format dates for the form
      const formData: any = {
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        fullNameAm: employee.fullNameAm || "",
        titleId: employee.titleId || "",
        genderId: employee.genderId || "",
        nationality: employee.nationality || "",
        maritalStatus: employee.maritalStatus || "",
        dateOfBirthGrg: employee.dateOfBirthGrg
          ? new Date(employee.dateOfBirthGrg)
          : undefined,
        dateOfBirthEth: employee.dateOfBirthEth || "",
        phone: employee.phone || "",
        email: employee.email || "",
        address: employee.address || "",
        city: employee.city || "",
        state: employee.state || "",
        country: employee.country || "",
        postalCode: employee.postalCode || "",
        employmentTypeId: employee.employmentTypeId || "",
        hireDate: employee.hireDate ? new Date(employee.hireDate) : undefined,
        departmentId: employee.departmentId || "",
        positionId: employee.positionId || "",
        gradeId: employee.gradeId || "",
        scaleId: employee.scaleId || "",
        branchId: employee.branchId || "",
        supervisorId: employee.supervisorId || "",
        basicSalary: employee.basicSalary
          ? Number(employee.basicSalary)
          : undefined,
        currency: employee.currency || "ETB",
        pfContRate: employee.pfContRate || 0,
        tin: employee.tin || "",
        pensionPfNumber: employee.pensionPfNumber || "",
        bankAccount: employee.bankAccount || "",
        yearsOfExperience: employee.yearsOfExperience || undefined,
        relevantExperience: employee.relevantExperience || false,
        isActive: employee.isActive ?? true,
      };

      console.log("Form data to reset:", formData);
      form.reset(formData);

      // Force re-render
      setFormVersion((prev) => prev + 1);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch employee data",
        variant: "destructive",
      });
      navigate("/hr/employees");
    } finally {
      setLoading(false);
    }
  };

  // Filter positions and scales when grade changes
  useEffect(() => {
    if (selectedGradeId) {
      updateFilteredPositions(selectedGradeId);
      updateFilteredScales(selectedGradeId);
    }
  }, [selectedGradeId, updateFilteredPositions, updateFilteredScales]);

  // Calculate completion progress via subscription (avoids infinite re-render)
  useEffect(() => {
    const calcProgress = (values: BasicInfoValues) => {
      let completed = 0;
      const total = 20;

      if (values.firstName) completed++;
      if (values.lastName) completed++;
      if (values.email) completed++;
      if (values.phone) completed++;
      if (values.genderId) completed++;
      if (values.nationality) completed++;
      if (values.maritalStatus) completed++;
      if (values.dateOfBirthGrg) completed++;
      if (values.employmentTypeId) completed++;
      if (values.departmentId) completed++;
      if (values.positionId) completed++;
      if (values.gradeId) completed++;
      if (values.scaleId) completed++;
      if (values.branchId) completed++;
      if (values.supervisorId) completed++;
      if (values.basicSalary) completed++;
      if (values.tin) completed++;
      if (values.pensionPfNumber) completed++;
      if (values.bankAccount) completed++;
      if (values.yearsOfExperience) completed++;

      setCompletionProgress(Math.round((completed / total) * 100));
    };

    // Calculate once on mount / form reset
    calcProgress(form.getValues());

    // Then subscribe to future changes
    const subscription = form.watch((values) => {
      calcProgress(values as BasicInfoValues);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Save basic info (Create or Update)
  const saveBasicInfo = async (data: BasicInfoValues) => {
    if (isEditMode && !canEditBasicInfo) {
      toast({
        title: "Error",
        description: "Cannot edit approved employee information",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const payload: any = {
        ...data,
        ...(!isEditMode && { createdBy: user.id || "system" }),
        ...(!isEditMode && { createdById: user.id || "system" }),
        ...(!isEditMode && { requestStatus: "PENDING" }),
      };

      // Do not send empty strings for optional UUID fields (backend treats "" as invalid)
      for (const k of ["titleId", "genderId", "supervisorId", "gradeId"]) {
        if (payload[k] === "") delete payload[k];
      }

      if (data.dateOfBirthGrg) {
        payload.dateOfBirthGrg = format(data.dateOfBirthGrg, "yyyy-MM-dd");
      }
      if (data.hireDate) {
        payload.hireDate = format(data.hireDate, "yyyy-MM-dd");
      }

      if (isEditMode && employeeId) {
        await api.put(`/employees/${employeeId}`, payload);
        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      } else {
        const response = await api.post("/employees", payload);
        const newEmployeeId =
          response?.data?.employee?.id ||
          response?.employee?.id ||
          response?.data?.data?.employee?.id ||
          response?.data?.employee?.id;
        if (newEmployeeId) {
          setEmployeeId(newEmployeeId);
          // Ensure other tabs become enabled immediately
          setEmployeeData((prev) =>
            prev
              ? prev
              : ({
                  id: newEmployeeId,
                  employeeId: "",
                  requestStatus: "PENDING",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  ...(data as any),
                } as any),
          );
        }
        toast({
          title: "Success",
          description: "Employee created successfully",
        });
      }

      setActiveTab("experience");
    } catch (error: any) {
      const details = error?.details;
      const detailsMsg = Array.isArray(details)
        ? details.map((e) => `${e.field}: ${e.message}`).join(", ")
        : typeof details === "string"
          ? details
          : "";
      toast({
        title: "Error",
        description:
          detailsMsg ||
          error?.message ||
          `Failed to ${isEditMode ? "update" : "create"} employee`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Submit for approval
  const handleSubmitForApproval = async () => {
    if (!employeeId) {
      toast({
        title: "Error",
        description: "Please save basic information first",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/employees/${employeeId}/approve`, {});
      toast({
        title: "Success",
        description: "Employee submitted for approval",
      });
      navigate("/hr/employees");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/hr/employees")}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {isEditMode ? "Edit Employee" : "Create New Employee"}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4" />
                {isEditMode
                  ? "Update employee information"
                  : "Complete the employee registration process"}
              </p>
            </div>
          </div>
          {employeeData && (
            <Badge
              variant={
                employeeData.requestStatus === "APPROVED"
                  ? "default"
                  : employeeData.requestStatus === "PENDING"
                    ? "outline"
                    : "secondary"
              }
              className="px-3 py-1"
            >
              Status: {employeeData.requestStatus}
            </Badge>
          )}
        </div>

        {/* Warning for approved employees */}
        {isEditMode && !canEditBasicInfo && (
          <div className="border border-yellow-500 bg-yellow-50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-yellow-800">Read-Only Mode</h5>
              <p className="text-sm text-yellow-700">
                This employee has been approved. Basic information cannot be
                edited. You can still add additional information like
                Experience, Education, Languages, and Documents.
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Preview */}
          <div className="lg:col-span-1">
            <EmployeePreview
              form={form}
              lookupData={lookupData}
              completionProgress={completionProgress}
              employeeId={employeeId}
              employeeData={employeeData}
            />
          </div>

          {/* Tabs */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-5 w-full gap-1 p-1 bg-muted/50">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger
                  value="experience"
                  disabled={!employeeId || employeeData?.requestStatus !== "APPROVED"}
                >
                  Experience
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  disabled={!employeeId || employeeData?.requestStatus !== "APPROVED"}
                >
                  Education
                </TabsTrigger>
                <TabsTrigger
                  value="languages"
                  disabled={!employeeId || employeeData?.requestStatus !== "APPROVED"}
                >
                  Languages
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  disabled={!employeeId || employeeData?.requestStatus !== "APPROVED"}
                >
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-6">
                <BasicInfoTab
                  key={formVersion}
                  form={form}
                  lookupData={lookupData}
                  onSubmit={saveBasicInfo}
                  isSaving={saving}
                  isEdit={isEditMode}
                  readOnly={isEditMode && !canEditBasicInfo}
                />
              </TabsContent>

              <TabsContent value="experience" className="mt-6">
                {employeeId && employeeData?.requestStatus === "APPROVED" ? (
                  <ExperienceTab key={employeeId} employeeId={employeeId} />
                ) : (
                  <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                    {employeeId
                      ? "Employee must be approved before you can fill this tab."
                      : "Save Basic Info first to continue."}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="education" className="mt-6">
                {employeeId && employeeData?.requestStatus === "APPROVED" ? (
                  <EducationTab key={employeeId} employeeId={employeeId} />
                ) : (
                  <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                    {employeeId
                      ? "Employee must be approved before you can fill this tab."
                      : "Save Basic Info first to continue."}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="languages" className="mt-6">
                {employeeId && employeeData?.requestStatus === "APPROVED" ? (
                  <LanguageTab key={employeeId} employeeId={employeeId} />
                ) : (
                  <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                    {employeeId
                      ? "Employee must be approved before you can fill this tab."
                      : "Save Basic Info first to continue."}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                {employeeId && employeeData?.requestStatus === "APPROVED" ? (
                  <DocumentTab key={employeeId} employeeId={employeeId} />
                ) : (
                  <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                    {employeeId
                      ? "Employee must be approved before you can fill this tab."
                      : "Save Basic Info first to continue."}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Bottom Action Bar */}
        {employeeId &&
          activeTab !== "basic" &&
          employeeData?.requestStatus !== "APPROVED" && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-10">
              <div className="container mx-auto flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/hr/employees")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitForApproval}
                  disabled={submitting}
                  className="bg-gradient-to-r from-green-600 to-green-500"
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  Submit for Approval
                </Button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
