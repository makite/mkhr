/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
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
  Settings2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DataTable } from "@/components/shared/table-data";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

import type { ReportRow, EmployeeRow, ExperienceRow } from "./report-types";
import {
  type ReportType,
  buildColumnDef,
  mergeColumnLayout,
  REPORT_DEFAULT_COLUMN_IDS,
  COLUMN_LABELS,
  safeStr,
  formatDateSafe,
} from "./report-columns";

const REPORT_TYPES = [
  { value: "all" as const, label: "All Employees", icon: Users },
  { value: "terminated" as const, label: "Terminated", icon: UserX },
  { value: "promoted" as const, label: "Promoted", icon: TrendingUp },
  { value: "experience" as const, label: "Experience (Internal & External)", icon: Briefcase },
  { value: "education" as const, label: "Education", icon: GraduationCap },
  { value: "employment-letter" as const, label: "Employment Letter", icon: FileText },
] as const;

const LETTER_TYPES: ReportType[] = ["experience", "employment-letter", "promoted"];

const STORAGE_KEY = "mkhr-hr-report-custom-v1";

type StoredLayout = {
  order: string[];
  visible: Record<string, boolean>;
  dateFrom: string;
  dateTo: string;
  textFilter: string;
};

function readStored(rt: ReportType): StoredLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const { order, visible } = mergeColumnLayout(rt, null, null);
      return { order, visible, dateFrom: "", dateTo: "", textFilter: "" };
    }
    const all = JSON.parse(raw) as Record<string, Partial<StoredLayout>>;
    const p = all[rt] || {};
    const { order, visible } = mergeColumnLayout(rt, p.order, p.visible);
    return {
      order,
      visible,
      dateFrom: typeof p.dateFrom === "string" ? p.dateFrom : "",
      dateTo: typeof p.dateTo === "string" ? p.dateTo : "",
      textFilter: typeof p.textFilter === "string" ? p.textFilter : "",
    };
  } catch {
    const { order, visible } = mergeColumnLayout(rt, null, null);
    return { order, visible, dateFrom: "", dateTo: "", textFilter: "" };
  }
}

function persistLayout(rt: ReportType, s: StoredLayout) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, StoredLayout>) : {};
    all[rt] = s;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

function rowMatchesText(row: any, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const walk = (v: any): string => {
    if (v == null) return "";
    if (typeof v === "object" && !Array.isArray(v))
      return Object.values(v)
        .map(walk)
        .join(" ");
    if (Array.isArray(v)) return v.map(walk).join(" ");
    return String(v).toLowerCase();
  };
  return walk(row).includes(needle);
}

function rowInDateRange(
  row: any,
  reportType: ReportType,
  dateFrom: string,
  dateTo: string,
): boolean {
  if (!dateFrom && !dateTo) return true;
  let t: number | null = null;
  if (reportType === "experience" || reportType === "education") {
    if (row.startDate) {
      const d = new Date(row.startDate).getTime();
      t = Number.isNaN(d) ? null : d;
    }
  } else if (row.createdAt) {
    const d = new Date(row.createdAt).getTime();
    t = Number.isNaN(d) ? null : d;
  }
  if (t == null) return true;
  if (dateFrom) {
    const from = new Date(dateFrom);
    from.setHours(0, 0, 0, 0);
    if (t < from.getTime()) return false;
  }
  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    if (t > to.getTime()) return false;
  }
  return true;
}

