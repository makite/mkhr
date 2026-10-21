import React, { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/table-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePayrollCostSharing,
  usePayrollEmployeeProfiles,
  useSaveCostSharingMutation,
} from "../services/use-payroll-queries";
import { formatETB } from "@/lib/utils";
import { GraduationCap, DollarSign, Wallet, Users } from "lucide-react";

export const CostSharingTab: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Queries
  const { data: items = [], isLoading: isCostLoading, refetch } = usePayrollCostSharing();
  const { data: employees = [] } = usePayrollEmployeeProfiles();

  // Mutation
  const saveMutation = useSaveCostSharingMutation();

  // Form State
  const [employeeId, setEmployeeId] = useState("");
  const [university, setUniversity] = useState("");
  const [totalCost, setTotalCost] = useState<number | "">("");

  const resetForm = () => {
    setEmployeeId("");
    setUniversity("");
    setTotalCost("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !totalCost) return;

    await saveMutation.mutateAsync({
      employeeId,
      university: university.trim() || "Public Higher Education Institution",
      totalObligation: Number(totalCost),
      remainingBalance: Number(totalCost),
      deductionPercent: 0.1, // 10% Ethiopian statutory higher education cost sharing
      status: "ACTIVE",
    });

    setDialogOpen(false);
    resetForm();
  };

  // Aggregations
  const totalObligations = useMemo(
    () => items.reduce((sum, cs) => sum + Number(cs.totalObligation || cs.totalCommitment || 0), 0),
    [items]
  );
  const totalRemaining = useMemo(
    () => items.reduce((sum, cs) => sum + Number(cs.remainingBalance || 0), 0),
    [items]
  );
  const activeCount = useMemo(
    () => items.filter((cs) => cs.status === "ACTIVE" || !cs.status).length,
    [items]
  );

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "employee",
        header: "Beneficiary Employee",
        cell: ({ row }) => {
          const emp = row.original.employee;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm">
                {emp?.fullName || row.original.fullName || "-"}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{emp?.employeeId || row.original.employeeId || "-"}</span>
                {emp?.fullNameAm && (
                  <span className="font-amharic text-[11px] text-muted-foreground/80">
                    ({emp.fullNameAm})
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "university",
        header: "University / College",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium">
              {row.original.university || row.original.universityName || "Higher Education"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "totalObligation",
        header: () => <div className="text-right">Total Obligation</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono font-medium text-foreground text-sm">
            {formatETB(row.original.totalObligation || row.original.totalCommitment)}
          </div>
        ),
      },
      {
        accessorKey: "deductionPercent",
        header: () => <div className="text-center">Rate</div>,
        cell: () => (
          <div className="text-center">
            <Badge variant="outline" className="font-mono text-xs bg-primary/5 text-primary">
              10% Statutory
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "remainingBalance",
        header: () => <div className="text-right">Remaining Balance</div>,
        cell: ({ row }) => {
          const rem = Number(row.original.remainingBalance || 0);
          const total = Number(row.original.totalObligation || row.original.totalCommitment || 1);
          const pctPaid = Math.max(0, Math.min(100, Math.round(((total - rem) / total) * 100)));

          return (
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono font-bold text-sm text-foreground">
                {formatETB(rem)}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${pctPaid}%` }}
                  />
                </div>
                <span>{pctPaid}% paid</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status || "ACTIVE";
          const isAct = status === "ACTIVE";
          return (
            <Badge
              variant="outline"
              className={
                isAct
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                  : "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20"
              }
            >
              {status}
            </Badge>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total University Obligations</p>
              <h3 className="text-xl font-bold font-mono tracking-tight text-foreground">
                {formatETB(totalObligations)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Remaining Student Loan Debt</p>
              <h3 className="text-xl font-bold font-mono tracking-tight text-foreground">
                {formatETB(totalRemaining)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Wallet className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Active Cost Sharing Staff</p>
              <h3 className="text-xl font-bold font-mono tracking-tight text-foreground">
                {activeCount} Employees
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TanStack Table Data Grid */}
      <DataTable
        title="Higher Education Cost Sharing Ledger"
        description="Ethiopian statutory higher education repayment: automated 10% withholding from taxable basic salary."
        columns={columns}
        data={items}
        loading={isCostLoading}
        searchPlaceholder="Search cost sharing records by employee or university..."
        onAdd={() => {
          resetForm();
          setDialogOpen(true);
        }}
        onRefresh={() => refetch()}
        pageSize={10}
      />

      {/* Add Agreement Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Record Cost Sharing Agreement
            </DialogTitle>
            <DialogDescription>
              Assign higher education cost sharing obligation per Ministry of Revenues regulations.
              A standard 10% will be deducted from taxable earnings until the obligation is cleared.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="csEmp">Employee *</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger id="csEmp">
                  <SelectValue placeholder="Choose employee" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {employees.map((e) => (
                    <SelectItem key={e.employeeIdDb} value={e.employeeIdDb}>
                      {e.employeeId} — {e.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="uniInput">University / Higher Education Institution</Label>
              <Input
                id="uniInput"
                placeholder="e.g. Addis Ababa University"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="costInput">Total Obligation Amount (ETB) *</Label>
              <Input
                id="costInput"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={totalCost}
                onChange={(e) =>
                  setTotalCost(e.target.value === "" ? "" : parseFloat(e.target.value))
                }
                required
              />
            </div>

            <div className="p-3 bg-muted/50 rounded-lg border text-xs text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Statutory Rate: 10%
              </div>
              <p>
                Deduction occurs automatically during every active payroll run until the remaining
                obligation balance is amortized to zero.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending || !employeeId || !totalCost}
              >
                {saveMutation.isPending ? "Recording..." : "Record Obligation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
