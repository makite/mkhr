/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  FileText,
  Table2,
  Printer,
  RefreshCw,
  Users,
  UserX,
  TrendingUp,
  Briefcase,
  GraduationCap,
  FileDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/table-data";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const REPORT_TYPES = [
  { value: "all", label: "All Employees", icon: Users },
  { value: "terminated", label: "Terminated", icon: UserX },
  { value: "promoted", label: "Promoted", icon: TrendingUp },
  { value: "experience", label: "Experience (Internal & External)", icon: Briefcase },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "employment-letter", label: "Employment Letter", icon: FileText },
] as const;

type ReportType = (typeof REPORT_TYPES)[number]["value"];

/** Safe display value: never render an object as React child */
function safeStr(v: any): string {
  if (v == null) return "-";
  if (typeof v === "object") return String((v as any).name ?? (v as any).code ?? (v as any).value ?? "-");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

function formatDateSafe(value: unknown, fmt: string): string {
  if (value == null || value === "") return "-";
  const d = value instanceof Date ? value : new Date(value as string | number);
  if (Number.isNaN(d.getTime())) return "-";
  try {
    return format(d, fmt);
  } catch {
    return "-";
  }
}

interface EmployeeRow {
  id: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  requestStatus?: string;
  empStatus?: string;
  createdAt?: string;
  positionRef?: { name?: string } | null;
  grade?: { name?: string } | null;
  branch?: { name?: string } | null;
  department?: { name?: string } | null;
}

interface ExperienceRow {
  id: string;
  employeeId: string;
  employeeName: string;
  department?: string | null;
  position?: string | null;
  company: string;
  experiencePosition: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  description?: string | null;
  achievements?: string | null;
}

interface EducationRow {
  id: string;
  employeeId: string;
  employeeName: string;
  department?: string | null;
  position?: string | null;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  grade?: string | null;
}

type ReportRow = EmployeeRow | ExperienceRow | EducationRow;

const LETTER_TYPES: ReportType[] = ["experience", "employment-letter", "promoted"];

export default function HRReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<ReportType>("all");
  const [viewMode, setViewMode] = useState<"table" | "print">("table");
  const [data, setData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [letterEmployeeIndex, setLetterEmployeeIndex] = useState(0);

  const fetchReport = async (page = 1) => {
    setLoading(true);
    try {
      const limit = 1000;
      const res: any = await api.get(
        `/employees/reports?type=${reportType}&page=${page}&limit=${limit}`,
      );
      const list = res?.data ?? [];
      setData(Array.isArray(list) ? list : []);
      setPagination((prev) => ({
        ...prev,
        page,
        limit,
        total: res?.pagination?.total ?? list?.length ?? 0,
        pages: res?.pagination?.pages ?? 1,
      }));
      setLetterEmployeeIndex(0);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message ?? "Failed to load report",
        variant: "destructive",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(1);
  }, [reportType]);

  const columns = useMemo((): ColumnDef<ReportRow>[] => {
    if (reportType === "experience") {
      return [
        { id: "employeeName", header: "Employee", accessorFn: (r: any) => safeStr(r.employeeName), cell: ({ row }: any) => safeStr((row.original as any).employeeName) },
        { id: "employeeId", header: "ID", accessorFn: (r: any) => safeStr(r.employeeId), cell: ({ row }: any) => safeStr((row.original as any).employeeId) },
        { id: "department", header: "Department", accessorFn: (r: any) => safeStr(r.department), cell: ({ row }: any) => safeStr((row.original as any).department) },
        { id: "company", header: "Company", accessorFn: (r: any) => safeStr(r.company), cell: ({ row }: any) => safeStr((row.original as any).company) },
        { id: "experiencePosition", header: "Position", accessorFn: (r: any) => safeStr(r.experiencePosition), cell: ({ row }: any) => safeStr((row.original as any).experiencePosition) },
        { id: "startDate", header: "Start", accessorFn: (r: any) => r.startDate, cell: ({ row }: any) => formatDateSafe((row.original as any).startDate, "PP") },
        { id: "endDate", header: "End", accessorFn: (r: any) => (r as any).current ? "Current" : (r as any).endDate, cell: ({ row }: any) => (row.original as any).current ? "Current" : formatDateSafe((row.original as any).endDate, "PP") },
      ];
    }
    if (reportType === "education") {
      return [
        { id: "employeeName", header: "Employee", accessorFn: (r: any) => safeStr(r.employeeName), cell: ({ row }: any) => safeStr((row.original as any).employeeName) },
        { id: "employeeId", header: "ID", accessorFn: (r: any) => safeStr(r.employeeId), cell: ({ row }: any) => safeStr((row.original as any).employeeId) },
        { id: "institution", header: "Institution", accessorFn: (r: any) => safeStr(r.institution), cell: ({ row }: any) => safeStr((row.original as any).institution) },
        { id: "degree", header: "Degree", accessorFn: (r: any) => safeStr(r.degree), cell: ({ row }: any) => safeStr((row.original as any).degree) },
        { id: "field", header: "Field", accessorFn: (r: any) => safeStr(r.field), cell: ({ row }: any) => safeStr((row.original as any).field) },
        { id: "startDate", header: "Start", accessorFn: (r: any) => r.startDate, cell: ({ row }: any) => formatDateSafe((row.original as any).startDate, "PP") },
        { id: "endDate", header: "End", accessorFn: (r: any) => (r as any).current ? "Current" : (r as any).endDate, cell: ({ row }: any) => (row.original as any).current ? "Current" : formatDateSafe((row.original as any).endDate, "PP") },
      ];
    }
    return [
      { id: "name", header: "Employee", accessorFn: (r: any) => safeStr(`${(r as any).firstName ?? ""} ${(r as any).lastName ?? ""}`.trim()), cell: ({ row }: any) => safeStr(`${(row.original as any).firstName ?? ""} ${(row.original as any).lastName ?? ""}`.trim()) },
      { id: "employeeId", header: "Employee ID", accessorFn: (r: any) => safeStr((r as any).employeeId), cell: ({ row }: any) => safeStr((row.original as any).employeeId) },
      { id: "position", header: "Position", accessorFn: (r: any) => safeStr((r as any).positionRef), cell: ({ row }: any) => safeStr((row.original as any).positionRef) },
      { id: "branch", header: "Branch", accessorFn: (r: any) => safeStr((r as any).branch), cell: ({ row }: any) => safeStr((row.original as any).branch) },
      { id: "status", header: "Status", accessorFn: (r: any) => safeStr((r as any).requestStatus), cell: ({ row }: any) => safeStr((row.original as any).requestStatus) },
      { id: "employment", header: "Employment", accessorFn: (r: any) => (r as any).empStatus, cell: ({ row }: any) => (row.original as any).empStatus === "TERMINATED" ? "Terminated" : "Active" },
      { id: "createdAt", header: "Created", accessorFn: (r: any) => (r as any).createdAt, cell: ({ row }: any) => formatDateSafe((row.original as any).createdAt, "PP") },
    ];
  }, [reportType]);

  const reportTitle = REPORT_TYPES.find((r) => r.value === reportType)?.label ?? "Report";
  const showPrintAsLetter = LETTER_TYPES.includes(reportType);

  const letterItems: ReportRow[] = reportType === "experience"
    ? (() => {
        const seen = new Set<string>();
        return data.filter((r: any) => {
          const key = `${r.employeeId}-${r.employeeName}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      })()
    : data;

  const handlePrint = () => {
    setViewMode("print");
    setTimeout(() => window.print(), 100);
  };

  const exportToExcel = () => {
    const headers = columns.map((c) => String(c.header));
    const rows = data.map((row: any) =>
      columns.map((col) => {
        const val = col.accessorFn ? (col as any).accessorFn(row) : row[String(col.id)];
        if (val instanceof Date) return format(val, "yyyy-MM-dd");
        return safeStr(val);
      }),
    );
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hr-report-${reportType}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Report exported as CSV (opens in Excel)." });
  };

  const currentLetterItem = letterItems[Math.min(letterEmployeeIndex, letterItems.length - 1)];
  const renderLetter = () => {
    const date = format(new Date(), "PPPP");
    if (reportType === "experience" && currentLetterItem) {
      const ex = currentLetterItem as ExperienceRow;
      const experiences = reportType === "experience" ? data.filter((r: any) => r.employeeId === ex.employeeId && r.employeeName === ex.employeeName) as ExperienceRow[] : [];
      return (
        <div className="space-y-4 text-sm print:text-black">
          <p className="text-right">{date}</p>
          <h2 className="text-lg font-semibold">To Whom It May Concern</h2>
          <p className="leading-relaxed">
            This is to certify that <strong>{safeStr(ex.employeeName)}</strong> (ID: {safeStr(ex.employeeId)}) has worked with our organization / has the following work experience:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            {experiences.slice(0, 20).map((exp, i) => (
              <li key={i}>
                <strong>{safeStr(exp.company)}</strong> – {safeStr(exp.experiencePosition)} ({formatDateSafe(exp.startDate, "MMM yyyy")} – {exp.current ? "Present" : formatDateSafe(exp.endDate, "MMM yyyy")})
              </li>
            ))}
          </ul>
          <p className="leading-relaxed">This certificate is issued for official use.</p>
          <div className="mt-12 pt-8 border-t border-dashed grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs uppercase mb-1">Prepared by</p>
              <div className="h-14 border-b border-black/30" />
              <p className="text-xs mt-1">Name &amp; Signature</p>
            </div>
            <div>
              <p className="text-xs uppercase mb-1">Authorized / Stamp</p>
              <div className="h-14 border border-black/30 rounded flex items-center justify-center text-xs">Stamp</div>
            </div>
          </div>
        </div>
      );
    }
    if (reportType === "employment-letter" && currentLetterItem) {
      const emp = currentLetterItem as EmployeeRow;
      const name = safeStr(`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim());
      const position = safeStr(emp.positionRef);
      const branch = safeStr(emp.branch);
      return (
        <div className="space-y-4 text-sm print:text-black">
          <p className="text-right">{date}</p>
          <h2 className="text-lg font-semibold">EMPLOYMENT CONFIRMATION LETTER</h2>
          <p className="leading-relaxed">
            This is to confirm that <strong>{name}</strong> (Employee ID: {safeStr(emp.employeeId)}) is employed with our organization in the capacity of <strong>{position || "N/A"}</strong>.
          </p>
          {branch && <p className="leading-relaxed">Branch / Department: {branch}</p>}
          <p className="leading-relaxed">This letter is issued for official purposes.</p>
          <div className="mt-12 pt-8 border-t border-dashed grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs uppercase mb-1">Prepared by</p>
              <div className="h-14 border-b border-black/30" />
              <p className="text-xs mt-1">Name &amp; Signature</p>
            </div>
            <div>
              <p className="text-xs uppercase mb-1">Authorized / Stamp</p>
              <div className="h-14 border border-black/30 rounded flex items-center justify-center text-xs">Stamp</div>
            </div>
          </div>
        </div>
      );
    }
    if (reportType === "promoted" && currentLetterItem) {
      const emp = currentLetterItem as EmployeeRow;
      const name = safeStr(`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim());
      const position = safeStr(emp.positionRef);
      return (
        <div className="space-y-4 text-sm print:text-black">
          <p className="text-right">{date}</p>
          <h2 className="text-lg font-semibold">PROMOTION LETTER</h2>
          <p className="leading-relaxed">
            We are pleased to inform you that <strong>{name}</strong> (Employee ID: {safeStr(emp.employeeId)}) has been promoted to <strong>{position || "the new position"}</strong>.
          </p>
          <p className="leading-relaxed">This promotion is effective as per the approved records.</p>
          <div className="mt-12 pt-8 border-t border-dashed grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs uppercase mb-1">Prepared by</p>
              <div className="h-14 border-b border-black/30" />
              <p className="text-xs mt-1">Name &amp; Signature</p>
            </div>
            <div>
              <p className="text-xs uppercase mb-1">Authorized / Stamp</p>
              <div className="h-14 border border-black/30 rounded flex items-center justify-center text-xs">Stamp</div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Reports</h1>
          <p className="text-muted-foreground">Reports and letters: employees, terminated, promoted, experience, education, employment letter</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-lg">Report type</CardTitle>
            </div>
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map(({ value, label, icon: Icon }) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "print")}>
              <TabsList>
                <TabsTrigger value="table" className="gap-2">
                  <Table2 className="h-4 w-4" />
                  Table
                </TabsTrigger>
                {showPrintAsLetter && (
                  <TabsTrigger value="print" className="gap-2">
                    <Printer className="h-4 w-4" />
                    Letter
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
            <div className="flex gap-2 no-print">
              <Button variant="outline" size="sm" onClick={() => fetchReport(pagination.page)} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToExcel} disabled={loading || data.length === 0}>
                <FileDown className="h-4 w-4 mr-1" />
                Export to Excel
              </Button>
              {showPrintAsLetter && (
                <Button variant="outline" size="sm" onClick={handlePrint} disabled={data.length === 0}>
                  <Printer className="h-4 w-4 mr-1" />
                  Print letter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "table" && (
            <DataTable<ReportRow>
              data={data}
              columns={columns}
              loading={loading}
              showPagination={true}
              pageSize={20}
              pageSizeOptions={[10, 20, 50, 100]}
              onRefresh={() => fetchReport(pagination.page)}
              searchPlaceholder="Search..."
            />
          )}

          {viewMode === "print" && showPrintAsLetter && (
            <div className="print-view space-y-8">
              {letterItems.length > 0 && (
                <>
                  <div className="no-print flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Letter for:</span>
                    <Select value={String(letterEmployeeIndex)} onValueChange={(v) => setLetterEmployeeIndex(Number(v))}>
                      <SelectTrigger className="w-[280px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {letterItems.map((item: any, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {reportType === "experience" ? safeStr(item.employeeName) : safeStr(`${item.firstName ?? ""} ${item.lastName ?? ""}`.trim())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="max-w-[210mm] mx-auto print:max-w-none">
                    {renderLetter()}
                  </div>
                </>
              )}
              {letterItems.length === 0 && !loading && (
                <p className="text-muted-foreground">No data for this report. Load data in Table view first.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-view { padding: 0; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
