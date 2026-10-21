/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2, Edit2, Gift, Info, Briefcase, User, Building, Plus, AlertCircle, Fuel } from "lucide-react";

type BenefitType = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isTaxable: boolean;
  isActive: boolean;
};

type RefItem = { id: string; code?: string; name?: string; firstName?: string; lastName?: string; employeeId?: string };

type LookupItem = { id?: string; code: string; value: string };

type BenefitAssignment = {
  id: string;
  benefitTypeId: string;
  scopeType: "POSITION" | "DEPARTMENT" | "EMPLOYEE";
  positionId?: string | null;
  departmentId?: string | null;
  employeeId?: string | null;
  calculationType: "PERCENTAGE" | "AMOUNT" | "UNIT_BASED";
  value: number | string;
  currency?: string | null;
  unit?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  benefitType?: BenefitType;
  position?: RefItem | null;
  department?: RefItem | null;
  employee?: RefItem | null;
};

const DEFAULT_BENEFIT_UNITS: LookupItem[] = [
  { code: "LITER", value: "Liter (L)" },
  { code: "DAY", value: "Days" },
  { code: "MONTH", value: "Months" },
  { code: "AIRTIME_CARD", value: "Airtime Voucher / Card" },
  { code: "TRIP", value: "Trips / Rides" },
  { code: "MEAL", value: "Meal Coupons" },
  { code: "UNIT", value: "Units" },
];

