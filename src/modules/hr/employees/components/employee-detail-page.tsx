/* eslint-disable @typescript-eslint/no-unused-vars */
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
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormDialog } from "@/components/shared/form-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ro } from "date-fns/locale";
import { useEmployeeData } from "@/modules/hr/employees/services/useEmployeeData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EmployeeAction = {
  id: string;
  employeeId: string;
  type: "PROMOTION" | "SALARY_INCREMENT";
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  effectiveDate: string;
  requestedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  payload: any;
};

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
  isActive?: boolean;
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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [actions, setActions] = useState<EmployeeAction[]>([]);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const hasPendingAction = actions.some((a) => a.status === "PENDING");
  const [actionDetailOpen, setActionDetailOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any | null>(null);

  const { loading: lookupLoading, lookupData } = useEmployeeData();

  // Rotation context and auto-advance
  const [rotation, setRotation] = useState<{
    ids: string[];
    index: number;
  } | null>(null);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(() => {
    try {
      return (
        (sessionStorage.getItem("employeeRotation:autoAdvance") ?? "true") ===
        "true"
      );
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      const ctx = JSON.parse(
        sessionStorage.getItem("employeeRotation") || "null",
      );
      if (ctx && Array.isArray(ctx.ids)) {
        setRotation({ ids: ctx.ids, index: Math.max(0, ctx.index || 0) });
      }
    } catch (error) {
      // Optionally handle error
    }
  }, []);

  useEffect(() => {
    if (rotation && id) {
      const idx = rotation.ids.indexOf(id);
      if (idx >= 0 && idx !== rotation.index) {
        setRotation({ ...rotation, index: idx });
      }
    }
  }, [id]);

  const gotoIndex = (idx: number) => {
    if (!rotation || rotation.ids.length === 0) return;
    const len = rotation.ids.length;
    const nextIdx = ((idx % len) + len) % len;
    const nextId = rotation.ids[nextIdx];
    navigate(`/hr/employees/${nextId}`);
  };

  const gotoPrev = () => gotoIndex((rotation?.index ?? 0) - 1);
  const gotoNext = () => gotoIndex((rotation?.index ?? 0) + 1);

  const setAutoAdvancePersist = (val: boolean) => {
    setAutoAdvance(val);
    try {
      sessionStorage.setItem(
        "employeeRotation:autoAdvance",
        val ? "true" : "false",
      );
    } catch (error) {
      // Optionally handle error
    }
  };

  // Permission helpers (role-based)
  const getUserRoles = (): string[] => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const roles = Array.isArray(user.roles)
        ? user.roles
        : user.role
          ? [user.role]
          : [];
      return roles.filter(Boolean);
    } catch {
      return [];
    }
  };
  // For now, enable all actions (Super Admin mode). Replace with real permission checks later.
  const roles = getUserRoles();
  console.log("Role:", roles);

  const currentUserId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return String(user.id || "");
    } catch {
      return "";
    }
  })();

  const canApprove = true;
  const canEditApproved = true;
  const canPromote = true;
  const canIncrement = true;
  const canTerminate = true;
  const canReinstate = true;
  // Operation dialog state
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promoteValues, setPromoteValues] = useState({
    positionId: "",
    branchId: "",
    dutyStationId: "",
    departmentId: "",
    promotionReason: "PROMOTION",
    gradeId: "",
    scaleId: "",
    basicSalary: "",
    effectiveDate: "",
    note: "",
  });

  const [incrementOpen, setIncrementOpen] = useState(false);
  const [incrementValues, setIncrementValues] = useState({
    incrementDate: "",
    reason: "",
    incrementMode: "AMOUNT",
    incrementAmount: "",
    toScaleId: "",
    percentage: "",
    newBasicSalary: "",
  });

  const [terminateOpen, setTerminateOpen] = useState(false);
  const [terminateValues, setTerminateValues] = useState({
    applicationDate: "",
    resignationDate: "",
    reasonId: "",
    noticeDays: 60,
    remark: "",
  });

  const [reinstateOpen, setReinstateOpen] = useState(false);
  const [reinstateValues, setReinstateValues] = useState({
    reinstateDate: "",
    remark: "",
  });

  const [terminationReasons, setTerminationReasons] = useState<
    Array<{ id: string; value: string }>
  >([]);

  const latestTermination = (() => {
    const approved = actions
      .filter((a: any) => a.type === "TERMINATION" && a.status === "APPROVED")
      .sort(
        (a: any, b: any) =>
          new Date(b.effectiveDate).getTime() -
          new Date(a.effectiveDate).getTime(),
      );
    return approved[0] || null;
  })();

  const actionTypeLabel = (t: string) =>
    t === "PROMOTION"
      ? "Promotion"
      : t === "SALARY_INCREMENT"
        ? "Salary Increment"
        : t === "TERMINATION"
          ? "Termination"
          : t === "REINSTATE"
            ? "Reinstate"
            : t || "Action";

  const nameById = (list: any[] | undefined, id?: string | null, key = "name") =>
    (list || []).find((x: any) => String(x.id) === String(id || ""))?.[key] ||
    null;

  const terminationReasonById = (id?: string | null) =>
    terminationReasons.find((r) => String(r.id) === String(id || ""))?.value ||
    null;

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // api client returns the JSON body (already response.data)
        const res: any = await api.get(
          "/lookups/TERMINATION_REASON?includeInactive=true",
        );
        let values = res?.data?.values || [];

        // If the lookup code differs, auto-discover from lookup types
        if (!Array.isArray(values) || values.length === 0) {
          const typesRes: any = await api.get(
            "/lookups/types?includeInactive=true",
          );
          const types: any[] = typesRes?.data?.types || [];
          const match =
            types.find((t) => String(t.code) === "TERMINATION_REASON") ||
            types.find((t) =>
              String(t.code || "")
                .toLowerCase()
                .includes("termination"),
            ) ||
            types.find((t) =>
              String(t.name || "")
                .toLowerCase()
                .includes("termination"),
            );

          if (match?.code) {
            const vRes: any = await api.get(
              `/lookups/${encodeURIComponent(String(match.code))}?includeInactive=true`,
            );
            values = vRes?.data?.values || [];
          }
        }

        if (!cancelled) setTerminationReasons(values);
      } catch (e: any) {
        toast({
          title: "Error",
          description: e?.message || "Failed to load termination reasons",
          variant: "destructive",
        });
        if (!cancelled) setTerminationReasons([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolveAssetUrl = (url: string | null) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const base = String(import.meta.env.VITE_API_BASE_URL || "");
    try {
      const origin = new URL(base).origin;
      return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
    } catch {
      const origin = base.replace(/\/api\/?$/i, "");
      return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
    }
  };

  const withCacheBust = (url: string | null) => {
    if (!url) return null;
    const v = `v=${Date.now()}`;
    return url.includes("?") ? `${url}&${v}` : `${url}?${v}`;
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const response: ApiResponse = await api.get(`/employees/${id}`);
      setEmployee(response.data.employee);
      try {
        const photoRes = await api.get(`/employees/${id}/photo`);
        const url = photoRes?.data?.photo?.url || photoRes?.photo?.url || null;
        setPhotoUrl(withCacheBust(resolveAssetUrl(url)));
      } catch {
        setPhotoUrl(null);
      }
      try {
        const actionsRes: any = await api.get(`/employees/${id}/actions`);
        setActions(actionsRes?.data?.actions || actionsRes?.actions || []);
      } catch {
        setActions([]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch employee",
        variant: "destructive",
      });
      navigate("/hr/employees");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/hr/employees/${id}/edit`);
  };

  const handleApprove = async () => {
    if (
      !confirm(`Approve employee ${employee?.firstName} ${employee?.lastName}?`)
    )
      return;
    try {
      await api.put(`/employees/${id}/approve`, {});
      toast({ title: "Success", description: "Employee approved" });
      if (autoAdvance) {
        gotoNext();
      } else {
        fetchEmployee();
      }
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
      if (autoAdvance) {
        gotoNext();
      } else {
        fetchEmployee();
      }
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
            onClick={() => navigate("/hr/employees")}
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
  const isTerminated =
    String((employee as any).empStatus || "").toUpperCase() === "TERMINATED" ||
    (employee as any).isActive === false;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/hr/employees")}
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
              {isTerminated && (
                <Badge variant="destructive" className="ml-1">
                  Employee is terminated
                </Badge>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Rotation controls */}
          {rotation && rotation.ids.length > 1 && (
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="outline"
                size="icon"
                onClick={gotoPrev}
                title="Previous (rotate)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={gotoNext}
                title="Next (rotate)"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 ml-2">
                <Checkbox
                  id="auto-advance"
                  checked={autoAdvance}
                  onCheckedChange={(v) => setAutoAdvancePersist(!!v)}
                />
                <label
                  htmlFor="auto-advance"
                  className="text-xs text-muted-foreground"
                >
                  Auto-advance
                </label>
              </div>
            </div>
          )}

          {/* Edit button */}
          {(employee.requestStatus === "DRAFT" ||
            employee.requestStatus === "PENDING" ||
            (employee.requestStatus === "APPROVED" && canEditApproved)) && (
            <Button onClick={handleEdit} disabled={isTerminated}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}

          {/* Approvals */}
          {employee.requestStatus === "PENDING" && canApprove && (
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

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Actions
                <MoreHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Employee Actions</DropdownMenuLabel>
              {!isTerminated && employee.requestStatus === "APPROVED" && canPromote && (
                <DropdownMenuItem
                  onClick={() => {
                    if (hasPendingAction) {
                      toast({
                        title: "Blocked",
                        description:
                          "You already have a pending request for this employee. Approve/Reject it first.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setEditingActionId(null);
                    setPromoteOpen(true);
                  }}
                >
                  Promote
                </DropdownMenuItem>
              )}
              {!isTerminated && employee.requestStatus === "APPROVED" && canIncrement && (
                <DropdownMenuItem
                  onClick={() => {
                    if (hasPendingAction) {
                      toast({
                        title: "Blocked",
                        description:
                          "You already have a pending request for this employee. Approve/Reject it first.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setEditingActionId(null);
                    setIncrementOpen(true);
                  }}
                >
                  Salary Increment
                </DropdownMenuItem>
              )}
              {!isTerminated && canTerminate && (
                <DropdownMenuItem
                  onClick={() => {
                    if (hasPendingAction) {
                      toast({
                        title: "Blocked",
                        description:
                          "You already have a pending request for this employee. Approve/Reject it first.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setEditingActionId(null);
                    setTerminateOpen(true);
                  }}
                >
                  Terminate
                </DropdownMenuItem>
              )}
              {isTerminated && canReinstate && (
                <DropdownMenuItem
                  onClick={() => {
                    if (hasPendingAction) {
                      toast({
                        title: "Blocked",
                        description:
                          "You already have a pending request for this employee. Approve/Reject it first.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setEditingActionId(null);
                    setReinstateOpen(true);
                  }}
                >
                  Reinstate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4 border-4 border-primary/10">
                {photoUrl ? (
                  <AvatarImage src={photoUrl} alt="Employee photo" />
                ) : null}
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

              <Separator className="my-4" />

              <div className="w-full text-left">
                <p className="text-sm font-semibold mb-2">Action History</p>
                {actions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No requests yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {actions.slice(0, 10).map((a: any) => (
                      <div
                        key={a.id}
                        className="rounded-md border p-2 text-sm flex items-center justify-between gap-2 cursor-pointer hover:bg-accent/30"
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedAction(a);
                          setActionDetailOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedAction(a);
                            setActionDetailOpen(true);
                          }
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {actionTypeLabel(String(a.type || ""))}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Effective:{" "}
                            {a.effectiveDate
                              ? format(new Date(a.effectiveDate), "PPP")
                              : "-"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              a.status === "APPROVED"
                                ? "default"
                                : a.status === "REJECTED"
                                  ? "destructive"
                                  : a.status === "PENDING"
                                    ? "outline"
                                    : "secondary"
                            }
                          >
                            {a.status}
                          </Badge>

                          {["PENDING", "REJECTED"].includes(String(a.status)) &&
                            String(a.requestedBy || "") === currentUserId && (
                              <>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  title="Edit"
                                  onClick={() => {
                                    setEditingActionId(a.id);
                                    if (a.type === "PROMOTION") {
                                      const p: any = a.payload || {};
                                      setPromoteValues((prev) => ({
                                        ...prev,
                                        positionId: String(
                                          p.toPositionId || "",
                                        ),
                                        branchId: String(p.toBranchId || ""),
                                        dutyStationId: String(
                                          p.toDutyStationId || "",
                                        ),
                                        departmentId: String(
                                          p.toDepartmentId || "",
                                        ),
                                        promotionReason: String(
                                          p.promotionReason || "PROMOTION",
                                        ),
                                        gradeId: String(p.toGradeId || ""),
                                        scaleId: String(p.toScaleId || ""),
                                        basicSalary:
                                          typeof p.newBasicSalary === "number"
                                            ? String(p.newBasicSalary)
                                            : "",
                                        effectiveDate: a.effectiveDate
                                          ? String(a.effectiveDate).slice(0, 10)
                                          : "",
                                        note: String(p.note || ""),
                                      }));
                                      setPromoteOpen(true);
                                    } else if (a.type === "TERMINATION") {
                                      const p: any = a.payload || {};
                                      setTerminateValues((prev) => ({
                                        ...prev,
                                        applicationDate: p.applicationDate
                                          ? String(p.applicationDate).slice(
                                              0,
                                              10,
                                            )
                                          : "",
                                        resignationDate: p.resignationDate
                                          ? String(p.resignationDate).slice(
                                              0,
                                              10,
                                            )
                                          : "",
                                        reasonId: String(p.reasonId || ""),
                                        noticeDays:
                                          typeof p.noticeDays === "number"
                                            ? p.noticeDays
                                            : 60,
                                        remark: String(p.remark || ""),
                                      }));
                                      setTerminateOpen(true);
                                    } else if (a.type === "REINSTATE") {
                                      const p: any = a.payload || {};
                                      setReinstateValues((prev) => ({
                                        ...prev,
                                        reinstateDate: a.effectiveDate
                                          ? String(a.effectiveDate).slice(0, 10)
                                          : "",
                                        remark: String(p.remark || ""),
                                      }));
                                      setReinstateOpen(true);
                                    } else {
                                      const p: any = a.payload || {};
                                      setIncrementValues((prev) => ({
                                        ...prev,
                                        incrementDate: a.effectiveDate
                                          ? String(a.effectiveDate).slice(0, 10)
                                          : "",
                                        reason: String(p.reason || ""),
                                        incrementMode: String(
                                          p.incrementMode || "AMOUNT",
                                        ),
                                        incrementAmount:
                                          typeof p.incrementedAmount ===
                                          "number"
                                            ? String(p.incrementedAmount)
                                            : "",
                                        toScaleId: String(p.toScaleId || ""),
                                        percentage: "",
                                        newBasicSalary:
                                          typeof p.newBasicSalary === "number"
                                            ? String(p.newBasicSalary)
                                            : "",
                                      }));
                                      setIncrementOpen(true);
                                    }
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="h-8 w-8"
                                  title="Cancel"
                                  onClick={async () => {
                                    if (!confirm("Cancel this request?"))
                                      return;
                                    try {
                                      await api.delete(
                                        `/employees/${id}/actions/${a.id}`,
                                      );
                                      toast({
                                        title: "Success",
                                        description: "Request cancelled",
                                      });
                                      fetchEmployee();
                                    } catch (e: any) {
                                      toast({
                                        title: "Error",
                                        description:
                                          e?.message ||
                                          "Failed to cancel request",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Operation Dialogs */}
      <FormDialog
        open={incrementOpen}
        onOpenChange={setIncrementOpen}
        title="Salary Increment"
        description="Update the employee's base salary"
        fields={[
          {
            name: "incrementDate",
            label: "Increment Date",
            type: "date",
            required: true,
          },
          {
            name: "reason",
            label: "Reason",
            type: "textarea",
          },
          {
            name: "incrementMode",
            label: "Increment Mode",
            type: "radio",
            required: true,
            options: [
              { value: "AMOUNT", label: "By Amount" },
              { value: "SCALE", label: "By Scale" },
              { value: "PERCENTAGE", label: "By Percentage" },
            ],
          },
          ...(incrementValues.incrementMode === "AMOUNT"
            ? [
                {
                  name: "incrementAmount",
                  label: "Incremented Amount",
                  type: "number",
                  required: true,
                },
              ]
            : []),
          ...(incrementValues.incrementMode === "PERCENTAGE"
            ? [
                {
                  name: "percentage",
                  label: "Percentage (%)",
                  type: "number",
                  required: true,
                },
              ]
            : []),
          ...(incrementValues.incrementMode === "SCALE"
            ? [
                {
                  name: "toScaleId",
                  label: "New Scale",
                  type: "select",
                  required: true,
                  options: (lookupData.scales || []).map((s: any) => ({
                    value: String(s.id),
                    label: `${s.name}${typeof s.stepNumber !== "undefined" ? ` (Step ${s.stepNumber})` : ""}`,
                  })),
                },
              ]
            : []),
          {
            name: "newBasicSalary",
            label: "New Basic Salary",
            type: "number",
            required: true,
            disabled: true,
          },
        ]}
        values={incrementValues}
        onChange={(n, v) =>
          setIncrementValues((p) => {
            const next = { ...p, [n]: v } as any;
            const oldSalary = employee?.basicSalary
              ? Number(employee.basicSalary)
              : 0;
            const gradeId = employee?.gradeId || "";

            if (n === "incrementMode") {
              next.incrementAmount = "";
              next.toScaleId = "";
              next.percentage = "";
              next.newBasicSalary = "";
            }

            const mode = String(next.incrementMode || "AMOUNT");
            if (mode === "AMOUNT") {
              const amt = Number(next.incrementAmount || 0);
              next.newBasicSalary =
                oldSalary && !Number.isNaN(amt) ? String(oldSalary + amt) : "";
            }
            if (mode === "PERCENTAGE") {
              const pct = Number(next.percentage || 0);
              if (oldSalary && !Number.isNaN(pct)) {
                next.newBasicSalary = String(
                  oldSalary + (oldSalary * pct) / 100,
                );
              } else next.newBasicSalary = "";
            }
            if (mode === "SCALE") {
              const scaleId = String(next.toScaleId || "");
              const amt = lookupData.salaryMatrix?.[gradeId]?.[scaleId];
              next.newBasicSalary = typeof amt === "number" ? String(amt) : "";
            }
            return next;
          })
        }
        onSubmit={async () => {
          try {
            // UI validation
            if (!incrementValues.incrementDate) {
              toast({
                title: "Validation",
                description: "Increment date is required",
                variant: "destructive",
              });
              return;
            }
            if (!incrementValues.incrementMode) {
              toast({
                title: "Validation",
                description: "Increment mode is required",
                variant: "destructive",
              });
              return;
            }
            if (
              incrementValues.incrementMode === "AMOUNT" &&
              !incrementValues.incrementAmount
            ) {
              toast({
                title: "Validation",
                description: "Incremented amount is required",
                variant: "destructive",
              });
              return;
            }
            if (
              incrementValues.incrementMode === "PERCENTAGE" &&
              !incrementValues.percentage
            ) {
              toast({
                title: "Validation",
                description: "Percentage is required",
                variant: "destructive",
              });
              return;
            }
            if (
              incrementValues.incrementMode === "SCALE" &&
              !incrementValues.toScaleId
            ) {
              toast({
                title: "Validation",
                description: "New scale is required",
                variant: "destructive",
              });
              return;
            }
            if (!incrementValues.newBasicSalary) {
              toast({
                title: "Validation",
                description: "New basic salary could not be calculated",
                variant: "destructive",
              });
              return;
            }

            const url = editingActionId
              ? `/employees/${id}/actions/${editingActionId}`
              : `/employees/${id}/actions/salary-increment`;
            const method = editingActionId ? api.put : api.post;
            await method(url, {
              incrementDate: incrementValues.incrementDate,
              reason: incrementValues.reason,
              incrementMode: incrementValues.incrementMode,
              incrementAmount: incrementValues.incrementAmount,
              toScaleId: incrementValues.toScaleId,
              percentage: incrementValues.percentage,
            });
            toast({
              title: "Success",
              description: editingActionId
                ? "Salary increment request updated"
                : "Salary increment request submitted",
            });
            setIncrementOpen(false);
            setEditingActionId(null);
            if (autoAdvance) gotoNext();
            else fetchEmployee();
          } catch (error: any) {
            toast({
              title: "Error",
              description:
                error.response?.data?.message || "Failed to update salary",
              variant: "destructive",
            });
          }
        }}
        submitLabel="Apply"
      />

      <FormDialog
        open={terminateOpen}
        onOpenChange={setTerminateOpen}
        title="Terminate Employment"
        description="Terminate this employee (agreement ends)"
        fields={[
          {
            name: "applicationDate",
            label: "Application Date",
            type: "date",
            required: true,
          },
          {
            name: "resignationDate",
            label: "Resignation Date",
            type: "date",
            required: true,
          },
          {
            name: "reasonId",
            label: "Reason",
            type: "select",
            required: true,
            options: terminationReasons.map((r) => ({
              value: String(r.id),
              label: String(r.value),
            })),
          },
          {
            name: "noticeDays",
            label: "Notice Days",
            type: "number",
            required: true,
          },
          { name: "remark", label: "Remark (Optional)", type: "textarea" },
        ]}
        values={terminateValues}
        onChange={(n, v) => setTerminateValues((p) => ({ ...p, [n]: v }))}
        onSubmit={async () => {
          try {
            if (!editingActionId && hasPendingAction) {
              toast({
                title: "Blocked",
                description:
                  "You already have a pending request for this employee. Approve/Reject it first.",
                variant: "destructive",
              });
              return;
            }
            if (!terminateValues.applicationDate) {
              toast({
                title: "Validation",
                description: "Application date is required",
                variant: "destructive",
              });
              return;
            }
            if (!terminateValues.resignationDate) {
              toast({
                title: "Validation",
                description: "Resignation date is required",
                variant: "destructive",
              });
              return;
            }
            if (
              !terminateValues.reasonId ||
              terminateValues.reasonId === "none"
            ) {
              toast({
                title: "Validation",
                description: "Reason is required",
                variant: "destructive",
              });
              return;
            }

            const url = editingActionId
              ? `/employees/${id}/actions/${editingActionId}`
              : `/employees/${id}/actions/termination`;
            const method = editingActionId ? api.put : api.post;
            await method(url, {
              applicationDate: terminateValues.applicationDate,
              resignationDate: terminateValues.resignationDate,
              reasonId: terminateValues.reasonId,
              noticeDays: Number(terminateValues.noticeDays || 60),
              remark: terminateValues.remark,
            });

            toast({
              title: "Success",
              description: editingActionId
                ? "Termination request updated"
                : "Termination request submitted",
            });
            setTerminateOpen(false);
            setEditingActionId(null);
            if (autoAdvance) gotoNext();
            else fetchEmployee();
          } catch (error: any) {
            toast({
              title: "Error",
              description:
                error.response?.data?.message || "Failed to terminate",
              variant: "destructive",
            });
          }
        }}
        submitLabel="Terminate"
      />

      <FormDialog
        open={reinstateOpen}
        onOpenChange={setReinstateOpen}
        title="Reinstate Employment"
        description={
          latestTermination
            ? `Last termination effective: ${format(
                new Date(latestTermination.effectiveDate),
                "PPP",
              )}`
            : "Reinstate this employee"
        }
        fields={[
          {
            name: "reinstateDate",
            label: "Reinstate Date (Effective Date)",
            type: "date",
            required: true,
          },
          { name: "remark", label: "Remark (Optional)", type: "textarea" },
        ]}
        values={reinstateValues}
        onChange={(n, v) => setReinstateValues((p) => ({ ...p, [n]: v }))}
        onSubmit={async () => {
          try {
            if (!editingActionId && hasPendingAction) {
              toast({
                title: "Blocked",
                description:
                  "You already have a pending request for this employee. Approve/Reject it first.",
                variant: "destructive",
              });
              return;
            }
            if (!latestTermination) {
              toast({
                title: "Validation",
                description:
                  "No approved termination found for this employee. Cannot reinstate.",
                variant: "destructive",
              });
              return;
            }
            if (!reinstateValues.reinstateDate) {
              toast({
                title: "Validation",
                description: "Reinstate date is required",
                variant: "destructive",
              });
              return;
            }

            const url = editingActionId
              ? `/employees/${id}/actions/${editingActionId}`
              : `/employees/${id}/actions/reinstate`;
            const method = editingActionId ? api.put : api.post;
            await method(url, {
              reinstateDate: reinstateValues.reinstateDate,
              remark: reinstateValues.remark,
            });

            toast({
              title: "Success",
              description: editingActionId
                ? "Reinstate request updated"
                : "Reinstate request submitted",
            });
            setReinstateOpen(false);
            setEditingActionId(null);
            if (autoAdvance) gotoNext();
            else fetchEmployee();
          } catch (error: any) {
            toast({
              title: "Error",
              description:
                error.response?.data?.message || "Failed to reinstate",
              variant: "destructive",
            });
          }
        }}
        submitLabel="Reinstate"
      />

      <FormDialog
        open={promoteOpen}
        onOpenChange={setPromoteOpen}
        title="Promote Employee"
        description="Set the new position/grade/scale"
        fields={[
          {
            name: "positionId",
            label: "Job Position",
            type: "select",
            required: true,
            options: (lookupData.positions || []).map((p: any) => ({
              value: String(p.id),
              label: p.name,
            })),
          },
          {
            name: "branchId",
            label: "Branch",
            type: "select",
            required: true,
            options: (lookupData.branches || []).map((b: any) => ({
              value: String(b.id),
              label: b.name,
            })),
          },
          {
            name: "dutyStationId",
            label: "Duty Station",
            type: "select",
            required: false,
            options: (lookupData.branches || []).map((b: any) => ({
              value: String(b.id),
              label: b.name,
            })),
          },
          {
            name: "departmentId",
            label: "Department",
            type: "select",
            required: true,
            options: (lookupData.departments || []).map((d: any) => ({
              value: String(d.id),
              label: d.name,
            })),
          },
          {
            name: "promotionReason",
            label: "Promotion Reason",
            type: "select",
            required: true,
            options: [
              { value: "PROMOTION", label: "Promotion" },
              { value: "DEMOTION", label: "Demotion" },
              { value: "RECLASSIFICATION", label: "Reclassification" },
              { value: "LATERAL_TRANSFER", label: "Lateral Transfer" },
              { value: "ACTING_ASSIGNMENT", label: "Acting Assignment" },
              { value: "CONFIRMATION", label: "Confirmation" },
              { value: "OTHER", label: "Other" },
            ],
          },
          {
            name: "scaleId",
            label: "Scale",
            type: "select",
            required: true,
            options: (lookupData.scales || []).map((s: any) => ({
              value: String(s.id),
              label: `${s.name}${typeof s.stepNumber !== "undefined" ? ` (Step ${s.stepNumber})` : ""}`,
            })),
          },
          {
            name: "gradeId",
            label: "Grade",
            type: "select",
            required: true,
            disabled: true,
            options: (lookupData.grades || []).map((g: any) => ({
              value: String(g.id),
              label: `${g.name}${typeof g.level !== "undefined" ? ` (Level ${g.level})` : ""}`,
            })),
          },
          {
            name: "basicSalary",
            label: "Basic Salary",
            type: "number",
            required: true,
            disabled: true,
          },
          {
            name: "effectiveDate",
            label: "Effective Date",
            type: "date",
            required: true,
          },
          { name: "note", label: "Note", type: "textarea" },
        ]}
        values={promoteValues}
        onChange={(n, v) =>
          setPromoteValues((p) => {
            const next = { ...p, [n]: v } as any;
            if (n === "positionId") {
              const pos = (lookupData.positions || []).find(
                (x: any) => String(x.id) === String(v),
              );
              const nextGradeId = pos?.gradeId ? String(pos.gradeId) : "";
              next.gradeId = nextGradeId;
              // clear scale/basicSalary when position changes
              next.scaleId = "";
              next.basicSalary = "";
            }
            if (n === "scaleId" || n === "positionId") {
              const gradeId = String(next.gradeId || "");
              const scaleId = String(next.scaleId || "");
              const amt = lookupData.salaryMatrix?.[gradeId]?.[scaleId];
              next.basicSalary = typeof amt === "number" ? String(amt) : "";
            }
            return next;
          })
        }
        onSubmit={async () => {
          try {
            // UI validation
            if (!promoteValues.positionId) {
              toast({
                title: "Validation",
                description: "Job position is required",
                variant: "destructive",
              });
              return;
            }
            if (!promoteValues.branchId) {
              toast({
                title: "Validation",
                description: "Branch is required",
                variant: "destructive",
              });
              return;
            }
            if (!promoteValues.departmentId) {
              toast({
                title: "Validation",
                description: "Department is required",
                variant: "destructive",
              });
              return;
            }
            if (!promoteValues.promotionReason) {
              toast({
                title: "Validation",
                description: "Promotion reason is required",
                variant: "destructive",
              });
              return;
            }
            if (!promoteValues.gradeId) {
              toast({
                title: "Validation",
                description: "Grade is required (auto-filled)",
                variant: "destructive",
              });
              return;
            }
            if (!promoteValues.scaleId) {
              toast({
                title: "Validation",
                description: "Scale is required",
                variant: "destructive",
              });
              return;
            }
            if (!promoteValues.basicSalary) {
              toast({
                title: "Validation",
                description: "Basic salary could not be calculated",
                variant: "destructive",
              });
              return;
            }
            if (!promoteValues.effectiveDate) {
              toast({
                title: "Validation",
                description: "Effective date is required",
                variant: "destructive",
              });
              return;
            }

            const url = editingActionId
              ? `/employees/${id}/actions/${editingActionId}`
              : `/employees/${id}/actions/promotion`;
            const method = editingActionId ? api.put : api.post;
            await method(url, {
              toPositionId: promoteValues.positionId,
              toGradeId: promoteValues.gradeId,
              toScaleId: promoteValues.scaleId,
              branchId: promoteValues.branchId,
              dutyStationId: promoteValues.dutyStationId || undefined,
              departmentId: promoteValues.departmentId,
              promotionReason: promoteValues.promotionReason,
              basicSalary: Number(promoteValues.basicSalary),
              effectiveDate: promoteValues.effectiveDate,
              note: promoteValues.note,
            });
            toast({
              title: "Success",
              description: editingActionId
                ? "Promotion request updated"
                : "Promotion request submitted",
            });
            setPromoteOpen(false);
            setEditingActionId(null);
            if (autoAdvance) gotoNext();
            else fetchEmployee();
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.response?.data?.message || "Failed to promote",
              variant: "destructive",
            });
          }
        }}
        submitLabel="Promote"
      />

      {/* Action detail viewer */}
      <Dialog open={actionDetailOpen} onOpenChange={setActionDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionTypeLabel(String(selectedAction?.type || ""))} details
            </DialogTitle>
            <DialogDescription>
              Status: {String(selectedAction?.status || "-")} • Effective:{" "}
              {selectedAction?.effectiveDate
                ? format(new Date(selectedAction.effectiveDate), "PPP")
                : "-"}
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const a = selectedAction;
            const p: any = a?.payload || {};
            if (!a) return null;

            const Row = ({
              label,
              value,
            }: {
              label: string;
              value: any;
            }) => (
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="text-sm font-medium text-right break-words">
                  {value ?? "-"}
                </div>
              </div>
            );

            if (a.type === "PROMOTION") {
              return (
                <div className="space-y-3">
                  <Row
                    label="Reason"
                    value={
                      p.promotionReason
                        ? String(p.promotionReason).replace(/_/g, " ")
                        : "-"
                    }
                  />
                  <Row
                    label="Job position"
                    value={nameById(lookupData.positions as any, p.toPositionId)}
                  />
                  <Row
                    label="Department"
                    value={nameById(
                      lookupData.departments as any,
                      p.toDepartmentId,
                    )}
                  />
                  <Row
                    label="Branch"
                    value={nameById(lookupData.branches as any, p.toBranchId)}
                  />
                  <Row
                    label="Duty station"
                    value={
                      p.toDutyStationId
                        ? nameById(
                            lookupData.branches as any,
                            p.toDutyStationId,
                          )
                        : "-"
                    }
                  />
                  <Row
                    label="Grade"
                    value={nameById(lookupData.grades as any, p.toGradeId)}
                  />
                  <Row
                    label="Scale"
                    value={nameById(lookupData.scales as any, p.toScaleId)}
                  />
                  <Row
                    label="Basic salary"
                    value={
                      typeof p.newBasicSalary === "number"
                        ? `${employee?.currency || "ETB"} ${Number(p.newBasicSalary).toLocaleString()}`
                        : "-"
                    }
                  />
                  <Row label="Note" value={p.note || "-"} />
                </div>
              );
            }

            if (a.type === "SALARY_INCREMENT") {
              return (
                <div className="space-y-3">
                  <Row
                    label="Mode"
                    value={
                      p.incrementMode
                        ? String(p.incrementMode).replace(/_/g, " ")
                        : "-"
                    }
                  />
                  <Row
                    label="Old salary"
                    value={
                      typeof p.oldBasicSalary === "number"
                        ? `${employee?.currency || "ETB"} ${Number(p.oldBasicSalary).toLocaleString()}`
                        : "-"
                    }
                  />
                  <Row
                    label="Incremented amount"
                    value={
                      typeof p.incrementedAmount === "number"
                        ? `${employee?.currency || "ETB"} ${Number(p.incrementedAmount).toLocaleString()}`
                        : "-"
                    }
                  />
                  <Row
                    label="New salary"
                    value={
                      typeof p.newBasicSalary === "number"
                        ? `${employee?.currency || "ETB"} ${Number(p.newBasicSalary).toLocaleString()}`
                        : "-"
                    }
                  />
                  <Row
                    label="Scale"
                    value={
                      p.toScaleId
                        ? nameById(lookupData.scales as any, p.toScaleId)
                        : "-"
                    }
                  />
                  <Row label="Reason" value={p.reason || "-"} />
                </div>
              );
            }

            if (a.type === "TERMINATION") {
              return (
                <div className="space-y-3">
                  <Row
                    label="Application date"
                    value={
                      p.applicationDate
                        ? format(new Date(p.applicationDate), "PPP")
                        : "-"
                    }
                  />
                  <Row
                    label="Resignation date"
                    value={
                      p.resignationDate
                        ? format(new Date(p.resignationDate), "PPP")
                        : "-"
                    }
                  />
                  <Row
                    label="Reason"
                    value={
                      terminationReasonById(p.reasonId) ||
                      (p.reasonId ? `ReasonId: ${p.reasonId}` : "-")
                    }
                  />
                  <Row
                    label="Notice days"
                    value={
                      typeof p.noticeDays === "number" ? p.noticeDays : 60
                    }
                  />
                  <Row label="Remark" value={p.remark || "-"} />
                </div>
              );
            }

            if (a.type === "REINSTATE") {
              const lt = p.lastTermination;
              const ltDate = lt?.effectiveDate
                ? format(new Date(lt.effectiveDate), "PPP")
                : null;
              const ltReason =
                lt?.payload?.reasonId && terminationReasonById(lt.payload.reasonId);

              return (
                <div className="space-y-3">
                  <Row
                    label="Last termination"
                    value={
                      ltDate
                        ? `${ltDate}${ltReason ? ` • ${ltReason}` : ""}`
                        : "-"
                    }
                  />
                  <Row
                    label="Reinstate date"
                    value={
                      p.reinstateDate
                        ? format(new Date(p.reinstateDate), "PPP")
                        : a.effectiveDate
                          ? format(new Date(a.effectiveDate), "PPP")
                          : "-"
                    }
                  />
                  <Row label="Remark" value={p.remark || "-"} />
                </div>
              );
            }

            return (
              <div className="text-sm text-muted-foreground">
                No detail view available for this action type.
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
