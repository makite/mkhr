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
  usePayrollLoans,
  usePayrollEmployeeProfiles,
  useSaveStaffLoanMutation,
} from "../services/use-payroll-queries";
import { formatETB, formatDate } from "@/lib/utils";
import { CreditCard, DollarSign, Wallet } from "lucide-react";

export const StaffLoansTab: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Queries
  const { data: loans = [], isLoading: isLoansLoading, refetch } = usePayrollLoans();
  const { data: employees = [] } = usePayrollEmployeeProfiles();

  // Mutation
  const saveMutation = useSaveStaffLoanMutation();

  // Form State
  const [employeeId, setEmployeeId] = useState("");
  const [loanType, setLoanType] = useState("STAFF_ADVANCE");
  const [principalAmount, setPrincipalAmount] = useState<number | "">("");
  const [monthlyDeduction, setMonthlyDeduction] = useState<number | "">("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  const resetForm = () => {
    setEmployeeId("");
    setLoanType("STAFF_ADVANCE");
    setPrincipalAmount("");
    setMonthlyDeduction("");
    setStartDate(new Date().toISOString().split("T")[0]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !principalAmount || !monthlyDeduction || !startDate) {
      return;
    }

    await saveMutation.mutateAsync({
      employeeId,
      loanType,
      principalAmount: Number(principalAmount),
      monthlyDeduction: Number(monthlyDeduction),
      startDate,
      remainingBalance: Number(principalAmount),
      status: "ACTIVE",
    });

    setDialogOpen(false);
    resetForm();
  };

  // Executive Metric Aggregations
  const totalPrincipal = useMemo(
    () => loans.reduce((acc, l) => acc + Number(l.principalAmount || 0), 0),
    [loans]
  );
  const totalOutstanding = useMemo(
    () => loans.reduce((acc, l) => acc + Number(l.remainingBalance || 0), 0),
    [loans]
  );
  const totalMonthlyDeductions = useMemo(
    () => loans.reduce((acc, l) => acc + Number(l.monthlyDeduction || 0), 0),
    [loans]
  );

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "employee",
        header: "Employee",
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
        accessorKey: "loanType",
        header: "Loan Category",
        cell: ({ row }) => {
          const type = row.original.loanType || "STAFF_ADVANCE";
          return (
            <Badge variant="outline" className="font-mono text-xs">
              {type.replace("_", " ")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "principalAmount",
        header: () => <div className="text-right">Principal (ETB)</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono font-medium text-foreground text-sm">
            {formatETB(row.original.principalAmount)}
          </div>
        ),
      },
      {
        accessorKey: "monthlyDeduction",
        header: () => <div className="text-right">Monthly Installment</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono font-semibold text-primary text-sm">
            {formatETB(row.original.monthlyDeduction)}
          </div>
        ),
      },
      {
        accessorKey: "remainingBalance",
        header: () => <div className="text-right">Remaining Balance</div>,
        cell: ({ row }) => {
          const rem = Number(row.original.remainingBalance || 0);
          const princ = Number(row.original.principalAmount || 1);
          const pctPaid = Math.max(0, Math.min(100, Math.round(((princ - rem) / princ) * 100)));

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
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono">
            {formatDate(row.original.startDate)}
          </span>
        ),
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
      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Disbursed Principal</p>
              <h3 className="text-xl font-bold font-mono tracking-tight text-foreground">
                {formatETB(totalPrincipal)}
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
              <p className="text-xs font-medium text-muted-foreground">Outstanding Balance</p>
              <h3 className="text-xl font-bold font-mono tracking-tight text-foreground">
                {formatETB(totalOutstanding)}
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
              <p className="text-xs font-medium text-muted-foreground">Monthly Deductions</p>
              <h3 className="text-xl font-bold font-mono tracking-tight text-foreground">
                {formatETB(totalMonthlyDeductions)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TanStack Table Data Grid */}
      <DataTable
        title="Staff Loans & Salary Advances Ledger"
        description="Automated installment deductions and balance amortization against monthly payroll runs."
        columns={columns}
        data={loans}
        loading={isLoansLoading}
        searchPlaceholder="Search loans by employee name or ID..."
        onAdd={() => {
          resetForm();
          setDialogOpen(true);
        }}
        onRefresh={() => refetch()}
        pageSize={10}
      />

      {/* Grant Loan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Grant Staff Loan / Advance
            </DialogTitle>
            <DialogDescription>
              Record an approved loan agreement. Installments will be automatically withheld each
              month until the remaining balance reaches zero.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="empLoan">Employee *</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger id="empLoan">
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
              <Label htmlFor="loanTypeSelect">Loan Category *</Label>
              <Select value={loanType} onValueChange={setLoanType}>
                <SelectTrigger id="loanTypeSelect">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF_ADVANCE">Salary Advance</SelectItem>
                  <SelectItem value="PERSONAL_LOAN">Personal Staff Loan</SelectItem>
                  <SelectItem value="EMERGENCY_LOAN">Emergency Assistance</SelectItem>
                  <SelectItem value="EQUIPMENT_LOAN">Equipment / Tool Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="principalInput">Principal Amount (ETB) *</Label>
                <Input
                  id="principalInput"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={principalAmount}
                  onChange={(e) =>
                    setPrincipalAmount(e.target.value === "" ? "" : parseFloat(e.target.value))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deductionInput">Monthly Installment (ETB) *</Label>
                <Input
                  id="deductionInput"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={monthlyDeduction}
                  onChange={(e) =>
                    setMonthlyDeduction(e.target.value === "" ? "" : parseFloat(e.target.value))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startDateInput">Deduction Start Date *</Label>
              <Input
                id="startDateInput"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending || !employeeId || !principalAmount || !monthlyDeduction}
              >
                {saveMutation.isPending ? "Recording..." : "Record Agreement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
