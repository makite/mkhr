/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { FileDown, RefreshCw, Settings2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

type ActivityRow = {
  id: string;
  user?: { id?: string; name?: string; email?: string } | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  description?: string | null;
  timestamp: string;
  metadata?: { ipAddress?: string | null; userAgent?: string | null } | null;
};

const STORAGE_KEY = "mkhr-sysadmin-activities-report-v1";

const ALL_COLS = [
  "timestamp",
  "user",
  "email",
  "action",
  "entity",
  "entityId",
  "description",
  "ipAddress",
  "userAgent",
] as const;

const DEFAULT_VISIBLE = [
  "timestamp",
  "user",
  "action",
  "description",
  "entity",
  "entityId",
] as const;

const LABELS: Record<string, string> = {
  timestamp: "Time",
  user: "User",
  email: "Email",
  action: "Action",
  entity: "Entity",
  entityId: "Entity ID",
  description: "Description",
  ipAddress: "IP",
  userAgent: "User agent",
};

function readStored(): { order: string[]; visible: Record<string, boolean> } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("no");
    const p = JSON.parse(raw) as any;
    const order = Array.isArray(p.order) ? p.order : [];
    const visible = typeof p.visible === "object" && p.visible ? p.visible : {};
    return { order, visible };
  } catch {
    const visible: Record<string, boolean> = {};
    for (const id of ALL_COLS) visible[id] = DEFAULT_VISIBLE.includes(id as any);
    return { order: [...ALL_COLS], visible };
  }
}

