import { useEffect, useState, useRef, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  type PayrollPeriod,
  type PayrollRunSummary,
  type PayrollSlipItem,
  payrollService,
} from "../services/payroll-service";
import { GlVoucherModal } from "../components/gl-voucher-modal";
import { RollbackModal } from "../components/rollback-modal";
import { MonthEndModal } from "../components/month-end-modal";
import { BackpayModal } from "../components/backpay-modal";
import { useCompanyBranding } from "@/services/company-branding";
import { 
  Calculator, 
  Send, 
  CheckCircle2, 
  Lock, 
  RotateCcw, 
  FileSpreadsheet, 
  Receipt, 
  Calendar, 
  DollarSign, 
  Download, 
  Search, 
  TrendingUp, 
  ShieldCheck, 
  Users 
} from "lucide-react";
import { toast } from "sonner";

export default function PayrollProcessingPage() {
  const branding = useCompanyBranding();
  const primaryColor = branding?.primaryColor || "#1e40af";
  const secondaryColor = branding?.secondaryColor || "#0f172a";

  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [runSummary, setRunSummary] = useState<PayrollRunSummary | null>(null);
  const [slips, setSlips] = useState<PayrollSlipItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Progress Bar State
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

  // 1. Load Initial Periods
  useEffect(() => {
    payrollService.getPeriods().then((res) => {
      setPeriods(res || []);
      const current = res.find((p) => p.isCurrent) || res[0];
      if (current) {
        setSelectedPeriodId(current.id);
      }
    });
  }, []);

  // 2. Fetch Master Register when period changes
  const loadRegister = async () => {
    if (!selectedPeriodId) return;
    setLoading(true);
    try {
      const res = await payrollService.getMasterRegister({
        periodId: selectedPeriodId,
      });
      setRunSummary(res.run || null);
      setSlips(res.items || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load master register.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPeriodId) {
      loadRegister();
    }
  }, [selectedPeriodId]);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // 3. Initiate Calculation & Poll Progress Bar
  const handleCalculatePayroll = async () => {
    if (!selectedPeriodId) return;
    setCalculating(true);
    setJobProgress(0);
    setProgressMessage("Acquiring lock & initializing engine...");

    try {
      const { jobId } = await payrollService.calculatePayroll({
        periodId: selectedPeriodId,
      });

      // Poll progress every 500ms
      pollingRef.current = setInterval(async () => {
        try {
          const prog = await payrollService.getJobProgress(jobId);
          setJobProgress(prog.progress || 0);
          setProgressMessage(
            prog.currentEmployee
              ? `Processing ${prog.currentEmployee} (${prog.processedCount} of ${prog.totalCount})...`
              : prog.message || "Calculating..."
          );

          if (prog.status === "COMPLETED") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setCalculating(false);
            toast.success("Payroll calculation completed successfully!");
            loadRegister();
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

  // 4. Maker-Checker Actions
  const handleSubmitApproval = async () => {
    if (!runSummary) return;
    try {
      await payrollService.submitForApproval(runSummary.id);
      toast.success("Payroll submitted for checker approval.");
      loadRegister();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payroll.");
    }
  };

  const handleApprove = async () => {
    if (!runSummary) return;
    try {
      await payrollService.approvePayroll(runSummary.id);
      toast.success("Payroll successfully approved.");
      loadRegister();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve payroll.");
    }
  };

  const handleFinalize = async () => {
    if (!runSummary) return;
    try {
      await payrollService.finalizePayroll(runSummary.id);
      toast.success("Payroll successfully finalized and locked!");
      loadRegister();
    } catch (err: any) {
      toast.error(err.message || "Failed to finalize payroll.");
    }
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

  // 5. Export to CSV
  const handleExportCSV = () => {
    if (slips.length === 0) {
      toast.error("No payroll data to export.");
      return;
    }

    const headers = [
      "Row No", "Employee ID", "Full Name", "Amharic Name", "Branch", "Basic Salary",
      "Salary Payable", "Transport Allowance", "Transport (Non-Taxable)", "Hardship Allowance",
      "Housing Allowance", "Rep Allowance", "Comm Allowance", "Over Time", "Other Allowance",
      "Gross Earning", "Taxable Earnings", "Income Tax", "Employee Pension (7%)", "Pension (11%)",
      "Staff Loan", "Cost Sharing", "Provident Fund (4%)", "Other Deduction", "Total Deduction",
      "Net Pay (ETB)", "Net Pay (USD)", "Bank Account"
    ];

    const rows = slips.map(s => [
      s.rowNo, s.employeeId, `"${s.fullName}"`, `"${s.fullNameAm || ""}"`, `"${s.branch}"`,
      s.basicSalary, s.salaryPayable, s.transportAllowance, s.transportAllowanceNonTaxable,
      s.hardshipAllowance, s.housingAllowance, s.repAllowance, s.commAllowance, s.overTime,
      s.otherAllowance, s.grossEarning, s.taxableEarnings, s.incomeTax, s.employeePension7,
      s.pension11, s.staffLoan, s.costSharing, s.pf4, s.otherDeduction, s.totalDeduction,
      s.netPayETB, s.netPayUSD, `"${s.bankAccount}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(",")).join("\n")];
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payroll_register_${runSummary?.periodName || "period"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Master payroll register exported to CSV.");
  };

  const selectedPeriod = periods.find(p => p.id === selectedPeriodId);

  const filteredSlips = useMemo(() => {
    if (!search.trim()) return slips;
    const q = search.toLowerCase();
    return slips.filter(s =>
      s.fullName?.toLowerCase().includes(q) ||
      s.employeeId?.toLowerCase().includes(q) ||
      s.branch?.toLowerCase().includes(q)
    );
  }, [slips, search]);

  return (
    <div className="w-full max-w-full overflow-hidden flex flex-col gap-6 p-4 md:p-6">
      {/* Branded Header Banner */}
      <div 
        className="w-full rounded-2xl p-6 text-white shadow-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        }}
      >
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {branding?.companyName || "Meku"} Payroll Processing Center
            </h1>
            {runSummary && (
              <Badge 
                className={`font-semibold px-2.5 py-0.5 text-xs ${
                  runSummary.status === "FINALIZED" ? "bg-emerald-500 text-white" :
                  runSummary.status === "APPROVED" ? "bg-blue-400 text-white" :
                  runSummary.status === "SUBMITTED" ? "bg-amber-400 text-gray-900" :
                  "bg-white/20 text-white"
                }`}
              >
                ● {runSummary.status}
              </Badge>
            )}
          </div>
          <p className="text-sm text-blue-100">
            Automated statutory calculations (Proc 979/2016 Income Tax &amp; Proc 1156/2019 Labour), mid-period proration, and maker-checker approval controls.
          </p>
        </div>

        {/* Primary Period Selection & Calculate CTA */}
        <div className="flex flex-wrap items-center gap-3 bg-white/10 p-2.5 rounded-xl backdrop-blur-xs border border-white/20">
          <div className="w-52">
            <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
              <SelectTrigger className="bg-white text-gray-900 font-medium">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.isCurrent ? "★ Active" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCalculatePayroll}
            disabled={calculating || runSummary?.status === "FINALIZED" || runSummary?.status === "CLOSED"}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md gap-1.5 transition-all"
          >
            <Calculator className="w-4 h-4" />
            {calculating ? "Calculating..." : runSummary ? "Recalculate" : "Generate Payroll"}
          </Button>
        </div>
      </div>

      {/* Real-Time Animated Calculation Progress Bar */}
      {calculating && (
        <Card className="border-blue-200 bg-blue-50/70 shadow-sm animate-pulse">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold text-blue-900">
              <span className="flex items-center gap-2">
                <span className="animate-spin text-base">⏳</span> {progressMessage}
              </span>
              <span className="font-mono">{jobProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${jobProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maker-Checker Workflow Toolbar & Secondary Actions */}
      <div className="w-full bg-white p-4 rounded-xl border shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
          <span className="font-semibold text-gray-900">Lifecycle Status:</span>
          <span className={`px-2 py-0.5 rounded-full ${runSummary?.status === "DRAFT" ? "bg-amber-100 text-amber-800 font-bold" : "text-gray-400"}`}>
            1. Draft
          </span>
          <span className="text-gray-300">→</span>
          <span className={`px-2 py-0.5 rounded-full ${runSummary?.status === "SUBMITTED" ? "bg-blue-100 text-blue-800 font-bold" : "text-gray-400"}`}>
            2. Submitted
          </span>
          <span className="text-gray-300">→</span>
          <span className={`px-2 py-0.5 rounded-full ${runSummary?.status === "APPROVED" ? "bg-indigo-100 text-indigo-800 font-bold" : "text-gray-400"}`}>
            3. Approved
          </span>
          <span className="text-gray-300">→</span>
          <span className={`px-2 py-0.5 rounded-full ${runSummary?.status === "FINALIZED" ? "bg-emerald-100 text-emerald-800 font-bold" : "text-gray-400"}`}>
            4. Finalized
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {runSummary?.status === "DRAFT" && (
            <Button 
              onClick={handleSubmitApproval} 
              style={{ backgroundColor: primaryColor }} 
              className="text-white hover:opacity-90 gap-1.5 text-xs h-9"
            >
              <Send className="w-3.5 h-3.5" /> Submit for Approval
            </Button>
          )}

          {runSummary?.status === "SUBMITTED" && (
            <Button 
              onClick={handleApprove} 
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs h-9"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve Payroll
            </Button>
          )}

          {runSummary?.status === "APPROVED" && (
            <Button 
              onClick={handleFinalize} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs h-9"
            >
              <Lock className="w-3.5 h-3.5" /> Finalize &amp; Lock
            </Button>
          )}

          {runSummary?.status === "FINALIZED" && (
            <Button 
              variant="outline" 
              onClick={() => setRollbackOpen(true)} 
              className="border-red-300 text-red-600 hover:bg-red-50 gap-1.5 text-xs h-9"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Admin Rollback to Draft
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={handleOpenGlVoucher} className="gap-1.5 text-xs h-9">
            <Receipt className="w-3.5 h-3.5 text-gray-500" /> GL Voucher
          </Button>

          <Button variant="outline" size="sm" onClick={() => setBackpayOpen(true)} className="gap-1.5 text-xs h-9">
            <DollarSign className="w-3.5 h-3.5 text-gray-500" /> Backpay
          </Button>

          <Button variant="outline" size="sm" onClick={() => setMonthEndOpen(true)} className="gap-1.5 text-xs h-9 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
            <Calendar className="w-3.5 h-3.5" /> Close Month End
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs h-9">
            <Download className="w-3.5 h-3.5 text-gray-500" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {runSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="p-3 bg-white shadow-2xs border">
            <div className="text-[11px] font-semibold text-gray-500 uppercase flex items-center gap-1">
              <Users className="w-3 h-3 text-purple-600" /> Employees
            </div>
            <div className="text-lg font-bold text-gray-900 mt-1">{runSummary.totalEmployees}</div>
          </Card>

          <Card className="p-3 bg-white shadow-2xs border">
            <div className="text-[11px] font-semibold text-gray-500 uppercase flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-600" /> Gross Earnings
            </div>
            <div className="text-base font-bold text-blue-700 font-mono mt-1">
              ETB {Number(runSummary.totalGross || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </Card>

          <Card className="p-3 bg-white shadow-2xs border">
            <div className="text-[11px] font-semibold text-gray-500 uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-600" /> Income Tax
            </div>
            <div className="text-base font-bold text-amber-700 font-mono mt-1">
              ETB {Number(runSummary.totalIncomeTax || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </Card>

          <Card className="p-3 bg-white shadow-2xs border">
            <div className="text-[11px] font-semibold text-gray-500 uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-600" /> Pension (18%)
            </div>
            <div className="text-base font-bold text-indigo-700 font-mono mt-1">
              ETB {(Number(runSummary.totalPensionEmp || 0) + Number(runSummary.totalPensionOrg || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </Card>

          <Card className="p-3 bg-white shadow-2xs border">
            <div className="text-[11px] font-semibold text-gray-500 uppercase flex items-center gap-1">
              <Receipt className="w-3 h-3 text-rose-600" /> Total Deductions
            </div>
            <div className="text-base font-bold text-rose-700 font-mono mt-1">
              ETB {Number(runSummary.totalDeductions || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </Card>

          <Card className="p-3 bg-emerald-50 border-emerald-200 shadow-2xs">
            <div className="text-[11px] font-semibold text-emerald-800 uppercase flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-600" /> Net Disbursement
            </div>
            <div className="text-base font-bold text-emerald-700 font-mono mt-1">
              ETB {Number(runSummary.totalNetPayETB || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-emerald-600 font-mono">
              ≈ USD ${Number(runSummary.totalNetPayUSD || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </Card>
        </div>
      )}

      {/* Filter and Count Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search register by name, ID or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Showing <strong>{filteredSlips.length}</strong> of <strong>{slips.length}</strong> employee register entries
        </div>
      </div>

      {/* 26-Column Master Payroll Register Table with Responsive Container & Sticky Columns */}
      <div className="w-full max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
        <div className="overflow-x-auto max-h-[600px] relative">
          <Table className="text-xs whitespace-nowrap min-w-[2800px]">
            <TableHeader className="bg-gray-100/95 sticky top-0 z-20 shadow-xs backdrop-blur-xs">
              <TableRow>
                <TableHead className="w-12 text-center sticky left-0 z-30 bg-gray-100">#</TableHead>
                <TableHead className="w-28 sticky left-12 z-30 bg-gray-100">Employee ID</TableHead>
                <TableHead className="min-w-[150px] sticky left-40 z-30 bg-gray-100">Full Name</TableHead>
                <TableHead className="min-w-[130px]">Amharic Name</TableHead>
                <TableHead className="min-w-[120px]">Branch</TableHead>
                <TableHead className="text-right">Basic Salary</TableHead>
                <TableHead className="text-right">Salary Payable</TableHead>
                <TableHead className="text-right">Transport Allow</TableHead>
                <TableHead className="text-right">Transport Non-Tax</TableHead>
                <TableHead className="text-right">Hardship Allow</TableHead>
                <TableHead className="text-right">Housing Allow</TableHead>
                <TableHead className="text-right">Rep Allow</TableHead>
                <TableHead className="text-right">Comm Allow</TableHead>
                <TableHead className="text-right">Over Time</TableHead>
                <TableHead className="text-right">Other Allow</TableHead>
                <TableHead className="text-right font-bold bg-blue-50/70 text-blue-900">Gross Earning</TableHead>
                <TableHead className="text-right">Taxable Earnings</TableHead>
                <TableHead className="text-right font-bold text-amber-700 bg-amber-50/40">Income Tax</TableHead>
                <TableHead className="text-right">Pension 7%</TableHead>
                <TableHead className="text-right">Pension 11%</TableHead>
                <TableHead className="text-right">Staff Loan</TableHead>
                <TableHead className="text-right">Cost Sharing</TableHead>
                <TableHead className="text-right">Provident Fund</TableHead>
                <TableHead className="text-right">Other Ded</TableHead>
                <TableHead className="text-right font-bold text-rose-700 bg-rose-50/70">Total Ded</TableHead>
                <TableHead className="text-right font-bold text-emerald-800 bg-emerald-100 sticky right-0 z-30 shadow-xs">
                  Net Pay (ETB)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={26} className="text-center py-12 text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-spin text-base">⏳</span> Loading master payroll register...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSlips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={26} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="w-8 h-8 text-gray-300" />
                      <p className="font-medium text-gray-600">No payroll records found for this period.</p>
                      <p className="text-xs text-gray-400">Click 'Generate Payroll' in the top right to calculate employee salaries.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSlips.map((s) => (
                  <TableRow key={s.slipId} className="hover:bg-blue-50/20 transition-colors">
                    <TableCell className="text-center font-mono text-gray-400 sticky left-0 bg-white z-10">{s.rowNo}</TableCell>
                    <TableCell className="font-mono font-bold text-blue-600 sticky left-12 bg-white z-10">{s.employeeId}</TableCell>
                    <TableCell className="font-medium text-gray-900 sticky left-40 bg-white z-10">{s.fullName}</TableCell>
                    <TableCell className="text-gray-600 font-normal">{s.fullNameAm || "-"}</TableCell>
                    <TableCell>{s.branch}</TableCell>
                    <TableCell className="text-right font-mono">{Number(s.basicSalary || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right font-mono font-medium">{Number(s.salaryPayable || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right font-mono">{s.transportAllowance ? Number(s.transportAllowance).toFixed(2) : "-"}</TableCell>
                    <TableCell className="text-right font-mono">{s.transportAllowanceNonTaxable ? Number(s.transportAllowanceNonTaxable).toFixed(2) : "-"}</TableCell>
                    <TableCell className="text-right font-mono">{s.hardshipAllowance ? Number(s.hardshipAllowance).toFixed(2) : "-"}</TableCell>
                    <TableCell className="text-right font-mono">{s.housingAllowance ? Number(s.housingAllowance).toFixed(2) : "-"}</TableCell>
                    <TableCell className="text-right font-mono">{s.repAllowance ? Number(s.repAllowance).toFixed(2) : "-"}</TableCell>
                    <TableCell className="text-right font-mono">{s.commAllowance ? Number(s.commAllowance).toFixed(2) : "-"}</TableCell>
                    <TableCell className="text-right font-mono">{s.overTime ? Number(s.overTime).toFixed(2) : "-"}</TableCell>
                    <TableCell className="text-right font-mono">{s.otherAllowance ? Number(s.otherAllowance).toFixed(2) : "-"}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-blue-700 bg-blue-50/40">
                      {Number(s.grossEarning || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono">{Number(s.taxableEarnings || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-amber-700 bg-amber-50/20">
                      {Number(s.incomeTax || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono">{Number(s.employeePension7 || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right font-mono">{Number(s.pension11 || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right font-mono">{s.staffLoan ? Number(s.staffLoan).toFixed(2) : "-"}</TableCell>
                    <TableCell className="text-right font-mono">{s.costSharing ? Number(s.costSharing).toFixed(2) : "-"}</TableCell>
                    <TableCell className="text-right font-mono">{s.pf4 ? Number(s.pf4).toFixed(2) : "-"}</TableCell>
                    <TableCell className="text-right font-mono">{s.otherDeduction ? Number(s.otherDeduction).toFixed(2) : "-"}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-rose-700 bg-rose-50/40">
                      {Number(s.totalDeduction || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald-800 bg-emerald-50 sticky right-0 z-10 shadow-xs">
                      {Number(s.netPayETB || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Auxiliary Operation Modals */}
      <GlVoucherModal
        open={glModalOpen}
        onOpenChange={setGlModalOpen}
        voucherData={voucherData}
      />

      {runSummary && (
        <RollbackModal
          open={rollbackOpen}
          onOpenChange={setRollbackOpen}
          runId={runSummary.id}
          onSuccess={loadRegister}
        />
      )}

      {selectedPeriod && (
        <MonthEndModal
          open={monthEndOpen}
          onOpenChange={setMonthEndOpen}
          periodId={selectedPeriod?.id || null}
          periodName={selectedPeriod?.name || ""}
          onSuccess={() => {
            payrollService.getPeriods().then(setPeriods);
            loadRegister();
          }}
        />
      )}

      {selectedPeriod && (
        <BackpayModal
          open={backpayOpen}
          onOpenChange={setBackpayOpen}
          periods={periods}
          employees={slips.map((s) => ({ id: s.employeeId, fullName: s.fullName, basicSalary: s.basicSalary }))}
          onSuccess={loadRegister}
        />
      )}
    </div>
  );
}