export default function HRReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<ReportType>("all");
  const initial = readStored("all");
  const [columnOrder, setColumnOrder] = useState<string[]>(() => initial.order);
  const [columnVisible, setColumnVisible] = useState<Record<string, boolean>>(
    () => initial.visible,
  );
  const [dateFrom, setDateFrom] = useState(() => initial.dateFrom);
  const [dateTo, setDateTo] = useState(() => initial.dateTo);
  const [textFilter, setTextFilter] = useState(() => initial.textFilter);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const [viewMode, setViewMode] = useState<"table" | "print">("table");
  const [data, setData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [letterEmployeeIndex, setLetterEmployeeIndex] = useState(0);

  const handleReportTypeChange = (next: ReportType) => {
    persistLayout(reportType, {
      order: columnOrder,
      visible: columnVisible,
      dateFrom,
      dateTo,
      textFilter,
    });
    const L = readStored(next);
    setReportType(next);
    setColumnOrder(L.order);
    setColumnVisible(L.visible);
    setDateFrom(L.dateFrom);
    setDateTo(L.dateTo);
    setTextFilter(L.textFilter);
  };

  useEffect(() => {
    persistLayout(reportType, {
      order: columnOrder,
      visible: columnVisible,
      dateFrom,
      dateTo,
      textFilter,
    });
  }, [reportType, columnOrder, columnVisible, dateFrom, dateTo, textFilter]);

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

  const filteredData = useMemo(() => {
    return data.filter(
      (row) =>
        rowInDateRange(row as any, reportType, dateFrom, dateTo) &&
        rowMatchesText(row as any, textFilter),
    );
  }, [data, reportType, dateFrom, dateTo, textFilter]);

  const displayColumns = useMemo(() => {
    const ids = columnOrder.filter(
      (id) => columnVisible[id] !== false && REPORT_DEFAULT_COLUMN_IDS[reportType].includes(id),
    );
    const cols = ids
      .map((id) => buildColumnDef(reportType, id))
      .filter(Boolean) as any[];
    return cols.length ? cols : [buildColumnDef(reportType, REPORT_DEFAULT_COLUMN_IDS[reportType][0])!];
  }, [reportType, columnOrder, columnVisible]);

  const moveColumn = (id: string, dir: -1 | 1) => {
    setColumnOrder((prev) => {
      const i = prev.indexOf(id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const setVisible = (id: string, checked: boolean) => {
    setColumnVisible((prev) => {
      const next = { ...prev, [id]: checked };
      const defaults = REPORT_DEFAULT_COLUMN_IDS[reportType];
      if (!defaults.some((d) => next[d] !== false)) {
        next[defaults[0]] = true;
      }
      return next;
    });
  };

  const resetLayout = () => {
    const { order, visible } = mergeColumnLayout(reportType, null, null);
    setColumnOrder(order);
    setColumnVisible(visible);
    setDateFrom("");
    setDateTo("");
    setTextFilter("");
    toast({ title: "Layout reset", description: "Columns and filters reset for this report." });
  };

  const reportTitle = REPORT_TYPES.find((r) => r.value === reportType)?.label ?? "Report";
  const showPrintAsLetter = LETTER_TYPES.includes(reportType);
  const dateFilterLabel =
    reportType === "experience" || reportType === "education"
      ? "Filter by experience/education start date"
      : "Filter by record created date";

  const letterItems: ReportRow[] =
    reportType === "experience"
      ? (() => {
          const seen = new Set<string>();
          return filteredData.filter((r: any) => {
            const key = `${r.employeeId}-${r.employeeName}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        })()
      : filteredData;

  const handlePrint = () => {
    setViewMode("print");
    setTimeout(() => window.print(), 100);
  };

  const exportToExcel = () => {
    const headers = displayColumns.map((c) => String(c.header));
    const rows = filteredData.map((row: any) =>
      displayColumns.map((col: any) => {
        const val = col.accessorFn ? col.accessorFn(row) : row[String(col.id)];
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
    toast({
      title: "Exported",
      description: "CSV matches visible columns and current filters.",
    });
  };

  const currentLetterItem = letterItems[Math.min(letterEmployeeIndex, Math.max(0, letterItems.length - 1))];

  const renderLetter = () => {
    const date = format(new Date(), "PPPP");
    if (reportType === "experience" && currentLetterItem) {
      const ex = currentLetterItem as ExperienceRow;
      const experiences = filteredData.filter(
        (r: any) => r.employeeId === ex.employeeId && r.employeeName === ex.employeeName,
      ) as ExperienceRow[];
      return (
        <div className="space-y-4 text-sm print:text-black">
          <p className="text-right">{date}</p>
          <h2 className="text-lg font-semibold">To Whom It May Concern</h2>
          <p className="leading-relaxed">
            This is to certify that <strong>{safeStr(ex.employeeName)}</strong> (ID:{" "}
            {safeStr(ex.employeeId)}) has worked with our organization / has the following work
            experience:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            {experiences.slice(0, 20).map((exp, i) => (
              <li key={i}>
                <strong>{safeStr(exp.company)}</strong> – {safeStr(exp.experiencePosition)} (
                {formatDateSafe(exp.startDate, "MMM yyyy")} –{" "}
                {exp.current ? "Present" : formatDateSafe(exp.endDate, "MMM yyyy")})
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
              <div className="h-14 border border-black/30 rounded flex items-center justify-center text-xs">
                Stamp
              </div>
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
            This is to confirm that <strong>{name}</strong> (Employee ID: {safeStr(emp.employeeId)})
            is employed with our organization in the capacity of{" "}
            <strong>{position || "N/A"}</strong>.
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
              <div className="h-14 border border-black/30 rounded flex items-center justify-center text-xs">
                Stamp
              </div>
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
            We are pleased to inform you that <strong>{name}</strong> (Employee ID:{" "}
            {safeStr(emp.employeeId)}) has been promoted to{" "}
            <strong>{position || "the new position"}</strong>.
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
              <div className="h-14 border border-black/30 rounded flex items-center justify-center text-xs">
                Stamp
              </div>
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
          <p className="text-muted-foreground">
            Customize columns, order, and filters — saved in this browser. Export uses visible
            columns only.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-lg">{reportTitle}</CardTitle>
            </div>
            <Select
              value={reportType}
              onValueChange={(v) => handleReportTypeChange(v as ReportType)}
            >
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchReport(pagination.page)}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                disabled={loading || filteredData.length === 0}
              >
                <FileDown className="h-4 w-4 mr-1" />
                Export to Excel
              </Button>
              {showPrintAsLetter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  disabled={filteredData.length === 0}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print letter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {viewMode === "table" && (
            <Collapsible open={customizeOpen} onOpenChange={setCustomizeOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="secondary" size="sm" className="no-print gap-2">
                  <Settings2 className="h-4 w-4" />
                  Customize report
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="no-print mt-4 space-y-4 rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  Choose which columns appear, drag order with arrows, and set filters. Settings are
                  remembered per report type on this device.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="rep-date-from">{dateFilterLabel} — from</Label>
                    <Input
                      id="rep-date-from"
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rep-date-to">To</Label>
                    <Input
                      id="rep-date-to"
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="rep-text">Contains text (any field)</Label>
                    <Input
                      id="rep-text"
                      placeholder="e.g. branch name, employee id…"
                      value={textFilter}
                      onChange={(e) => setTextFilter(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">Columns</span>
                  <Button type="button" variant="ghost" size="sm" onClick={resetLayout}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset layout &amp; filters
                  </Button>
                </div>
                <ul className="space-y-2 max-h-[240px] overflow-y-auto border rounded-md p-2 bg-background">
                  {columnOrder.map((id) => {
                    if (!REPORT_DEFAULT_COLUMN_IDS[reportType].includes(id)) return null;
                    const label = COLUMN_LABELS[id] ?? id;
                    return (
                      <li
                        key={id}
                        className="flex items-center gap-2 flex-wrap py-1 border-b last:border-0"
                      >
                        <Checkbox
                          id={`col-${id}`}
                          checked={columnVisible[id] !== false}
                          onCheckedChange={(c) => setVisible(id, c === true)}
                        />
                        <Label htmlFor={`col-${id}`} className="flex-1 cursor-pointer font-normal">
                          {label}
                        </Label>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveColumn(id, -1)}
                            aria-label="Move up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveColumn(id, 1)}
                            aria-label="Move down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-xs text-muted-foreground">
                  Showing {filteredData.length} of {data.length} rows after filters.
                </p>
              </CollapsibleContent>
            </Collapsible>
          )}

          {viewMode === "table" && (
            <DataTable<ReportRow>
              data={filteredData}
              columns={displayColumns}
              loading={loading}
              showPagination={true}
              pageSize={20}
              pageSizeOptions={[10, 20, 50, 100]}
              onRefresh={() => fetchReport(pagination.page)}
              searchPlaceholder="Search in loaded data…"
            />
          )}

          {viewMode === "print" && showPrintAsLetter && (
            <div className="print-view space-y-8">
              {letterItems.length > 0 && (
                <>
                  <div className="no-print flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Letter for:</span>
                    <Select
                      value={String(letterEmployeeIndex)}
                      onValueChange={(v) => setLetterEmployeeIndex(Number(v))}
                    >
                      <SelectTrigger className="w-[280px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {letterItems.map((item: any, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {reportType === "experience"
                              ? safeStr(item.employeeName)
                              : safeStr(`${item.firstName ?? ""} ${item.lastName ?? ""}`.trim())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="max-w-[210mm] mx-auto print:max-w-none">{renderLetter()}</div>
                </>
              )}
              {letterItems.length === 0 && !loading && (
                <p className="text-muted-foreground">
                  No rows match your filters. Adjust filters in Customize report or refresh data.
                </p>
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
