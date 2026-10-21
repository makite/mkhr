import { useState, useRef, useMemo, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/table-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  type PayrollSlipItem,
  payrollService,
} from "../services/payroll-service";
import {
  usePayrollPeriods,
  usePayrollMasterRegister,
  usePayrollEmployeeProfiles,
  useSubmitPayrollMutation,
  useApprovePayrollMutation,
  useFinalizePayrollMutation,
} from "../services/use-payroll-queries";
import { GlVoucherModal } from "../components/gl-voucher-modal";
import { RollbackModal } from "../components/rollback-modal";
import { MonthEndModal } from "../components/month-end-modal";
import { BackpayModal } from "../components/backpay-modal";
import { useCompanyBranding } from "@/services/company-branding";
import { formatETB, formatUSD } from "@/lib/utils";
import {
  Calculator,
  Send,
  CheckCircle2,
  Lock,
  RotateCcw,
  FileSpreadsheet,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Users,
  Coins,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function PayrollProcessingPage() {
  const branding = useCompanyBranding();

  // Queries
  const { data: periods = [] } = usePayrollPeriods();
  const { data: employees = [] } = usePayrollEmployeeProfiles();

  // Selected Period State (defaults to isCurrent period)
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

  useEffect(() => {
    if (periods.length > 0 && !selectedPeriodId) {
      const current = periods.find((p) => p.isCurrent) || periods[0];
      if (current) setSelectedPeriodId(current.id);
    }
  }, [periods, selectedPeriodId]);

  const {
    data: registerData,
    isLoading: isRegisterLoading,
    refetch: refetchRegister,
  } = usePayrollMasterRegister({ periodId: selectedPeriodId }, !!selectedPeriodId);

  const runSummary = registerData?.run || null;
  const slips = useMemo(
    () =>
      (registerData?.items || []).map((s, idx) => ({
        ...s,
        id: s.slipId || s.employeeIdDb || `slip-${idx}`,
      })),
    [registerData]
  );

  // Mutations
  const submitMutation = useSubmitPayrollMutation();
  const approveMutation = useApprovePayrollMutation();
  const finalizeMutation = useFinalizePayrollMutation();

  // Engine Progress State
  const [calculating, setCalculating] = useState(false);
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const pollingRef = useRef<any>(null);

  // Modals
  const [glModalOpen, setGlModalOpen] = useState(false);
  const [voucherData, setVoucherData] = useState<any>(null);
  const [rollbackOpen, setRollbackOpen] = useState(false);
  const [monthEndOpen, setMonthEndOpen] = useState(false);
  const [backpayOpen, setBackpayOpen] = useState(false);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Initiate Calculation & Poll Progress
  const handleCalculatePayroll = async () => {
    if (!selectedPeriodId) return;
    setCalculating(true);
    setJobProgress(0);
    setProgressMessage("Acquiring computation lock & initializing engine...");

    try {
      const { jobId } = await payrollService.calculatePayroll({
        periodId: selectedPeriodId,
      });

      pollingRef.current = setInterval(async () => {
        try {
          const prog = await payrollService.getJobProgress(jobId);
          setJobProgress(prog.progress || 0);
          setProgressMessage(
            prog.currentEmployee
              ? `Processing ${prog.currentEmployee} (${prog.processedCount} of ${prog.totalCount})...`
              : prog.message || "Executing calculation matrix..."
          );

          if (prog.status === "COMPLETED") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setCalculating(false);
            toast.success("Payroll calculation completed successfully!");
            refetchRegister();
          } else if (prog.status === "FAILED") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setCalculating(false);
            toast.error(prog.message || "Payroll calculation failed.");
          }
        } catch {
          // ignore transient poll error
        }
      }, 500);
    } catch (err: any) {
      setCalculating(false);
      toast.error(err.message || "Failed to initiate payroll generation.");
    }
  };

  // Maker-Checker Handlers
  const handleSubmitApproval = async () => {
    if (!runSummary) return;
    await submitMutation.mutateAsync(runSummary.id);
    refetchRegister();
  };

  const handleApprove = async () => {
    if (!runSummary) return;
    await approveMutation.mutateAsync(runSummary.id);
    refetchRegister();
  };

  const handleFinalize = async () => {
    if (!runSummary) return;
    await finalizeMutation.mutateAsync(runSummary.id);
    refetchRegister();
  };

  const handleOpenGlVoucher = async () => {
    if (!selectedPeriodId) return;
    try {
      const res = await payrollService.getGlJournal({ periodId: selectedPeriodId });
      setVoucherData(res);
      setGlModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate GL journal voucher.");
    }
  };

  // Export Master Register to CSV
  const handleExportCSV = () => {
    if (slips.length === 0) {
      toast.error("No payroll slips recorded to export.");
      return;
    }

    const headers = [
      "Row No",
      "Employee ID",
      "Full Name",
      "Amharic Name",
      "Branch",
      "Department",
      "Position",
      "Basic Salary",
      "Payable Salary",
      "Transport Allowance",
      "Transport (Non-Taxable)",
      "Gross Earnings",
      "Taxable Earnings",
      "Income Tax (Proc 979)",
      "Pension 7%",
      "Pension 11%",
      "Cost Sharing 10%",
      "Staff Loan",
      "Total Deductions",
      "Net Pay ETB",
      "Net Pay USD",
      "Bank Account",
    ];

    const csvRows = [headers.join(",")];

    slips.forEach((s) => {
      const row = [
        s.rowNo,
        `"${s.employeeId}"`,
        `"${s.fullName}"`,
        `"${s.fullNameAm || ""}"`,
        `"${s.branch}"`,
        `"${s.department || ""}"`,
        `"${s.position || ""}"`,
        s.basicSalary,
        s.salaryPayable,
        s.transportAllowance,
        s.transportAllowanceNonTaxable,
        s.grossEarning,
        s.taxableEarnings,
        s.incomeTax,
        s.employeePension7,
        s.pension11,
        s.costSharing,
        s.staffLoan,
        s.totalDeduction,
        s.netPayETB,
        s.netPayUSD,
        `"${s.bankAccount || ""}"`,
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const currentP = periods.find((p) => p.id === selectedPeriodId);
    link.setAttribute(
      "download",
      `Payroll_Register_${currentP?.name.replace(/\s+/g, "_") || "Period"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Payroll Master Register exported to CSV.");
  };

  // Status Badge Helper
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20">
            DRAFT (Work in progress)
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20">
            SUBMITTED (Pending Checker)
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
            APPROVED (Awaiting Finalization)
          </Badge>
        );
      case "FINALIZED":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20">
            FINALIZED &amp; LOCKED
          </Badge>
        );
      case "CLOSED":
        return (
          <Badge variant="outline" className="bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20">
            CLOSED &amp; ARCHIVED (YTD)
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            NOT INITIATED
          </Badge>
        );
    }
  };

  // Master Register Table Columns
  const columns = useMemo<ColumnDef<PayrollSlipItem & { id: string }>[]>(
    () => [
      {
        accessorKey: "employee",
        header: "Employee",
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex flex-col min-w-[140px]">
              <span className="font-semibold text-foreground text-sm">{s.fullName}</span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-mono">{s.employeeId}</span>
                {s.fullNameAm && (
                  <span className="font-amharic text-[11px] text-muted-foreground/80">
                    ({s.fullNameAm})
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "branch",
        header: "Dept & Branch",
        cell: ({ row }) => (
          <div className="flex flex-col text-xs min-w-[100px]">
            <span className="font-medium text-foreground">{row.original.department || "General"}</span>
            <span className="text-muted-foreground">{row.original.branch}</span>
          </div>
        ),
      },
      {
        accessorKey: "basicSalary",
        header: () => <div className="text-right">Base Salary</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-foreground font-medium">
            {formatETB(row.original.basicSalary)}
          </div>
        ),
      },
      {
        accessorKey: "grossEarning",
        header: () => <div className="text-right">Gross Earnings</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs font-semibold text-foreground">
            {formatETB(row.original.grossEarning)}
          </div>
        ),
      },
      {
        accessorKey: "taxableEarnings",
        header: () => <div className="text-right">Taxable Gross</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-muted-foreground">
            {formatETB(row.original.taxableEarnings)}
          </div>
        ),
      },
      {
        accessorKey: "incomeTax",
        header: () => <div className="text-right">Income Tax (Proc 979)</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs font-medium text-rose-600 dark:text-rose-400">
            {formatETB(row.original.incomeTax)}
          </div>
        ),
      },
      {
        accessorKey: "employeePension7",
        header: () => <div className="text-right">Pension (7%)</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-amber-600 dark:text-amber-400">
            {formatETB(row.original.employeePension7)}
          </div>
        ),
      },
      {
        accessorKey: "pension11",
        header: () => <div className="text-right">Org Pension (11%)</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-muted-foreground">
            {formatETB(row.original.pension11)}
          </div>
        ),
      },
      {
        accessorKey: "costSharing",
        header: () => <div className="text-right">Cost Share (10%)</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-muted-foreground">
            {row.original.costSharing ? formatETB(row.original.costSharing) : "-"}
          </div>
        ),
      },
      {
        accessorKey: "totalDeduction",
        header: () => <div className="text-right">Total Deductions</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
            {formatETB(row.original.totalDeduction)}
          </div>
        ),
      },
      {
        accessorKey: "netPayETB",
        header: () => <div className="text-right">Net Payable (ETB)</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
            {formatETB(row.original.netPayETB)}
          </div>
        ),
      },
      {
        accessorKey: "netPayUSD",
        header: () => <div className="text-right">Net (USD)</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-muted-foreground">
            {row.original.netPayUSD ? formatUSD(row.original.netPayUSD) : "-"}
          </div>
        ),
      },
      {
        accessorKey: "bankAccount",
        header: "Bank Disbursement",
        cell: ({ row }) => (
          <div className="text-xs font-mono text-muted-foreground max-w-[140px] truncate">
            {row.original.bankAccount || "Cash / Unassigned"}
          </div>
        ),
      },
    ],
    []
  );

  const currentPeriodObj = periods.find((p) => p.id === selectedPeriodId);

  return (
    <div className="flex w-full min-w-sm flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Payroll Engine &amp; Master Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {branding?.companyName || "Meku"} monthly compensation calculation, statutory tax &amp;
            pension withholding, Maker-Checker authorization, and GL posting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
              <SelectTrigger className="w-60 bg-background font-medium">
                <SelectValue placeholder="Choose fiscal period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.isCurrent ? "— Current Cycle" : `(${p.status})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetchRegister()}
            disabled={isRegisterLoading}
            title="Refresh register data"
          >
            <RefreshCw className={`w-4 h-4 ${isRegisterLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Progress Bar (Visible during calculation engine run) */}
      {calculating && (
        <Card className="border border-primary/30 bg-primary/5 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-primary flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                {progressMessage}
              </span>
              <span className="font-mono font-bold text-primary">{jobProgress}%</span>
            </div>
            <div className="w-full bg-primary/10 h-3 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${jobProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Step Ribbon & Status Card */}
      <Card className="border shadow-2xs">
        <CardContent className="p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-foreground">
                Period Cycle: {currentPeriodObj?.name || "Select Period"}
              </h3>
              {renderStatusBadge(runSummary?.status)}
            </div>
            <p className="text-xs text-muted-foreground">
              Window: {currentPeriodObj?.startDate ? new Date(currentPeriodObj.startDate).toLocaleDateString() : "-"} –{" "}
              {currentPeriodObj?.endDate ? new Date(currentPeriodObj.endDate).toLocaleDateString() : "-"} •{" "}
              Working Days: {currentPeriodObj?.workingDays || 22}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {(!runSummary || runSummary.status === "DRAFT") && (
              <>
                <Button
                  onClick={handleCalculatePayroll}
                  disabled={calculating || !selectedPeriodId}
                  className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs"
                >
                  <Calculator className="w-4 h-4" />
                  {calculating ? "Calculating..." : runSummary ? "Recalculate Run" : "Generate Payroll"}
                </Button>

                {runSummary && slips.length > 0 && (
                  <Button
                    onClick={handleSubmitApproval}
                    disabled={submitMutation.isPending}
                    variant="outline"
                    className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Send className="w-4 h-4" />
                    {submitMutation.isPending ? "Submitting..." : "Submit for Approval"}
                  </Button>
                )}
              </>
            )}

            {runSummary?.status === "SUBMITTED" && (
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                {approveMutation.isPending ? "Approving..." : "Approve (Checker)"}
              </Button>
            )}

            {runSummary?.status === "APPROVED" && (
              <Button
                onClick={handleFinalize}
                disabled={finalizeMutation.isPending}
                className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-2xs"
              >
                <Lock className="w-4 h-4" />
                {finalizeMutation.isPending ? "Finalizing..." : "Finalize & Lock"}
              </Button>
            )}

            {(runSummary?.status === "FINALIZED" || runSummary?.status === "CLOSED") && (
              <Button
                onClick={handleOpenGlVoucher}
                variant="outline"
                className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
              >
                <FileSpreadsheet className="w-4 h-4" /> GL Journal Voucher
              </Button>
            )}

            {runSummary?.status === "FINALIZED" && (
              <>
                <Button
                  onClick={() => setMonthEndOpen(true)}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                >
                  <ShieldCheck className="w-4 h-4" /> Close Month End
                </Button>

                <Button
                  onClick={() => setRollbackOpen(true)}
                  variant="outline"
                  className="gap-1.5 border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                >
                  <RotateCcw className="w-4 h-4" /> Rollback to Draft
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setBackpayOpen(true)}
              className="gap-1.5"
            >
              <Coins className="w-4 h-4 text-primary" /> Backpay
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={slips.length === 0}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Metric Strip */}
      {runSummary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="border shadow-2xs">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Headcount
              </span>
              <p className="text-base font-bold font-mono text-foreground">
                {runSummary.totalEmployees} Staff
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-primary" /> Total Gross
              </span>
              <p className="text-base font-bold font-mono text-foreground">
                {formatETB(runSummary.totalGross)}
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-rose-500" /> Income Tax
              </span>
              <p className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                {formatETB(runSummary.totalIncomeTax)}
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Pension (7%+11%)
              </span>
              <p className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                {formatETB(
                  Number(runSummary.totalPensionEmp || 0) + Number(runSummary.totalPensionOrg || 0)
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Total Deductions</span>
              <p className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                {formatETB(runSummary.totalDeductions)}
              </p>
            </CardContent>
          </Card>

          <Card className="border shadow-2xs bg-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                Net Disbursement
              </span>
              <p className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {formatETB(runSummary.totalNetPayETB)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TanStack Table Data Grid */}
      <DataTable
        title="Statutory Master Register"
        description="Comprehensive employee compensation breakdown adhering to Ethiopian Employment Income Tax Proclamation 979/2016."
        columns={columns}
        data={slips}
        loading={isRegisterLoading}
        searchPlaceholder="Search slips by employee name, ID, or bank account..."
        onRefresh={() => refetchRegister()}
        pageSize={15}
      />

      {/* Modals */}
      <GlVoucherModal
        open={glModalOpen}
        onOpenChange={setGlModalOpen}
        voucherData={voucherData}
      />

      <RollbackModal
        open={rollbackOpen}
        onOpenChange={setRollbackOpen}
        runId={runSummary?.id || null}
        onSuccess={() => refetchRegister()}
      />

      <MonthEndModal
        open={monthEndOpen}
        onOpenChange={setMonthEndOpen}
        periodId={selectedPeriodId}
        periodName={currentPeriodObj?.name || "Active Period"}
        onSuccess={() => refetchRegister()}
      />

      <BackpayModal
        open={backpayOpen}
        onOpenChange={setBackpayOpen}
        periods={periods}
        employees={employees.map((e) => ({
          id: e.employeeIdDb,
          fullName: e.fullName,
          basicSalary: e.basicSalary,
        }))}
        onSuccess={() => refetchRegister()}
      />
    </div>
  );
}
