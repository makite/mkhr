import React, { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/table-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type TransactionType } from "../services/payroll-service";
import { usePayrollTransactionTypes } from "../services/use-payroll-queries";
import { TransactionTypeDialog } from "../components/transaction-type-dialog";
import { formatETB } from "@/lib/utils";
import { Edit3, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const TransactionTypesTab: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType | null>(null);

  const { data: types = [], isLoading, refetch } = usePayrollTransactionTypes();

  const handleEdit = (type: TransactionType) => {
    setSelectedType(type);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedType(null);
    setDialogOpen(true);
  };

  const columns = useMemo<ColumnDef<TransactionType>[]>(
    () => [
      {
        accessorKey: "prioritySeq",
        header: "Seq",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.prioritySeq}
          </span>
        ),
      },
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
          <span className="font-mono font-bold text-xs text-primary">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Transaction Rule Name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
            {row.original.shortName && (
              <span className="text-xs text-muted-foreground">{row.original.shortName}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "transType",
        header: "Category",
        cell: ({ row }) => {
          const isAddition = row.original.transType === "ADDITION";
          return (
            <Badge
              variant="outline"
              className={
                isAddition
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
              }
            >
              {isAddition ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {row.original.transType}
            </Badge>
          );
        },
      },
      {
        id: "flags",
        header: "Statutory Rule Flags",
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex flex-wrap gap-1 max-w-[280px]">
              {t.isTaxed && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/20">
                  Taxed
                </Badge>
              )}
              {t.applyPension && (
                <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-700 border-indigo-500/20">
                  Pension
                </Badge>
              )}
              {t.deductAbsence && (
                <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-700 border-rose-500/20">
                  Absence Deduct
                </Badge>
              )}
              {t.deductCostSharing && (
                <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 border-blue-500/20">
                  Cost Sharing
                </Badge>
              )}
              {t.allowBackPayment && (
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                  BackPay
                </Badge>
              )}
              {t.clearOnMonthEnd && (
                <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">
                  Month-End Reset
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "defaultValue",
        header: () => <div className="text-right">Default Value</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-foreground font-medium">
            {row.original.defaultValue ? formatETB(row.original.defaultValue) : "Formula"}
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
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                : "bg-muted text-muted-foreground"
            }
          >
            {row.original.isActive ? "Active" : "Disabled"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row.original)}
              className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <DataTable
        title="Compensation Transaction Types & Rules"
        description="Statutory calculation sequence, deduction matrices, taxability flags, and GL mapping codes."
        columns={columns}
        data={types}
        loading={isLoading}
        searchPlaceholder="Search rules by code or transaction name..."
        onAdd={handleAdd}
        onRefresh={() => refetch()}
        pageSize={12}
      />

      <TransactionTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transactionType={selectedType}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
