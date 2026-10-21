import React, { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/table-data";
import { Badge } from "@/components/ui/badge";
import { type TaxBracket } from "../services/payroll-service";
import { usePayrollTaxBrackets } from "../services/use-payroll-queries";
import { formatETB } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export const TaxBracketsTab: React.FC = () => {
  const { data: brackets = [], isLoading, refetch } = usePayrollTaxBrackets();

  const columns = useMemo<ColumnDef<TaxBracket>[]>(
    () => [
      {
        accessorKey: "bracketNo",
        header: "Statutory Tier",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              Tier {row.original.bracketNo}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "minIncome",
        header: () => <div className="text-right">Monthly Income From (ETB)</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-foreground font-medium">
            {formatETB(row.original.minIncome)}
          </div>
        ),
      },
      {
        accessorKey: "maxIncome",
        header: () => <div className="text-right">Monthly Income To (ETB)</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-foreground font-medium">
            {row.original.maxIncome ? formatETB(row.original.maxIncome) : "Over 10,900.00 (Upper Bound)"}
          </div>
        ),
      },
      {
        accessorKey: "ratePercent",
        header: () => <div className="text-right">Marginal Tax Rate</div>,
        cell: ({ row }) => {
          const pct = Math.round(row.original.ratePercent * 100);
          return (
            <div className="text-right">
              <Badge
                variant="outline"
                className={`font-mono text-xs font-bold ${
                  pct === 0
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                    : "bg-primary/10 text-primary border-primary/20"
                }`}
              >
                {pct}%
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "deductible",
        header: () => <div className="text-right">Statutory Deductible Offset</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            {row.original.deductible ? formatETB(row.original.deductible) : "-"}
          </div>
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
            Federal Democratic Republic of Ethiopia — Employment Income Tax Proclamation No. 979/2016
          </strong>
          <p className="text-muted-foreground mt-0.5">
            Progressive marginal tax brackets apply automatically to all eligible employee remuneration.
            The statutory deductible offset guarantees accurate, formula-exact withholding during each monthly calculation.
          </p>
        </div>
      </div>

      <DataTable
        title="Employment Income Tax Schedule"
        description="Standard 7-tier statutory tax brackets enforced under Proclamation No. 979/2016."
        columns={columns}
        data={brackets}
        loading={isLoading}
        searchPlaceholder="Search tax tiers..."
        onRefresh={() => refetch()}
        showPagination={false}
      />
    </div>
  );
};
