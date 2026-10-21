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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type EmployeePayrollProfile,
} from "../services/payroll-service";
import {
  usePayrollEmployeeProfiles,
  usePayrollBanks,
  useUpdateBankDetailsMutation,
  useAcceptEmployeeMutation,
  useSkipEmployeeMutation,
} from "../services/use-payroll-queries";
import { useCompanyBranding } from "@/services/company-branding";
import { formatETB } from "@/lib/utils";
import {
  Users,
  CreditCard,
  UserCheck,
  UserX,
  MoreHorizontal,
  AlertTriangle,
  Landmark,
} from "lucide-react";

export default function PayrollEmployeesPage() {
  const branding = useCompanyBranding();

  // Queries
  const { data: employees = [], isLoading: isEmpLoading, refetch } = usePayrollEmployeeProfiles();
  const { data: banks = [] } = usePayrollBanks();

  // Mutations
  const updateBankMutation = useUpdateBankDetailsMutation();
  const acceptMutation = useAcceptEmployeeMutation();
  const skipMutation = useSkipEmployeeMutation();

  // Bank Editor Modal State
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeePayrollProfile | null>(null);
  const [bankName, setBankName] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");

  // Skip Reason Modal State
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [skipReason, setSkipReason] = useState("");

  const openBankEditor = (emp: EmployeePayrollProfile) => {
    setSelectedEmp(emp);
    setBankName(emp.bankName || "");
    setBankAccountNo(emp.bankAccountNo || "");
    setBankBranch(emp.bankBranch || "");
    setPaymentMethod(emp.paymentMethod || "BANK_TRANSFER");
    setBankModalOpen(true);
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    await updateBankMutation.mutateAsync({
      employeeId: selectedEmp.employeeIdDb,
      data: {
        bankName,
        accountNumber: bankAccountNo,
        bankBranchName: bankBranch,
        paymentMethod,
      },
    });

    setBankModalOpen(false);
  };

  const handleAccept = async (emp: EmployeePayrollProfile) => {
    await acceptMutation.mutateAsync(emp.employeeIdDb);
  };

  const handleSkipPrompt = (emp: EmployeePayrollProfile) => {
    setSelectedEmp(emp);
    setSkipReason("");
    setSkipModalOpen(true);
  };

  const handleConfirmSkip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    await skipMutation.mutateAsync({
      employeeId: selectedEmp.employeeIdDb,
      reason: skipReason.trim() || "Administrative hold",
    });

    setSkipModalOpen(false);
  };

  // Metrics
  const totalEmployees = employees.length;
  const bankTransferCount = useMemo(
    () => employees.filter((e) => (e.paymentMethod || "BANK_TRANSFER") === "BANK_TRANSFER").length,
    [employees]
  );
  const skippedCount = useMemo(
    () => employees.filter((e) => e.skipFromPayroll).length,
    [employees]
  );
  const missingBankCount = useMemo(
    () =>
      employees.filter(
        (e) =>
          (!e.bankAccountNo || !e.bankName) && (e.paymentMethod || "BANK_TRANSFER") === "BANK_TRANSFER"
      ).length,
    [employees]
  );

  const columns = useMemo<ColumnDef<EmployeePayrollProfile>[]>(
    () => [
      {
        accessorKey: "employeeId",
        header: "Employee",
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm">{emp.fullName}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{emp.employeeId}</span>
                {emp.fullNameAm && (
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
        accessorKey: "department",
        header: "Dept & Branch",
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground">{emp.department || "General"}</span>
              <span className="text-muted-foreground">{emp.branch || emp.payrollBranch || "Main HQ"}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "basicSalary",
        header: () => <div className="text-right">Base Salary (ETB)</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono font-bold text-foreground text-sm">
            {formatETB(row.original.basicSalary)}
          </div>
        ),
      },
      {
        accessorKey: "bankDetails",
        header: "Disbursement & Account",
        cell: ({ row }) => {
          const emp = row.original;
          const isBank = (emp.paymentMethod || "BANK_TRANSFER") === "BANK_TRANSFER";

          if (!isBank) {
            return (
              <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                {emp.paymentMethod || "CASH / CHEQUE"}
              </Badge>
            );
          }

          if (!emp.bankAccountNo) {
            return (
              <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20 flex items-center gap-1 w-fit">
                <AlertTriangle className="w-3 h-3" /> Missing Account
              </Badge>
            );
          }

          return (
            <div className="flex flex-col text-xs">
              <span className="font-medium text-foreground flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-primary" /> {emp.bankName || "Commercial Bank"}
              </span>
              <span className="font-mono text-muted-foreground">
                {emp.bankAccountNo} {emp.bankBranch ? `(${emp.bankBranch})` : ""}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "skipFromPayroll",
        header: "Payroll Status",
        cell: ({ row }) => {
          const isSkipped = row.original.skipFromPayroll;
          if (isSkipped) {
            return (
              <div className="flex flex-col gap-0.5">
                <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 w-fit">
                  <UserX className="w-3 h-3 mr-1" /> On Hold / Skipped
                </Badge>
                {row.original.skipReason && (
                  <span className="text-[10px] text-muted-foreground line-clamp-1">
                    {row.original.skipReason}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 w-fit">
              <UserCheck className="w-3 h-3 mr-1" /> Eligible & Active
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Disbursement Controls</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openBankEditor(emp)} className="cursor-pointer">
                    <CreditCard className="w-4 h-4 mr-2 text-primary" /> Edit Bank Details
                  </DropdownMenuItem>
                  {emp.skipFromPayroll ? (
                    <DropdownMenuItem
                      onClick={() => handleAccept(emp)}
                      className="cursor-pointer text-emerald-600 focus:text-emerald-600"
                    >
                      <UserCheck className="w-4 h-4 mr-2" /> Mark Eligible (Accept)
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => handleSkipPrompt(emp)}
                      className="cursor-pointer text-rose-600 focus:text-rose-600"
                    >
                      <UserX className="w-4 h-4 mr-2" /> Put On Hold (Skip)
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="flex w-full min-w-sm flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Payroll Employee Master &amp; Banking
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {branding?.companyName || "Meku"} staff compensation profiles, commercial bank disbursement accounts, and payroll eligibility exclusions.
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Staff Profiles</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{totalEmployees}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Bank Transfer Beneficiaries</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{bankTransferCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Landmark className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">On Hold / Skipped Staff</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{skippedCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
              <UserX className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Missing Bank Information</p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{missingBankCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TanStack Table Data Grid */}
      <DataTable
        title="Employee Disbursement Directory"
        description="Verify commercial bank branch routing, swift accounts, and active status for payroll runs."
        columns={columns}
        data={employees}
        loading={isEmpLoading}
        searchPlaceholder="Search staff by full name, ID, or bank account..."
        onRefresh={() => refetch()}
        pageSize={10}
      />

      {/* Bank Account Editor Dialog */}
      <Dialog open={bankModalOpen} onOpenChange={setBankModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Edit Bank Details
            </DialogTitle>
            <DialogDescription>
              Configure commercial banking disbursement for <strong>{selectedEmp?.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBank} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="payMethod">Disbursement Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Commercial Bank Transfer</SelectItem>
                  <SelectItem value="CHEQUE">Corporate Cheque</SelectItem>
                  <SelectItem value="CASH">Cash Paypoint</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "BANK_TRANSFER" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="bankSelect">Commercial Bank *</Label>
                  <Select value={bankName} onValueChange={setBankName}>
                    <SelectTrigger id="bankSelect">
                      <SelectValue placeholder="Choose bank" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {banks.map((b) => (
                        <SelectItem key={b.id} value={b.name}>
                          {b.name} ({b.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="accNo">Bank Account Number *</Label>
                  <Input
                    id="accNo"
                    placeholder="e.g. 1000123456789"
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branchName">Branch Name / Location</Label>
                  <Input
                    id="branchName"
                    placeholder="e.g. Bole Medhanialem Branch"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                  />
                </div>
              </>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setBankModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateBankMutation.isPending}>
                {updateBankMutation.isPending ? "Saving..." : "Save Disbursement Details"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Skip Employee Modal */}
      <Dialog open={skipModalOpen} onOpenChange={setSkipModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <UserX className="w-5 h-5" /> Put Employee On Hold
            </DialogTitle>
            <DialogDescription>
              Holding an employee will exclude them from calculation during upcoming payroll cycles
              until explicitly accepted.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmSkip} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="holdReason">Reason for Hold *</Label>
              <Textarea
                id="holdReason"
                placeholder="e.g. Unpaid sabbatical leave, disciplinary investigation, pending clearance..."
                rows={3}
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setSkipModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                disabled={skipMutation.isPending || !skipReason.trim()}
              >
                {skipMutation.isPending ? "Putting on hold..." : "Confirm Hold"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
