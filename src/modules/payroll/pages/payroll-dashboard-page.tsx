import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayrollDashboard } from "../services/use-payroll-queries";
import { useCompanyBranding } from "@/services/company-branding";
import { useNavigate } from "react-router";
import { formatETB, formatUSD } from "@/lib/utils";
import {
  Building2,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Fuel,
  Receipt,
  Calculator,
  Wallet,
  Landmark,
} from "lucide-react";

export default function PayrollDashboardPage() {
  const branding = useCompanyBranding();
  const navigate = useNavigate();

  const { data, isLoading, refetch, isRefetching } = usePayrollDashboard();

  const primaryColor = branding?.primaryColor || "#015896";
  const secondaryColor = branding?.secondaryColor || "#0b2545";

  if (isLoading) {
    return (
      <div className="flex w-full min-w-sm flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const curPeriod = data?.currentPeriod;
  const summary = data?.summary;
  const empStats = data?.employees;
  const deductions = data?.deductionsBreakdown;
  const deptCosts = data?.departmentCosts || [];
  const history = data?.historicalRuns || [];

  return (
    <div className="flex w-full min-w-sm flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Top Branded Executive Banner */}
      <div
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 md:p-8 rounded-2xl text-white shadow-lg transition-all relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {branding?.companyName || "Meku"} Payroll Executive Dashboard
            </h1>
            {curPeriod && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-2.5 py-1 text-xs shadow-2xs">
                Active Cycle: {curPeriod.name}
              </Badge>
            )}
          </div>
          <p className="text-sm text-blue-100 max-w-2xl">
            Real-time compensation analytics, statutory deductions (Proclamation 979/2016 &amp; 1156/2019), and multi-currency disbursement overview.
          </p>

          {/* Quick Rates Pill Banner */}
          {curPeriod && (
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-blue-100">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full backdrop-blur-xs">
                <Fuel className="w-3.5 h-3.5 text-amber-300" />
                Fuel Rate: <strong className="text-white font-mono">ETB {Number(curPeriod.fuelRate || 0).toFixed(2)}/L</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full backdrop-blur-xs">
                <DollarSign className="w-3.5 h-3.5 text-emerald-300" />
                USD Exchange: <strong className="text-white font-mono">1 USD = {Number(curPeriod.exchangeRateUSD || 0).toFixed(2)} ETB</strong>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
          <Button
            variant="secondary"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs shadow-2xs"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button
            className="bg-white text-gray-900 hover:bg-gray-100 font-bold shadow-md"
            onClick={() => navigate("/payroll/processing")}
          >
            Open Payroll Engine <ArrowRight className="w-4 h-4 ml-2 text-primary" />
          </Button>
        </div>
      </div>

      {/* Primary KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Monthly Gross Payroll</p>
              <h3 className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {formatETB(summary?.totalGross || 0)}
              </h3>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <Users className="w-3 h-3" /> {empStats?.totalEmployees || 0} active employees
              </p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Net Take-Home Pay (Disbursement)</p>
              <h3 className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatETB(summary?.totalNetPayETB || 0)}
              </h3>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <Landmark className="w-3 h-3 text-emerald-500" />
                {summary?.totalNetPayUSD ? formatUSD(summary.totalNetPayUSD) : "Direct Electronic Transfer"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Wallet className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Statutory Employment Tax (Proc 979)</p>
              <h3 className="text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
                {formatETB(summary?.totalIncomeTax || 0)}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">Withheld for Ministry of Revenues</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Pension (7% + 11%)</p>
              <h3 className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
                {formatETB(Number(summary?.totalPensionEmp || 0) + Number(summary?.totalPensionOrg || 0))}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Emp: {formatETB(summary?.totalPensionEmp || 0)} • Org: {formatETB(summary?.totalPensionOrg || 0)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
              <Building2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Deductions Breakdown & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deductions Breakdown Card */}
        <Card className="border shadow-2xs lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" /> Statutory &amp; Voluntary Deductions Summary
              </span>
              <span className="text-xs font-mono font-semibold text-rose-600">
                Total: {formatETB(summary?.totalDeductions || 0)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-muted/40 rounded-xl border border-border">
                <span className="text-[11px] text-muted-foreground block font-medium">Income Tax (Proc 979)</span>
                <strong className="text-sm font-mono text-rose-600 font-bold block mt-1">
                  {formatETB(deductions?.incomeTax || summary?.totalIncomeTax || 0)}
                </strong>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border">
                <span className="text-[11px] text-muted-foreground block font-medium">Employee Pension (7%)</span>
                <strong className="text-sm font-mono text-amber-600 font-bold block mt-1">
                  {formatETB(deductions?.employeePension || summary?.totalPensionEmp || 0)}
                </strong>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border">
                <span className="text-[11px] text-muted-foreground block font-medium">Staff Loans &amp; Advances</span>
                <strong className="text-sm font-mono text-foreground font-bold block mt-1">
                  {formatETB(deductions?.staffLoans || 0)}
                </strong>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border">
                <span className="text-[11px] text-muted-foreground block font-medium">Cost Sharing (10%)</span>
                <strong className="text-sm font-mono text-foreground font-bold block mt-1">
                  {formatETB(deductions?.costSharing || 0)}
                </strong>
              </div>
            </div>

            {/* Department Cost Distribution */}
            {deptCosts.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Department Cost Allocation
                </h4>
                <div className="space-y-2">
                  {deptCosts.slice(0, 4).map((d: any, idx: number) => {
                    const pct = summary?.totalGross ? Math.round((Number(d.gross || 0) / summary.totalGross) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-foreground">{d.department || "General"}</span>
                          <span className="font-mono text-muted-foreground">
                            {formatETB(d.gross || 0)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Operation Shortcuts */}
        <Card className="border shadow-2xs">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" /> Module Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between h-11 text-xs font-medium hover:bg-primary/5 hover:text-primary hover:border-primary/30"
              onClick={() => navigate("/payroll/processing")}
            >
              <span className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" /> Payroll Processing &amp; Register
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between h-11 text-xs font-medium hover:bg-primary/5 hover:text-primary hover:border-primary/30"
              onClick={() => navigate("/payroll/transactions")}
            >
              <span className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" /> Monthly Variable Inputs
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between h-11 text-xs font-medium hover:bg-primary/5 hover:text-primary hover:border-primary/30"
              onClick={() => navigate("/payroll/employees")}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Staff Profiles &amp; Bank Accounts
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between h-11 text-xs font-medium hover:bg-primary/5 hover:text-primary hover:border-primary/30"
              onClick={() => navigate("/payroll/setup")}
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Parameters &amp; Tax Configuration
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Historical Payroll Runs Table */}
      {history.length > 0 && (
        <Card className="border shadow-2xs">
          <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Recent Fiscal Payroll Executions
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/payroll/processing")}
              className="text-xs text-primary hover:text-primary"
            >
              View Full History <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Period Cycle</TableHead>
                  <TableHead>Branch / Cost Center</TableHead>
                  <TableHead className="text-center">Headcount</TableHead>
                  <TableHead className="text-right">Total Gross (ETB)</TableHead>
                  <TableHead className="text-right">Net Payable (ETB)</TableHead>
                  <TableHead className="text-center">Lifecycle Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell className="font-semibold text-sm">{h.periodName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{h.branchName || "All Branches"}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{h.totalEmployees}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-medium">{formatETB(h.totalGross)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-emerald-600">
                      {formatETB(h.totalNetPayETB)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs font-mono">
                        {h.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/payroll/processing")}
                        className="text-primary hover:text-primary hover:bg-primary/10 h-7 text-xs"
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
