/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BenefitType = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isTaxable: boolean;
  isActive: boolean;
};

type RefItem = { id: string; code?: string; name?: string; firstName?: string; lastName?: string; employeeId?: string };

type BenefitAssignment = {
  id: string;
  benefitTypeId: string;
  scopeType: "POSITION" | "DEPARTMENT" | "EMPLOYEE";
  positionId?: string | null;
  departmentId?: string | null;
  employeeId?: string | null;
  calculationType: "PERCENTAGE" | "AMOUNT";
  value: number | string;
  currency?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  benefitType?: BenefitType;
  position?: RefItem | null;
  department?: RefItem | null;
  employee?: RefItem | null;
};

export function BenefitsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<BenefitType[]>([]);
  const [assignments, setAssignments] = useState<BenefitAssignment[]>([]);
  const [positions, setPositions] = useState<RefItem[]>([]);
  const [departments, setDepartments] = useState<RefItem[]>([]);
  const [employees, setEmployees] = useState<RefItem[]>([]);

  const [newType, setNewType] = useState({
    code: "",
    name: "",
    description: "",
    isTaxable: false,
  });

  const [newAssign, setNewAssign] = useState({
    benefitTypeId: "",
    scopeType: "POSITION",
    positionId: "",
    departmentId: "",
    employeeId: "",
    calculationType: "AMOUNT",
    value: "",
    currency: "ETB",
    effectiveFrom: "",
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
      const [typesRes, assignsRes, posRes, deptRes, empRes] = await Promise.all([
        api.get("/benefits/types?includeInactive=true"),
        api.get("/benefits/assignments?includeInactive=true"),
        api.get("/positions?includeInactive=true"),
        api.get("/departments?includeInactive=true"),
        api.get("/employees?limit=200"),
      ]);

      setTypes(typesRes?.data?.types || typesRes?.types || []);
      setAssignments(assignsRes?.data?.assignments || assignsRes?.assignments || []);
      setPositions(posRes?.data?.positions || posRes?.positions || []);
      setDepartments(deptRes?.data?.departments || deptRes?.departments || []);
      setEmployees(empRes?.data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load benefits", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createType = async () => {
    if (!newType.code || !newType.name) return;
    try {
      await api.post("/benefits/types", newType);
      setNewType({ code: "", name: "", description: "", isTaxable: false });
      toast({ title: "Success", description: "Benefit type created" });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to create benefit type", variant: "destructive" });
    }
  };

  const createAssignment = async () => {
    if (!canCreateAssign) return;
    try {
      await api.post("/benefits/assignments", {
        benefitTypeId: newAssign.benefitTypeId,
        scopeType: newAssign.scopeType,
        positionId: newAssign.scopeType === "POSITION" ? newAssign.positionId : undefined,
        departmentId: newAssign.scopeType === "DEPARTMENT" ? newAssign.departmentId : undefined,
        employeeId: newAssign.scopeType === "EMPLOYEE" ? newAssign.employeeId : undefined,
        calculationType: newAssign.calculationType,
        value: Number(newAssign.value),
        currency: newAssign.calculationType === "AMOUNT" ? newAssign.currency : undefined,
        effectiveFrom: newAssign.effectiveFrom,
        effectiveTo: newAssign.effectiveTo || undefined,
      });
      toast({ title: "Success", description: "Benefit assignment created" });
      setNewAssign({
        benefitTypeId: "",
        scopeType: "POSITION",
        positionId: "",
        departmentId: "",
        employeeId: "",
        calculationType: "AMOUNT",
        value: "",
        currency: "ETB",
        effectiveFrom: "",
        effectiveTo: "",
      });
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to create assignment", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Benefit Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>Code</Label>
              <Input value={newType.code} onChange={(e) => setNewType((p) => ({ ...p, code: e.target.value }))} />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={newType.name} onChange={(e) => setNewType((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={newType.description} onChange={(e) => setNewType((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex items-end">
              <Button onClick={createType}>Add Type</Button>
            </div>
          </div>

          <div className="rounded border overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="p-2">{t.code}</td>
                    <td className="p-2">{t.name}</td>
                    <td className="p-2">{t.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benefit Assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>Benefit Type</Label>
              <Select value={newAssign.benefitTypeId} onValueChange={(v) => setNewAssign((p) => ({ ...p, benefitTypeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {types.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Scope</Label>
              <Select value={newAssign.scopeType} onValueChange={(v) => setNewAssign((p: any) => ({ ...p, scopeType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="POSITION">Position</SelectItem>
                  <SelectItem value="DEPARTMENT">Department</SelectItem>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newAssign.scopeType === "POSITION" && (
              <div>
                <Label>Position</Label>
                <Select value={newAssign.positionId} onValueChange={(v) => setNewAssign((p) => ({ ...p, positionId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                  <SelectContent>
                    {positions.map((p) => <SelectItem key={p.id} value={p.id}>{p.name || p.code || p.id}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {newAssign.scopeType === "DEPARTMENT" && (
              <div>
                <Label>Department</Label>
                <Select value={newAssign.departmentId} onValueChange={(v) => setNewAssign((p) => ({ ...p, departmentId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name || d.code || d.id}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {newAssign.scopeType === "EMPLOYEE" && (
              <div>
                <Label>Employee</Label>
                <Select value={newAssign.employeeId} onValueChange={(v) => setNewAssign((p) => ({ ...p, employeeId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {`${e.employeeId || ""} ${e.firstName || ""} ${e.lastName || ""}`.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Calculation</Label>
              <Select value={newAssign.calculationType} onValueChange={(v) => setNewAssign((p: any) => ({ ...p, calculationType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AMOUNT">Amount</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input type="number" value={newAssign.value} onChange={(e) => setNewAssign((p) => ({ ...p, value: e.target.value }))} />
            </div>
            <div>
              <Label>Currency</Label>
              <Input value={newAssign.currency} onChange={(e) => setNewAssign((p) => ({ ...p, currency: e.target.value }))} />
            </div>
            <div>
              <Label>Effective From</Label>
              <Input type="date" value={newAssign.effectiveFrom} onChange={(e) => setNewAssign((p) => ({ ...p, effectiveFrom: e.target.value }))} />
            </div>
            <div>
              <Label>Effective To</Label>
              <Input type="date" value={newAssign.effectiveTo} onChange={(e) => setNewAssign((p) => ({ ...p, effectiveTo: e.target.value }))} />
            </div>
          </div>
          <Button onClick={createAssignment} disabled={!canCreateAssign}>Add Assignment</Button>

          <div className="rounded border overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Scope</th>
                  <th className="text-left p-2">Target</th>
                  <th className="text-left p-2">Calc</th>
                  <th className="text-left p-2">Value</th>
                  <th className="text-left p-2">From</th>
                  <th className="text-left p-2">To</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="p-2" colSpan={7}>Loading...</td></tr>
                ) : assignments.length === 0 ? (
                  <tr><td className="p-2" colSpan={7}>No assignments</td></tr>
                ) : assignments.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="p-2">{a.benefitType?.name || "-"}</td>
                    <td className="p-2">{a.scopeType}</td>
                    <td className="p-2">
                      {a.scopeType === "POSITION" && (a.position?.name || a.position?.code || "-")}
                      {a.scopeType === "DEPARTMENT" && (a.department?.name || a.department?.code || "-")}
                      {a.scopeType === "EMPLOYEE" &&
                        `${a.employee?.employeeId || ""} ${a.employee?.firstName || ""} ${a.employee?.lastName || ""}`.trim()}
                    </td>
                    <td className="p-2">{a.calculationType}</td>
                    <td className="p-2">{a.calculationType === "PERCENTAGE" ? `${a.value}%` : `${a.currency || "ETB"} ${a.value}`}</td>
                    <td className="p-2">{String(a.effectiveFrom).slice(0, 10)}</td>
                    <td className="p-2">{a.effectiveTo ? String(a.effectiveTo).slice(0, 10) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

