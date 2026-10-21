import React, { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/table-data";
import { Badge } from "@/components/ui/badge";
import { type OvertimeRate } from "../services/payroll-service";
import { usePayrollOvertimeRates } from "../services/use-payroll-queries";
import { Clock, ShieldCheck } from "lucide-react";

export const OvertimeTab: React.FC = () => {
  const { data: rates = [], isLoading, refetch } = usePayrollOvertimeRates();

  const columns = useMemo<ColumnDef<OvertimeRate>[]>(
    () => [
      {
        accessorKey: "code",
        header: "OT Code",
        cell: ({ row }) => (
          <span className="font-mono font-bold text-xs text-primary">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Overtime Category / Period Description",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "rateMultiplier",
        header: () => <div className="text-right">Multiplier Rate</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Badge
              variant="outline"
              className="font-mono text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
            >
              {row.original.rateMultiplier}x Hourly Base
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.isActive
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                : "bg-muted text-muted-foreground"
            }
          >
            {row.original.isActive ? "Active Policy" : "Inactive"}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Statutory Regulation Card */}
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs text-foreground">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-primary block text-sm">
            Statutory Regulation: Ethiopian Labour Proclamation No. 1156/2019
          </strong>
          <p className="text-muted-foreground mt-0.5">
            Overtime compensation formula: <code>(Basic Salary / 200 standard monthly hours) × Multiplier Rate × Overtime Hours</code>.
            Rate tiers apply strictly based on whether hours occurred during day (1.5x), night (1.75x), weekly rest day (2.0x), or public holidays (2.5x).
          </p>
        </div>
      </div>

      <DataTable
        title="Statutory Overtime Multiplier Matrices"
        description="Prescribed hourly multipliers under Article 68 of Ethiopian Labour Proclamation No. 1156/2019."
        columns={columns}
        data={rates}
        loading={isLoading}
        searchPlaceholder="Search overtime tiers..."
        onRefresh={() => refetch()}
        showPagination={false}
      />
    </div>
  );
};
