/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ChevronLeft, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useEmployeeData } from "@/components/employee_admin/services/useEmployeeData";
import { BasicInfoTab } from "@/components/employee_admin/tab/basic_info-tab";
import { DocumentTab } from "@/components/employee_admin/tab/document-tab";
import { EducationTab } from "@/components/employee_admin/tab/education-tab";
import { ExperienceTab } from "@/components/employee_admin/tab/experience-tab";
import { LanguageTab } from "@/components/employee_admin/tab/langauge-tab";
import { EmployeePreview } from "@/components/form/employeePreview";
import { type BasicInfoValues, basicInfoSchema } from "@/schema/employeeSchema";

export default function NewEmployeePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    loading,
    lookupData,
    filteredPositions,
    filteredScales,
    updateFilteredPositions,
    updateFilteredScales,
  } = useEmployeeData();

  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [completionProgress, setCompletionProgress] = useState(0);

  // Single form for all basic info
  const form = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema) as any,
    defaultValues: {
      // Personal
      firstName: "",
      lastName: "",
      fullNameAm: "",
      titleId: "",
      genderId: "",
      nationality: "",
      maritalStatus: "",
      dateOfBirthGrg: undefined,
      dateOfBirthEth: "",

      // Contact
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",

      // Employment
      employmentTypeId: "",
      hireDate: undefined,
      departmentId: "",
      positionId: "",
      gradeId: "",
      scaleId: "",
      branchId: "",
      supervisorId: "",

      // Compensation
      basicSalary: undefined,
      currency: "ETB",
      pfContRate: 0,
      tin: "",
      pensionPfNumber: "",
      bankAccount: "",

      // Experience
      yearsOfExperience: undefined,
      relevantExperience: false,

      // Status
      isActive: true,
    },
  });

  // Watch for grade changes to filter positions and scales
  const selectedGradeId = form.watch("gradeId");

  useEffect(() => {
    if (selectedGradeId) {
      updateFilteredPositions(selectedGradeId);
      updateFilteredScales(selectedGradeId);
    }
  }, [selectedGradeId, updateFilteredPositions, updateFilteredScales]);

  // Calculate completion progress
  useEffect(() => {
    const values = form.getValues();
    let completed = 0;
    const total = 20; // Total important fields

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
  }, [form.watch()]);

  const saveBasicInfo = async (data: BasicInfoValues) => {
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const companyId = user.companyId || "your-actual-company-id";

      if (!companyId) {
        toast({
          title: "Error",
          description: "Company ID not found. Please login again.",
          variant: "destructive",
        });
        return;
      }

      // Prepare payload
      const payload: any = {
        ...data,
        companyId,
        createdBy: user.id || "system",
        createdById: user.id || "system",
        requestStatus: "PENDING",
      };

      // Format dates
      if (data.dateOfBirthGrg) {
        payload.dateOfBirthGrg = format(data.dateOfBirthGrg, "yyyy-MM-dd");
      }
      if (data.hireDate) {
        payload.hireDate = format(data.hireDate, "yyyy-MM-dd");
      }

      console.log("Sending employee data:", payload);

      const response = await api.post("/employees", payload);
      console.log("emp", response.data);

      toast({
        title: "Success",
        description: "Employee created successfully",
      });

      navigate("/employees");
    } catch (error: any) {
      console.error("API Error:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create employee",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
              onClick={() => navigate("/employees")}
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Create New Employee
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4" />
                Complete the employee registration process
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Preview */}
          <div className="lg:col-span-1">
            <EmployeePreview
              form={form}
              lookupData={lookupData}
              completionProgress={completionProgress}
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
                <TabsTrigger
                  value="basic"
                  className="data-[state=active]:bg-white"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  className="data-[state=active]:bg-white"
                >
                  Experience
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="data-[state=active]:bg-white"
                >
                  Education
                </TabsTrigger>
                <TabsTrigger
                  value="languages"
                  className="data-[state=active]:bg-white"
                >
                  Languages
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="data-[state=active]:bg-white"
                >
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-6">
                <BasicInfoTab
                  form={form}
                  lookupData={lookupData}
                  filteredPositions={filteredPositions}
                  filteredScales={filteredScales}
                  selectedGradeId={selectedGradeId}
                  onSubmit={saveBasicInfo}
                  isSaving={saving}
                />
              </TabsContent>

              <TabsContent value="experience" className="mt-6">
                <ExperienceTab />
              </TabsContent>

              <TabsContent value="education" className="mt-6">
                <EducationTab />
              </TabsContent>

              <TabsContent value="languages" className="mt-6">
                <LanguageTab />
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <DocumentTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
