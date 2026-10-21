import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { payrollService } from "../services/payroll-service";
import { useCompanyBranding } from "@/services/company-branding";
import { useNavigate } from "react-router";
import { 
  Building2, 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp, 
   
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  Fuel
} from "lucide-react";
import { toast } from "sonner";

export default function PayrollDashboardPage() {
  const branding = useCompanyBranding();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await payrollService.getDashboardStats();
      setData(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to load payroll dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const primaryColor = branding?.primaryColor || "#1e40af";
  const secondaryColor = branding?.secondaryColor || "#0f172a";

  if (loading) {
    return (
      <div className="flex w-full min-h-[450px] items-center justify-center">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-sm font-medium text-gray-500">Loading payroll executive analytics...</p>
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
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 md:p-8 rounded-2xl text-white shadow-lg transition-all"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        }}
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {branding?.companyName || "Meku"} Payroll Executive Dashboard
            </h1>
            {curPeriod && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-2.5 py-1 text-xs">
                Active: {curPeriod.name}
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

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => navigate("/payroll/processing")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Run Calculation
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/payroll/transactions")}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Variable Entries
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/payroll/setup")}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Setup
          </Button>
        </div>
      </div>

      {/* 6 Key Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Active Period */}
        <Card className="border shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" style={{ color: primaryColor }} /> Active Period
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold text-gray-900 truncate">{curPeriod?.name || "None Set"}</div>
            <div className="text-[11px] text-gray-500 mt-1 font-mono">
              Working: {curPeriod?.workingDays || 26} days
            </div>
          </CardContent>
        </Card>

        {/* Total Gross Pay */}
        <Card className="border shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Gross Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold text-blue-700 font-mono">
              ETB {Number(summary?.totalGross || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 font-mono">
              Taxable: ETB {Number(summary?.totalTaxable || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>

        {/* Net Disbursement */}
        <Card className="border shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Net Payable
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold text-emerald-700 font-mono">
              ETB {Number(summary?.totalNetPayETB || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-600 font-mono mt-1 font-semibold">
              ≈ USD {Number(summary?.totalNetPayUSD || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        {/* Income Tax (Proc 979/2016) */}
        <Card className="border shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> ERCA Income Tax
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold text-amber-700 font-mono">
              ETB {Number(summary?.totalIncomeTax || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Proc 979/2016 Schedule 'A'
            </div>
          </CardContent>
        </Card>

        {/* Pension 18% */}
        <Card className="border shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Pension (18%)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold text-indigo-700 font-mono">
              ETB {Number((summary?.totalPensionEmp || 0) + (summary?.totalPensionOrg || 0)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-gray-500 mt-1 font-mono">
              Emp 7%: {Number(summary?.totalPensionEmp || 0).toFixed(0)} | Org 11%: {Number(summary?.totalPensionOrg || 0).toFixed(0)}
            </div>
          </CardContent>
        </Card>

        {/* Employees */}
        <Card className="border shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-600" /> Workforce
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-base font-bold text-purple-700">
              {empStats?.totalActive || 0} Active
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              {empStats?.acceptedForPayroll || 0} Eligible | {empStats?.skipped || 0} Skipped
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics: Deductions Composition & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deductions Breakdown */}
        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-3 border-b">
            <CardTitle className="text-base font-bold text-gray-900">
              Statutory &amp; Voluntary Deductions Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-gray-600">
                <span>Personal Income Tax (Proclamation 979/2016)</span>
                <span className="font-mono font-bold text-amber-700">ETB {Number(deductions?.incomeTax || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, ((deductions?.incomeTax || 0) / (summary?.totalDeductions || 1)) * 100)}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-gray-600">
                <span>Employee Pension Contribution (7%)</span>
                <span className="font-mono font-bold text-indigo-700">ETB {Number(deductions?.pensionEmp || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, ((deductions?.pensionEmp || 0) / (summary?.totalDeductions || 1)) * 100)}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-gray-600">
                <span>Staff Loans &amp; Advances Installments</span>
                <span className="font-mono font-bold text-rose-700">ETB {Number(deductions?.staffLoans || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, ((deductions?.staffLoans || 0) / (summary?.totalDeductions || 1)) * 100)}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-gray-600">
                <span>Higher Education Cost Sharing (Statutory 10%)</span>
                <span className="font-mono font-bold text-purple-700">ETB {Number(deductions?.costSharing || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(100, ((deductions?.costSharing || 0) / (summary?.totalDeductions || 1)) * 100)}%` }} />
              </div>
            </div>

            <div className="pt-2 border-t flex justify-between items-center text-sm font-bold text-gray-900">
              <span>Total Deductions</span>
              <span className="font-mono text-base text-rose-600">
                ETB {Number(summary?.totalDeductions || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Department Payroll Cost Center Allocation */}
        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-3 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-gray-900">
              Department Payroll Cost Allocation
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {deptCosts.length} Departments
            </Badge>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">Staff Count</TableHead>
                  <TableHead className="text-right">Gross Total (ETB)</TableHead>
                  <TableHead className="text-right">Net Total (ETB)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deptCosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500 text-xs">
                      No department payroll distribution recorded for current period.
                    </TableCell>
                  </TableRow>
                ) : (
                  deptCosts.map((d: any) => (
                    <TableRow key={d.departmentId} className="hover:bg-gray-50/60">
                      <TableCell className="font-semibold text-gray-900 text-xs">{d.name}</TableCell>
                      <TableCell className="text-center text-xs font-mono">{d.employeeCount}</TableCell>
                      <TableCell className="text-right text-xs font-mono font-medium text-gray-900">
                        {Number(d.totalGross || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-xs font-mono font-bold text-emerald-700">
                        {Number(d.totalNet || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Historical Runs Audit Table */}
      <Card className="border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-gray-900">Recent Payroll Runs &amp; Audit Trail</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Historical batch calculations and maker-checker audit status.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/payroll/processing")}
            className="text-xs gap-1 font-semibold"
            style={{ color: primaryColor }}
          >
            Processing Center <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Run Date</TableHead>
                <TableHead className="text-center">Employees</TableHead>
                <TableHead className="text-right">Gross Total (ETB)</TableHead>
                <TableHead className="text-right">Income Tax (ETB)</TableHead>
                <TableHead className="text-right">Net Payable (ETB)</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500 text-xs">
                    No completed payroll runs found. Click 'Run Calculation' to generate draft payroll.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((r: any) => (
                  <TableRow key={r.id} className="hover:bg-gray-50/60">
                    <TableCell className="font-semibold text-gray-900 text-xs">{r.periodName}</TableCell>
                    <TableCell className="text-xs text-gray-500">{new Date(r.runDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-center text-xs font-mono">{r.totalEmployees}</TableCell>
                    <TableCell className="text-right text-xs font-mono">
                      {Number(r.totalGross || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono text-amber-700">
                      {Number(r.totalIncomeTax || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono font-bold text-emerald-700">
                      {Number(r.totalNetPayETB || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={
                          r.status === "FINALIZED" ? "default" :
                          r.status === "APPROVED" ? "default" :
                          r.status === "SUBMITTED" ? "secondary" : "outline"
                        }
                        className={
                          r.status === "FINALIZED" ? "bg-emerald-600" :
                          r.status === "APPROVED" ? "bg-blue-600" : ""
                        }
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