function writeStored(s: { order: string[]; visible: Record<string, boolean> }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export default function SystemAdminActivitiesReportPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ActivityRow[]>([]);

  const stored = useMemo(() => readStored(), []);
  const [colOrder, setColOrder] = useState<string[]>(stored.order);
  const [colVisible, setColVisible] = useState<Record<string, boolean>>(
    stored.visible,
  );
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    writeStored({ order: colOrder, visible: colVisible });
  }, [colOrder, colVisible]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const limit = 5000;
      const res = await api.get<any>(`/dashboard/recent-activities?limit=${limit}`);
      const list = (res as any)?.data ?? (res as any)?.items ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to load activities",
        variant: "destructive",
      });
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    const fromT = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toT = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;
    return rows.filter((r) => {
      const t = new Date(r.timestamp).getTime();
      if (fromT != null && !Number.isNaN(t) && t < fromT) return false;
      if (toT != null && !Number.isNaN(t) && t > toT) return false;
      if (!q) return true;
      const hay =
        `${r.action} ${r.entity || ""} ${r.entityId || ""} ${r.description || ""} ${r.user?.name || ""} ${r.user?.email || ""} ${r.metadata?.ipAddress || ""} ${r.metadata?.userAgent || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, dateFrom, dateTo, text]);

  const buildColumns = useMemo((): Record<string, ColumnDef<ActivityRow>> => {
    return {
      timestamp: {
        id: "timestamp",
        header: LABELS.timestamp,
        accessorFn: (r) => r.timestamp,
        cell: ({ row }) =>
          row.original.timestamp
            ? format(new Date(row.original.timestamp), "PPpp")
            : "-",
      },
      user: {
        id: "user",
        header: LABELS.user,
        accessorFn: (r) => r.user?.name || "-",
        cell: ({ row }) => row.original.user?.name || "System",
      },
      email: {
        id: "email",
        header: LABELS.email,
        accessorFn: (r) => r.user?.email || "-",
        cell: ({ row }) => row.original.user?.email || "-",
      },
      action: {
        id: "action",
        header: LABELS.action,
        accessorFn: (r) => r.action,
        cell: ({ row }) => row.original.action || "-",
      },
      entity: {
        id: "entity",
        header: LABELS.entity,
        accessorFn: (r) => r.entity || "-",
        cell: ({ row }) => row.original.entity || "-",
      },
      entityId: {
        id: "entityId",
        header: LABELS.entityId,
        accessorFn: (r) => r.entityId || "-",
        cell: ({ row }) => row.original.entityId || "-",
      },
      description: {
        id: "description",
        header: LABELS.description,
        accessorFn: (r) => r.description || "-",
        cell: ({ row }) => row.original.description || "-",
      },
      ipAddress: {
        id: "ipAddress",
        header: LABELS.ipAddress,
        accessorFn: (r) => r.metadata?.ipAddress || "-",
        cell: ({ row }) => row.original.metadata?.ipAddress || "-",
      },
      userAgent: {
        id: "userAgent",
        header: LABELS.userAgent,
        accessorFn: (r) => r.metadata?.userAgent || "-",
        cell: ({ row }) => row.original.metadata?.userAgent || "-",
      },
    };
  }, []);

  const visibleCols = useMemo(() => {
    const order = colOrder.filter((id) => ALL_COLS.includes(id as any));
    const ids = order.filter((id) => colVisible[id] !== false);
    const cols = ids.map((id) => buildColumns[id]).filter(Boolean);
    return cols.length ? cols : [buildColumns.timestamp];
  }, [colOrder, colVisible, buildColumns]);

  const exportCsv = () => {
    const ids = colOrder.filter(
      (id) => ALL_COLS.includes(id as any) && colVisible[id] !== false,
    );
    const headers = ids.map((id) => LABELS[id] ?? id);
    const rowsOut = filtered.map((r) =>
      ids.map((id) => {
        switch (id) {
          case "timestamp":
            return r.timestamp ? format(new Date(r.timestamp), "yyyy-MM-dd HH:mm:ss") : "";
          case "user":
            return r.user?.name || "System";
          case "email":
            return r.user?.email || "";
          case "action":
            return r.action || "";
          case "entity":
            return r.entity || "";
          case "entityId":
            return r.entityId || "";
          case "description":
            return r.description || "";
          case "ipAddress":
            return r.metadata?.ipAddress || "";
          case "userAgent":
            return r.metadata?.userAgent || "";
          default:
            return "";
        }
      }),
    );

    const csv = [headers, ...rowsOut]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-admin-activities-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "CSV exported (opens in Excel)." });
  };

  const move = (id: string, dir: -1 | 1) => {
    setColOrder((prev) => {
      const i = prev.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const toggleVisible = (id: string, checked: boolean) => {
    setColVisible((prev) => {
      const next = { ...prev, [id]: checked };
      if (!Object.values(next).some(Boolean)) next.timestamp = true;
      return next;
    });
  };

  const resetLayout = () => {
    const visible: Record<string, boolean> = {};
    for (const id of ALL_COLS) visible[id] = DEFAULT_VISIBLE.includes(id as any);
    setColOrder([...ALL_COLS]);
    setColVisible(visible);
    toast({ title: "Reset", description: "Columns reset." });
  };

  return (
    <div className="container mx-auto py-6 space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg">System Admin Activities Report</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportCsv}
                disabled={loading || filtered.length === 0}
              >
                <FileDown className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Collapsible open={customizeOpen} onOpenChange={setCustomizeOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Customize
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3 rounded-md border p-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="act-from">From</Label>
                  <Input id="act-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="act-to">To</Label>
                  <Input id="act-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="act-text">Contains</Label>
                  <Input id="act-text" placeholder="user, action, entity, IP…" value={text} onChange={(e) => setText(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" onClick={resetLayout}>
                  Reset columns
                </Button>
                <div className="text-xs text-muted-foreground">
                  Showing {filtered.length} of {rows.length}
                </div>
              </div>
              <div className="space-y-2">
                {colOrder.map((id) => (
                  <div key={id} className="flex items-center gap-2 rounded border p-2">
                    <Checkbox
                      checked={colVisible[id] !== false}
                      onCheckedChange={(v) => toggleVisible(id, v === true)}
                    />
                    <div className="flex-1 text-sm">{LABELS[id] ?? id}</div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => move(id, -1)}>
                        ↑
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => move(id, 1)}>
                        ↓
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DataTable<ActivityRow>
            data={filtered}
            columns={visibleCols as ColumnDef<ActivityRow>[]}
            loading={loading}
            showPagination
            pageSize={20}
            pageSizeOptions={[10, 20, 50, 100]}
            searchPlaceholder="Search in loaded data…"
          />
        </CardContent>
      </Card>
    </div>
  );
}

