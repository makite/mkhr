/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Hash,
  CreditCard,
  User,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullNameAm?: string;
  titleId?: string;
  genderId?: string;
  dateOfBirthGrg?: string;
  dateOfBirthEth?: string;
  nationality?: string;
  maritalStatus?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  employmentTypeId?: string;
  hireDate?: string;
  departmentId?: string;
  positionId?: string;
  gradeId?: string;
  scaleId?: string;
  branchId?: string;
  supervisorId?: string;
  basicSalary?: number;
  currency?: string;
  pfContRate?: number;
  tin?: string;
  pensionPfNumber?: string;
  bankAccount?: string;
  yearsOfExperience?: number;
  relevantExperience?: boolean;
  requestStatus: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  // Relations
  title?: { id: string; value: string };
  gender?: { id: string; value: string };
  nationalityRel?: { id: string; value: string };
  maritalStatusRel?: { id: string; value: string };
  employmentType?: { id: string; value: string };
  department?: { id: string; name: string; code: string };
  branch?: { id: string; name: string; code: string };
  positionRef?: { id: string; name: string; code: string };
  grade?: { id: string; name: string; level: number };
  scale?: { id: string; name: string; stepNumber: number };
  supervisor?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    positionRef?: { name: string };
  };
  createdByUser?: { id: string; email: string };
  approvedByUser?: { id: string; email: string };
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    employee: Employee;
  };
  timestamp: string;
}