export function BenefitsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<BenefitType[]>([]);
  const [assignments, setAssignments] = useState<BenefitAssignment[]>([]);
  const [positions, setPositions] = useState<RefItem[]>([]);
  const [departments, setDepartments] = useState<RefItem[]>([]);
  const [employees, setEmployees] = useState<RefItem[]>([]);
  const [currencies, setCurrencies] = useState<LookupItem[]>([]);
  const [benefitUnits, setBenefitUnits] = useState<LookupItem[]>(DEFAULT_BENEFIT_UNITS);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Benefit Type Modal state
  const [editTypeOpen, setEditTypeOpen] = useState(false);
  const [editingType, setEditingType] = useState<BenefitType | null>(null);
  const [editTypeForm, setEditTypeForm] = useState({ name: "", description: "", isTaxable: false, isActive: true });

  // Edit Assignment Modal state
  const [editAssignOpen, setEditAssignOpen] = useState(false);
  const [editingAssign, setEditingAssign] = useState<BenefitAssignment | null>(null);
  const [editAssignForm, setEditAssignForm] = useState({
    calculationType: "AMOUNT" as "AMOUNT" | "PERCENTAGE" | "UNIT_BASED",
    value: "",
    currency: "ETB",
    unit: "LITER",
    effectiveFrom: "",
    effectiveTo: "",
    isActive: true,
  });

  const [newType, setNewType] = useState({
    code: "",
    name: "",
    description: "",
    isTaxable: false,
  });

  const [newAssign, setNewAssign] = useState({
    benefitTypeId: "",
    scopeType: "POSITION" as "POSITION" | "DEPARTMENT" | "EMPLOYEE",
    positionId: "",
    departmentId: "",
    employeeId: "",
    calculationType: "AMOUNT" as "AMOUNT" | "PERCENTAGE" | "UNIT_BASED",
    value: "",
    currency: "ETB",
    unit: "LITER",
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: "",
  });

  const canCreateAssign = useMemo(() => {
    if (!newAssign.benefitTypeId || !newAssign.value || !newAssign.effectiveFrom) return false;
    if (newAssign.scopeType === "POSITION" && !newAssign.positionId) return false;
    if (newAssign.scopeType === "DEPARTMENT" && !newAssign.departmentId) return false;
    if (newAssign.scopeType === "EMPLOYEE" && !newAssign.employeeId) return false;
    return true;
  }, [newAssign]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [typesRes, assignsRes, posRes, deptRes, empRes, currRes, unitRes] = await Promise.all([
        api.get("/benefits/types?includeInactive=true"),
        api.get("/benefits/assignments?includeInactive=true"),
        api.get("/positions?includeInactive=true"),
        api.get("/departments?includeInactive=true"),
        api.get("/employees?limit=300"),
        api.get("/lookups/CURRENCY").catch(() => ({ data: { values: [] } })),
        api.get("/lookups/BENEFIT_UNIT").catch(() => ({ data: { values: [] } })),
      ]);

      setTypes(typesRes?.data?.types || typesRes?.types || []);
      setAssignments(assignsRes?.data?.assignments || assignsRes?.assignments || []);
      setPositions(posRes?.data?.positions || posRes?.positions || []);
      setDepartments(deptRes?.data?.departments || deptRes?.departments || []);

      const rawEmps = empRes?.data?.items || empRes?.data?.employees || empRes?.data || [];
      setEmployees(Array.isArray(rawEmps) ? rawEmps : []);

      const currList = currRes?.data?.values || currRes?.values || [];
      if (Array.isArray(currList) && currList.length > 0) {
        setCurrencies(currList);
      } else {
        setCurrencies([
          { code: "ETB", value: "Ethiopian Birr" },
          { code: "USD", value: "US Dollar" },
        ]);
      }

      const unitList = unitRes?.data?.values || unitRes?.values || [];
      if (Array.isArray(unitList) && unitList.length > 0) {
        setBenefitUnits(unitList);
      } else {
        setBenefitUnits(DEFAULT_BENEFIT_UNITS);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load benefits data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getUnitDisplayName = (unitCode?: string | null) => {
    if (!unitCode) return "";
    const match = benefitUnits.find((u) => u.code === unitCode);
    return match ? match.value : unitCode;
  };

  const createType = async () => {
    if (!newType.code.trim() || !newType.name.trim()) {
      toast({ title: "Validation Error", description: "Benefit code and name are required", variant: "destructive" });
      return;
    }
    try {
      await api.post("/benefits/types", newType);
      setNewType({ code: "", name: "", description: "", isTaxable: false });
      toast({ title: "Success", description: "Benefit type created successfully" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to create benefit type", variant: "destructive" });
    }
  };

  const openEditType = (type: BenefitType) => {
    setEditingType(type);
    setEditTypeForm({
      name: type.name,
      description: type.description || "",
      isTaxable: Boolean(type.isTaxable),
      isActive: Boolean(type.isActive),
    });
    setEditTypeOpen(true);
  };

  const saveEditType = async () => {
    if (!editingType) return;
    if (!editTypeForm.name.trim()) {
      toast({ title: "Validation Error", description: "Name is required", variant: "destructive" });
      return;
    }
    try {
      await api.put("/benefits/types/" + editingType.id, editTypeForm);
      toast({ title: "Updated", description: "Benefit type updated successfully" });
      setEditTypeOpen(false);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to update benefit type", variant: "destructive" });
    }
  };

  const deleteType = async (type: BenefitType) => {
    if (!confirm(`Are you sure you want to delete benefit type "${type.name}" (${type.code})?`)) return;
    try {
      await api.delete("/benefits/types/" + type.id);
      toast({ title: "Deleted", description: "Benefit type deleted successfully" });
      setTypes((prev) => prev.filter((t) => t.id !== type.id));
    } catch (err: any) {
      toast({
        title: "Cannot Delete",
        description: err?.response?.data?.message || "Failed to delete benefit type",
        variant: "destructive",
      });
    }
  };

  const createAssignment = async () => {
    if (!canCreateAssign) return;
    try {
      setSubmitting(true);
      await api.post("/benefits/assignments", {
        benefitTypeId: newAssign.benefitTypeId,
        scopeType: newAssign.scopeType,
        positionId: newAssign.scopeType === "POSITION" ? newAssign.positionId : undefined,
        departmentId: newAssign.scopeType === "DEPARTMENT" ? newAssign.departmentId : undefined,
        employeeId: newAssign.scopeType === "EMPLOYEE" ? newAssign.employeeId : undefined,
        calculationType: newAssign.calculationType,
        value: Number(newAssign.value),
        currency: newAssign.calculationType === "AMOUNT" ? (newAssign.currency || "ETB") : undefined,
        unit: newAssign.calculationType === "UNIT_BASED" ? (newAssign.unit || "LITER") : undefined,
        effectiveFrom: newAssign.effectiveFrom,
        effectiveTo: newAssign.effectiveTo || undefined,
      });
      toast({ title: "Success", description: "Benefit assigned successfully" });
      setNewAssign((prev) => ({
        ...prev,
        benefitTypeId: "",
        value: "",
        effectiveTo: "",
      }));
      fetchData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to create assignment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditAssignment = (assign: BenefitAssignment) => {
    setEditingAssign(assign);
    setEditAssignForm({
      calculationType: assign.calculationType,
      value: String(assign.value),
      currency: assign.currency || "ETB",
      unit: assign.unit || "LITER",
      effectiveFrom: String(assign.effectiveFrom).slice(0, 10),
      effectiveTo: assign.effectiveTo ? String(assign.effectiveTo).slice(0, 10) : "",
      isActive: Boolean(assign.isActive),
    });
    setEditAssignOpen(true);
  };

  const saveEditAssignment = async () => {
    if (!editingAssign) return;
    if (!editAssignForm.value || !editAssignForm.effectiveFrom) {
      toast({ title: "Validation Error", description: "Value and Effective From are required", variant: "destructive" });
      return;
    }
    try {
      await api.put("/benefits/assignments/" + editingAssign.id, {
        calculationType: editAssignForm.calculationType,
        value: Number(editAssignForm.value),
        currency: editAssignForm.calculationType === "AMOUNT" ? editAssignForm.currency : undefined,
        unit: editAssignForm.calculationType === "UNIT_BASED" ? editAssignForm.unit : undefined,
        effectiveFrom: editAssignForm.effectiveFrom,
        effectiveTo: editAssignForm.effectiveTo || null,
        isActive: editAssignForm.isActive,
      });
      toast({ title: "Updated", description: "Benefit assignment updated successfully" });
      setEditAssignOpen(false);
      fetchData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update assignment",
        variant: "destructive",
      });
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to remove this benefit assignment?")) return;
    try {
      setDeletingId(id);
      await api.delete("/benefits/assignments/" + id);
      toast({ title: "Deleted", description: "Benefit assignment removed" });
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to delete assignment", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  // Determine current target based on selected scope
  const currentTarget = useMemo(() => {
    if (newAssign.scopeType === "POSITION") {
      const pos = positions.find((p) => p.id === newAssign.positionId);
      return {
        id: newAssign.positionId,
        label: "Position",
        name: pos?.name || pos?.code || "",
        icon: Briefcase,
      };
    }
    if (newAssign.scopeType === "EMPLOYEE") {
      const emp = employees.find((e) => e.id === newAssign.employeeId);
      return {
        id: newAssign.employeeId,
        label: "Employee",
        name: emp ? ((emp.employeeId || "") + " - " + (emp.firstName || "") + " " + (emp.lastName || "")).trim() : "",
        icon: User,
      };
    }
    if (newAssign.scopeType === "DEPARTMENT") {
      const dept = departments.find((d) => d.id === newAssign.departmentId);
      return {
        id: newAssign.departmentId,
        label: "Department",
        name: dept?.name || dept?.code || "",
        icon: Building,
      };
    }
    return { id: "", label: "", name: "", icon: Gift };
  }, [newAssign.scopeType, newAssign.positionId, newAssign.employeeId, newAssign.departmentId, positions, employees, departments]);

  // Filter assignments strictly for the selected target
  const filteredAssignments = useMemo(() => {
    if (!currentTarget.id) return [];
    return assignments.filter((a) => {
      if (newAssign.scopeType === "POSITION") return a.scopeType === "POSITION" && a.positionId === currentTarget.id;
      if (newAssign.scopeType === "EMPLOYEE") return a.scopeType === "EMPLOYEE" && a.employeeId === currentTarget.id;
      if (newAssign.scopeType === "DEPARTMENT") return a.scopeType === "DEPARTMENT" && a.departmentId === currentTarget.id;
      return false;
    });
  }, [assignments, newAssign.scopeType, currentTarget.id]);

  const TargetIcon = currentTarget.icon;

  return (
    <div className="space-y-6">
      {/* 1. BENEFIT TYPES CATALOG */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Benefit Types Catalog</CardTitle>
              <CardDescription>Master allowance categories (Fuel, Housing, Transport, Medical, Airtime, etc.)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-muted/30 p-3 rounded-lg border border-border/50">
            <div>
              <Label className="text-xs font-medium">Code *</Label>
              <Input
                placeholder="e.g. FUEL_BENZINE"
                value={newType.code}
                onChange={(e) => setNewType((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                className="h-9 text-xs uppercase font-mono"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Benefit Name *</Label>
              <Input
                placeholder="e.g. Fuel Allowance (Liters)"
                value={newType.name}
                onChange={(e) => setNewType((p) => ({ ...p, name: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs font-medium">Description</Label>
              <Input
                placeholder="e.g. Monthly fuel liter quota for management vehicle"
                value={newType.description}
                onChange={(e) => setNewType((p) => ({ ...p, description: e.target.value }))}
                className="h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={createType} size="sm" className="h-9 w-full gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Type
              </Button>
            </div>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/60 text-muted-foreground border-b">
                <tr>
                  <th className="text-left p-2.5 font-semibold">Code</th>
                  <th className="text-left p-2.5 font-semibold">Name</th>
                  <th className="text-left p-2.5 font-semibold">Description</th>
                  <th className="text-left p-2.5 font-semibold">Taxability</th>
                  <th className="text-center p-2.5 font-semibold">Active</th>
                  <th className="text-right p-2.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {types.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground text-xs">
                      No benefit types configured yet. Add your first benefit type above.
                    </td>
                  </tr>
                ) : (
                  types.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-2.5 font-mono font-medium text-primary">{t.code}</td>
                      <td className="p-2.5 font-medium">{t.name}</td>
                      <td className="p-2.5 text-muted-foreground">{t.description || "—"}</td>
                      <td className="p-2.5">
                        <Badge variant={t.isTaxable ? "default" : "secondary"} className="text-[10px] font-normal">
                          {t.isTaxable ? "Taxable" : "Tax Exempt"}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${t.isActive ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditType(t)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            title="Edit Benefit Type"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteType(t)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Delete Benefit Type"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 2. ASSIGN BENEFIT FORM */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TargetIcon className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Benefit Assignments</CardTitle>
              <CardDescription>
                Assign allowances as fixed cash, percentage of basic pay, or physical units (e.g. Fuel in Liters, Airtime vouchers).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-muted/20 p-3.5 rounded-lg border border-border/50">
            {/* Scope Type */}
            <div>
              <Label className="text-xs font-semibold">1. Scope Type *</Label>
              <Select
                value={newAssign.scopeType}
                onValueChange={(v: any) =>
                  setNewAssign((p) => ({
                    ...p,
                    scopeType: v,
                    positionId: "",
                    departmentId: "",
                    employeeId: "",
                  }))
                }
              >
                <SelectTrigger className="h-9 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POSITION">Position (Job Title)</SelectItem>
                  <SelectItem value="EMPLOYEE">Individual Employee</SelectItem>
                  <SelectItem value="DEPARTMENT">Department Wide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Selector */}
            {newAssign.scopeType === "POSITION" && (
              <div className="md:col-span-2">
                <Label className="text-xs font-semibold">2. Select Position *</Label>
                <Select
                  value={newAssign.positionId}
                  onValueChange={(v) => setNewAssign((p) => ({ ...p, positionId: v }))}
                >
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue placeholder="Choose position..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {positions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name || p.code || p.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newAssign.scopeType === "EMPLOYEE" && (
              <div className="md:col-span-2">
                <Label className="text-xs font-semibold">2. Select Employee *</Label>
                <Select
                  value={newAssign.employeeId}
                  onValueChange={(v) => setNewAssign((p) => ({ ...p, employeeId: v }))}
                >
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue placeholder="Choose employee..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {((e.employeeId || "") + " - " + (e.firstName || "") + " " + (e.lastName || "")).trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newAssign.scopeType === "DEPARTMENT" && (
              <div className="md:col-span-2">
                <Label className="text-xs font-semibold">2. Select Department *</Label>
                <Select
                  value={newAssign.departmentId}
                  onValueChange={(v) => setNewAssign((p) => ({ ...p, departmentId: v }))}
                >
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue placeholder="Choose department..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name || d.code || d.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Benefit Type */}
            <div>
              <Label className="text-xs font-semibold">3. Benefit Type *</Label>
              <Select
                value={newAssign.benefitTypeId}
                onValueChange={(v) => setNewAssign((p) => ({ ...p, benefitTypeId: v }))}
              >
                <SelectTrigger className="h-9 text-xs mt-1">
                  <SelectValue placeholder="Choose benefit..." />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calculation Mode */}
            <div>
              <Label className="text-xs font-semibold">Calculation Mode *</Label>
              <Select
                value={newAssign.calculationType}
                onValueChange={(v: any) => setNewAssign((p) => ({ ...p, calculationType: v }))}
              >
                <SelectTrigger className="h-9 text-xs mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AMOUNT">Fixed Amount (Cash)</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage (%) of Basic</SelectItem>
                  <SelectItem value="UNIT_BASED">Unit Based (Quantity / Liters)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Value */}
            <div>
              <Label className="text-xs font-semibold">
                {newAssign.calculationType === "AMOUNT"
                  ? "Amount Value *"
                  : newAssign.calculationType === "PERCENTAGE"
                  ? "Percentage Rate (%) *"
                  : "Quantity / Units *"}
              </Label>
              <Input
                type="number"
                step="any"
                placeholder={
                  newAssign.calculationType === "AMOUNT"
                    ? "e.g. 2500"
                    : newAssign.calculationType === "PERCENTAGE"
                    ? "e.g. 15"
                    : "e.g. 150 (Liters)"
                }
                value={newAssign.value}
                onChange={(e) => setNewAssign((p) => ({ ...p, value: e.target.value }))}
                className="h-9 text-xs mt-1 font-mono"
              />
            </div>

            {/* Currency OR Measurement Unit Selector */}
            <div>
              {newAssign.calculationType === "AMOUNT" ? (
                <>
                  <Label className="text-xs font-semibold">Currency</Label>
                  <Select
                    value={newAssign.currency || "ETB"}
                    onValueChange={(v) => setNewAssign((p) => ({ ...p, currency: v }))}
                  >
                    <SelectTrigger className="h-9 text-xs mt-1 font-mono font-medium">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.id || c.code} value={c.code} className="text-xs font-mono">
                          {c.code} {c.value && c.value !== c.code ? "(" + c.value + ")" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : newAssign.calculationType === "UNIT_BASED" ? (
                <>
                  <Label className="text-xs font-semibold flex items-center gap-1">
                    <Fuel className="h-3 w-3 text-amber-600" /> Unit of Measure
                  </Label>
                  <Select
                    value={newAssign.unit || "LITER"}
                    onValueChange={(v) => setNewAssign((p) => ({ ...p, unit: v }))}
                  >
                    <SelectTrigger className="h-9 text-xs mt-1 font-medium">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {benefitUnits.map((u) => (
                        <SelectItem key={u.id || u.code} value={u.code} className="text-xs">
                          {u.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <Label className="text-xs font-semibold">Rate</Label>
                  <div className="h-9 mt-1 px-3 py-2 bg-muted/60 border rounded-md text-xs text-muted-foreground font-mono flex items-center justify-between">
                    <span>% Rate</span>
                    <span className="text-[10px] text-muted-foreground">Basic Salary</span>
                  </div>
                </>
              )}
            </div>

            {/* Effective Dates */}
            <div>
              <Label className="text-xs font-semibold">Effective From *</Label>
              <Input
                type="date"
                value={newAssign.effectiveFrom}
                onChange={(e) => setNewAssign((p) => ({ ...p, effectiveFrom: e.target.value }))}
                className="h-9 text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Effective To (Optional)</Label>
              <Input
                type="date"
                value={newAssign.effectiveTo}
                onChange={(e) => setNewAssign((p) => ({ ...p, effectiveTo: e.target.value }))}
                className="h-9 text-xs mt-1"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3 flex items-end justify-end">
              <Button
                onClick={createAssignment}
                disabled={!canCreateAssign || submitting}
                size="sm"
                className="h-9 px-5 gap-1.5 text-xs"
              >
                <Plus className="h-4 w-4" />
                {submitting ? "Assigning..." : "Assign Benefit to " + (currentTarget.label || "Target")}
              </Button>
            </div>
          </div>

          {/* 3. DYNAMIC BOTTOM LIST (FILTERED EXCLUSIVELY BY SELECTED TARGET) */}
          <div className="mt-6 space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TargetIcon className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold tracking-tight">
                  {currentTarget.id
                    ? "Assigned Benefits for " + currentTarget.label + ": " + currentTarget.name
                    : "Benefit Assignments for Selected " + (newAssign.scopeType === "POSITION" ? "Position" : newAssign.scopeType === "EMPLOYEE" ? "Employee" : "Department")}
                </h3>
                {Boolean(currentTarget.id) && (

                  <Badge variant="secondary" className="text-[11px] font-medium ml-1">
                    {filteredAssignments.length} {filteredAssignments.length === 1 ? "assignment" : "assignments"}
                  </Badge>
                )}
              </div>
            </div>

            {!currentTarget.id ? (
              <div className="p-8 text-center rounded-lg border border-dashed bg-muted/20 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/70" />
                <p className="font-medium text-sm text-foreground">
                  No {currentTarget.label || "Target"} Selected
                </p>
                <p className="text-xs mt-1 text-muted-foreground max-w-md mx-auto">
                  Please select a {newAssign.scopeType.toLowerCase()} from the dropdown above to view and manage its specific assigned benefits.
                </p>
                <p className="text-[11px] mt-3 text-muted-foreground/80 italic">
                  Note: Full company-wide roster reports can be viewed under the Reports module.
                </p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="p-8 text-center rounded-lg border border-dashed bg-muted/20 text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2 text-primary/60" />
                <p className="font-medium text-sm text-foreground">
                  No Benefits Currently Assigned
                </p>
                <p className="text-xs mt-1 text-muted-foreground">
                  {"No benefits have been assigned to \"" + currentTarget.name + "\" yet. Use the form above to add an assignment."}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden shadow-sm">
                <table className="w-full text-xs">
                  <thead className="bg-muted/70 text-muted-foreground border-b">
                    <tr>
                      <th className="text-left p-2.5 font-semibold">Benefit Type</th>
                      <th className="text-left p-2.5 font-semibold">Taxability</th>
                      <th className="text-left p-2.5 font-semibold">Calculation Mode</th>
                      <th className="text-left p-2.5 font-semibold">Entitlement / Value</th>
                      <th className="text-left p-2.5 font-semibold">Effective Period</th>
                      <th className="text-center p-2.5 font-semibold">Status</th>
                      <th className="text-right p-2.5 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredAssignments.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-2.5 font-medium">
                          <div className="font-semibold text-foreground">{a.benefitType?.name || "—"}</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{a.benefitType?.code}</div>
                        </td>
                        <td className="p-2.5">
                          <Badge variant={a.benefitType?.isTaxable ? "default" : "outline"} className="text-[10px]">
                            {a.benefitType?.isTaxable ? "Taxable" : "Tax Exempt"}
                          </Badge>
                        </td>
                        <td className="p-2.5 text-muted-foreground">
                          {a.calculationType === "PERCENTAGE"
                            ? "Percentage of Basic"
                            : a.calculationType === "UNIT_BASED"
                            ? "Unit Based (Quota)"
                            : "Fixed Amount"}
                        </td>
                        <td className="p-2.5 font-mono font-semibold text-primary">
                          {a.calculationType === "PERCENTAGE" ? (
                            <span>{Number(a.value)}%</span>
                          ) : a.calculationType === "UNIT_BASED" ? (
                            <span className="flex items-center gap-1.5">
                              <span>{Number(a.value).toLocaleString()}</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-sans bg-amber-500/10 text-amber-700 border-amber-300">
                                {getUnitDisplayName(a.unit) || a.unit || "Units"}
                              </Badge>
                            </span>
                          ) : (
                            <span>{(a.currency || "ETB") + " " + Number(a.value).toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-muted-foreground text-[11px]">
                          {String(a.effectiveFrom).slice(0, 10)}
                          <span className="mx-1 text-muted-foreground/60">→</span>
                          {a.effectiveTo ? String(a.effectiveTo).slice(0, 10) : <span className="text-emerald-600 font-sans font-medium">Open-ended</span>}
                        </td>
                        <td className="p-2.5 text-center">
                          <Badge variant={a.isActive ? "outline" : "secondary"} className={`text-[10px] ${a.isActive ? "text-emerald-600 border-emerald-300" : "text-muted-foreground"}`}>
                            {a.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditAssignment(a)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              title="Edit Benefit Assignment"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAssignment(a.id)}
                              disabled={deletingId === a.id}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Remove Benefit Assignment"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* EDIT BENEFIT TYPE DIALOG */}
      <Dialog open={editTypeOpen} onOpenChange={setEditTypeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Benefit Type</DialogTitle>
            <DialogDescription>
              Update details for {editingType?.code} ({editingType?.name}).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-semibold">Benefit Name *</Label>
              <Input
                value={editTypeForm.name}
                onChange={(e) => setEditTypeForm((p) => ({ ...p, name: e.target.value }))}
                className="h-9 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Description</Label>
              <Input
                value={editTypeForm.description}
                onChange={(e) => setEditTypeForm((p) => ({ ...p, description: e.target.value }))}
                className="h-9 text-xs mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <Label className="text-xs font-semibold">Taxability</Label>
                <Select
                  value={editTypeForm.isTaxable ? "true" : "false"}
                  onValueChange={(v) => setEditTypeForm((p) => ({ ...p, isTaxable: v === "true" }))}
                >
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Tax Exempt</SelectItem>
                    <SelectItem value="true">Taxable Allowance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Status</Label>
                <Select
                  value={editTypeForm.isActive ? "true" : "false"}
                  onValueChange={(v) => setEditTypeForm((p) => ({ ...p, isActive: v === "true" }))}
                >
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setEditTypeOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveEditType}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT BENEFIT ASSIGNMENT DIALOG */}
      <Dialog open={editAssignOpen} onOpenChange={setEditAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Benefit Assignment</DialogTitle>
            <DialogDescription>
              Update assigned rate, currency, unit, or effective dates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="p-2.5 rounded-md bg-muted/40 border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Benefit:</span>
                <span className="font-semibold text-foreground">{editingAssign?.benefitType?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scope:</span>
                <Badge variant="outline" className="text-[10px]">{editingAssign?.scopeType}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Calculation Mode</Label>
                <Select
                  value={editAssignForm.calculationType}
                  onValueChange={(v: any) => setEditAssignForm((p) => ({ ...p, calculationType: v }))}
                >
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AMOUNT">Fixed Amount (Cash)</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="UNIT_BASED">Unit Based (Quantity)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">
                  {editAssignForm.calculationType === "UNIT_BASED" ? "Quantity *" : "Value *"}
                </Label>
                <Input
                  type="number"
                  step="any"
                  value={editAssignForm.value}
                  onChange={(e) => setEditAssignForm((p) => ({ ...p, value: e.target.value }))}
                  className="h-9 text-xs mt-1 font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                {editAssignForm.calculationType === "AMOUNT" ? (
                  <>
                    <Label className="text-xs font-semibold">Currency</Label>
                    <Select
                      value={editAssignForm.currency || "ETB"}
                      onValueChange={(v) => setEditAssignForm((p) => ({ ...p, currency: v }))}
                    >
                      <SelectTrigger className="h-9 text-xs mt-1 font-mono">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.id || c.code} value={c.code} className="text-xs font-mono">
                            {c.code} {c.value && c.value !== c.code ? "(" + c.value + ")" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : editAssignForm.calculationType === "UNIT_BASED" ? (
                  <>
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Fuel className="h-3 w-3 text-amber-600" /> Unit of Measure
                    </Label>
                    <Select
                      value={editAssignForm.unit || "LITER"}
                      onValueChange={(v) => setEditAssignForm((p) => ({ ...p, unit: v }))}
                    >
                      <SelectTrigger className="h-9 text-xs mt-1">
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {benefitUnits.map((u) => (
                          <SelectItem key={u.id || u.code} value={u.code} className="text-xs">
                            {u.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Label className="text-xs font-semibold">Rate</Label>
                    <div className="h-9 mt-1 px-3 py-2 bg-muted/60 border rounded-md text-xs text-muted-foreground font-mono">
                      % of Salary
                    </div>
                  </>
                )}
              </div>
              <div>
                <Label className="text-xs font-semibold">Status</Label>
                <Select
                  value={editAssignForm.isActive ? "true" : "false"}
                  onValueChange={(v) => setEditAssignForm((p) => ({ ...p, isActive: v === "true" }))}
                >
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Effective From *</Label>
                <Input
                  type="date"
                  value={editAssignForm.effectiveFrom}
                  onChange={(e) => setEditAssignForm((p) => ({ ...p, effectiveFrom: e.target.value }))}
                  className="h-9 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Effective To</Label>
                <Input
                  type="date"
                  value={editAssignForm.effectiveTo}
                  onChange={(e) => setEditAssignForm((p) => ({ ...p, effectiveTo: e.target.value }))}
                  className="h-9 text-xs mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setEditAssignOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveEditAssignment}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}