const getStatusBadge = (status: string) => {
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
      icon: <Clock className="h-4 w-4" />,
    },
    PENDING: {
      label: "Pending",
      variant: "outline",
      icon: <AlertCircle className="h-4 w-4" />,
    },
    APPROVED: {
      label: "Approved",
      variant: "default",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    REJECTED: {
      label: "Rejected",
      variant: "destructive",
      icon: <XCircle className="h-4 w-4" />,
    },
    CANCELLED: {
      label: "Cancelled",
      variant: "outline",
      icon: <XCircle className="h-4 w-4" />,
    },
  };
  return statusMap[status] || statusMap.DRAFT;
};

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const response: ApiResponse = await api.get(`/employees/${id}`);
      setEmployee(response.data.employee);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch employee",
        variant: "destructive",
      });
      navigate("/employees");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/employees/${id}/edit`);
  };

  const handleApprove = async () => {
    if (
      !confirm(`Approve employee ${employee?.firstName} ${employee?.lastName}?`)
    )
      return;
    try {
      await api.put(`/employees/${id}/approve`, {});
      toast({
        title: "Success",
        description: "Employee approved successfully",
      });
      fetchEmployee();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    const reason = prompt("Please enter rejection reason:");
    if (!reason) return;
    try {
      await api.put(`/employees/${id}/reject`, { reason });
      toast({ title: "Success", description: "Employee rejected" });
      fetchEmployee();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/employees")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!employee) return null;

  const status = getStatusBadge(employee.requestStatus);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/employees")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span>{employee.employeeId}</span>
              <Badge
                variant={status.variant}
                className="flex items-center gap-1"
              >
                {status.icon}
                {status.label}
              </Badge>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {(employee.requestStatus === "DRAFT" ||
            employee.requestStatus === "PENDING") && (
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {employee.requestStatus === "PENDING" && (
            <>
              <Button variant="default" onClick={handleApprove}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4 border-4 border-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                  {employee.firstName?.[0]}
                  {employee.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-muted-foreground">
                {employee.positionRef?.name || "No position"}
              </p>

              {employee.fullNameAm && (
                <p className="text-sm text-muted-foreground mt-1">
                  {employee.fullNameAm}
                </p>
              )}

              <Separator className="my-4" />

              <div className="w-full space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee ID:</span>
                  <span className="font-mono font-medium">
                    {employee.employeeId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span>{employee.department?.name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch:</span>
                  <span>{employee.branch?.name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grade:</span>
                  <span>{employee.grade?.name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scale:</span>
                  <span>{employee.scale?.name || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salary:</span>
                  <span className="font-medium">
                    {employee.basicSalary
                      ? `${employee.currency || "ETB"} ${employee.basicSalary.toLocaleString()}`
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Details Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="compensation">Compensation</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            {/* Personal Tab */}
            <TabsContent value="personal" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" /> Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium">
                        {employee.title?.value || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">
                        {employee.gender?.value || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Nationality
                      </p>
                      <p className="font-medium">
                        {employee.nationalityRel?.value || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Marital Status
                      </p>
                      <p className="font-medium">
                        {employee.maritalStatusRel?.value || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date of Birth (Gregorian)
                      </p>
                      <p className="font-medium">
                        {employee.dateOfBirthGrg
                          ? format(new Date(employee.dateOfBirthGrg), "PPP")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date of Birth (Ethiopian)
                      </p>
                      <p className="font-medium">
                        {employee.dateOfBirthEth || "-"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> Contact Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Phone
                        </p>
                        <p className="font-medium">{employee.phone || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Email
                        </p>
                        <p className="font-medium">{employee.email || "-"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {[
                          employee.address,
                          employee.city,
                          employee.state,
                          employee.country,
                          employee.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Employment Tab */}
            <TabsContent value="employment" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" /> Employment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Employment Type
                      </p>
                      <p className="font-medium">
                        {employee.employmentType?.value || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Hire Date</p>
                      <p className="font-medium">
                        {employee.hireDate
                          ? format(new Date(employee.hireDate), "PPP")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Department
                      </p>
                      <p className="font-medium">
                        {employee.department?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Position</p>
                      <p className="font-medium">
                        {employee.positionRef?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Grade</p>
                      <p className="font-medium">
                        {employee.grade
                          ? `${employee.grade.name} (Level ${employee.grade.level})`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Scale</p>
                      <p className="font-medium">
                        {employee.scale
                          ? `${employee.scale.name} (Step ${employee.scale.stepNumber})`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Branch</p>
                      <p className="font-medium">
                        {employee.branch?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Supervisor
                      </p>
                      <p className="font-medium">
                        {employee.supervisor
                          ? `${employee.supervisor.firstName} ${employee.supervisor.lastName}`
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {employee.yearsOfExperience !== undefined && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Years of Experience
                          </p>
                          <p className="font-medium">
                            {employee.yearsOfExperience}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Relevant Experience
                          </p>
                          <Badge
                            variant={
                              employee.relevantExperience
                                ? "default"
                                : "secondary"
                            }
                          >
                            {employee.relevantExperience ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compensation Tab */}
            <TabsContent value="compensation" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" /> Compensation & Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Basic Salary
                      </p>
                      <p className="font-medium text-lg">
                        {employee.basicSalary
                          ? `${employee.currency || "ETB"} ${employee.basicSalary.toLocaleString()}`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3 w-3" /> PF Contribution Rate
                      </p>
                      <p className="font-medium">{employee.pfContRate || 0}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        TIN (Tax ID)
                      </p>
                      <p className="font-medium">{employee.tin || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Pension/PF Number
                      </p>
                      <p className="font-medium">
                        {employee.pensionPfNumber || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> Bank Account
                      </p>
                      <p className="font-medium font-mono">
                        {employee.bankAccount || "-"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Tab */}
            <TabsContent value="audit" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Audit Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Created By
                      </p>
                      <p className="font-medium">
                        {employee.createdByUser?.email || "System"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Created At
                      </p>
                      <p className="font-medium">
                        {employee.createdAt
                          ? format(new Date(employee.createdAt), "PPP 'at' p")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="font-medium">
                        {employee.updatedAt
                          ? format(new Date(employee.updatedAt), "PPP 'at' p")
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {employee.requestStatus === "APPROVED" &&
                    employee.approvedAt && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Approved By
                            </p>
                            <p className="font-medium">
                              {employee.approvedByUser?.email || "System"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Approved At
                            </p>
                            <p className="font-medium">
                              {format(
                                new Date(employee.approvedAt),
                                "PPP 'at' p",
                              )}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                  {employee.requestStatus === "REJECTED" &&
                    employee.rejectedAt && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Rejected By
                            </p>
                            <p className="font-medium">
                              {employee.rejectedBy || "System"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Rejected At
                            </p>
                            <p className="font-medium">
                              {employee.rejectedAt
                                ? format(
                                    new Date(employee.rejectedAt),
                                    "PPP 'at' p",
                                  )
                                : "-"}
                            </p>
                          </div>
                          {employee.rejectionReason && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Rejection Reason
                              </p>
                              <p className="font-medium text-destructive">
                                {employee.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
