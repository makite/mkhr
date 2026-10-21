import React, { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/table-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type PayrollPeriod } from "../services/payroll-service";
import {
  usePayrollPeriods,
  useUpdatePeriodRatesMutation,
} from "../services/use-payroll-queries";
import { formatDate } from "@/lib/utils";
import { Fuel, DollarSign, Calendar, Edit3, CheckCircle2 } from "lucide-react";

export const PeriodsTab: React.FC = () => {
  const [editingPeriod, setEditingPeriod] = useState<PayrollPeriod | null>(null);
  const [fuelRate, setFuelRate] = useState<number | "">("");
  const [exchangeRate, setExchangeRate] = useState<number | "">("");

  const { data: periods = [], isLoading, refetch } = usePayrollPeriods();
  const updateRatesMutation = useUpdatePeriodRatesMutation();

  const handleEditRates = (period: PayrollPeriod) => {
    setEditingPeriod(period);
    setFuelRate(period.fuelRate || "");
    setExchangeRate(period.exchangeRateUSD || "");
  };

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPeriod) return;

    await updateRatesMutation.mutateAsync({
      id: editingPeriod.id,
      data: {
        fuelRate: fuelRate === "" ? undefined : Number(fuelRate),
        exchangeRateUSD: exchangeRate === "" ? undefined : Number(exchangeRate),
      },
    });

    setEditingPeriod(null);
  };

  const currentPeriod = useMemo(() => periods.find((p) => p.isCurrent), [periods]);

  const columns = useMemo<ColumnDef<PayrollPeriod>[]>(
    () => [
      {
        accessorKey: "periodNumber",
        header: "No",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            #{row.original.periodNumber}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Period Cycle Name",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm">{p.name}</span>
              {p.isCurrent && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] px-1.5 py-0.5">
                  Current Active
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "dateRange",
        header: "Execution Window",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono">
            {formatDate(row.original.startDate)} — {formatDate(row.original.endDate)}
          </span>
        ),
      },
      {
        accessorKey: "workingDays",
        header: () => <div className="text-right">Working Days</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-foreground font-medium">
            {row.original.workingDays || 22} Days
          </div>
        ),
      },
      {
        accessorKey: "fuelRate",
        header: () => <div className="text-right">Fuel Rate (ETB/L)</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-amber-600 dark:text-amber-400 font-semibold">
            {row.original.fuelRate ? `ETB ${Number(row.original.fuelRate).toFixed(2)}/L` : "Not Set"}
          </div>
        ),
      },
      {
        accessorKey: "exchangeRateUSD",
        header: () => <div className="text-right">USD Exchange Rate</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            {row.original.exchangeRateUSD
              ? `1 USD = ${Number(row.original.exchangeRateUSD).toFixed(2)} ETB`
              : "Not Set"}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const st = row.original.status;
          let color = "bg-muted text-muted-foreground";
          if (st === "OPEN") {
            color = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
          } else if (st === "CLOSED") {
            color = "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20";
          } else if (st === "UPCOMING") {
            color = "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";
          }
          return (
            <Badge variant="outline" className={`font-mono text-xs ${color}`}>
              {st}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditRates(row.original)}
              className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10"
            >
              <Edit3 className="w-3.5 h-3.5" /> Set Rates
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Current Active Period Hero Card */}
      {currentPeriod && (
        <Card className="border border-primary/20 bg-primary/5 shadow-2xs">
          <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-600 text-white font-semibold flex items-center gap-1 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Current Period
                </Badge>
                <h3 className="text-base font-bold text-foreground">{currentPeriod.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Window: {formatDate(currentPeriod.startDate)} – {formatDate(currentPeriod.endDate)} •{" "}
                {currentPeriod.workingDays || 22} standard working days
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-card px-3.5 py-2 rounded-xl border border-border shadow-2xs flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Statutory Fuel Rate
                  </div>
                  <div className="text-sm font-bold text-foreground font-mono">
                    {currentPeriod.fuelRate
                      ? `ETB ${Number(currentPeriod.fuelRate).toFixed(2)}/L`
                      : "Not Configured"}
                  </div>
                </div>
              </div>

              <div className="bg-card px-3.5 py-2 rounded-xl border border-border shadow-2xs flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                    USD Spot Rate
                  </div>
                  <div className="text-sm font-bold text-foreground font-mono">
                    {currentPeriod.exchangeRateUSD
                      ? `1 USD = ${Number(currentPeriod.exchangeRateUSD).toFixed(2)} ETB`
                      : "Not Configured"}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditRates(currentPeriod)}
                className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
              >
                <Edit3 className="w-3.5 h-3.5" /> Adjust Rates
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TanStack Table Data Grid */}
      <DataTable
        title="Fiscal Payroll Periods & Conversion Parameters"
        description="Statutory working days, monthly transport fuel bench rates, and commercial USD disbursement conversions."
        columns={columns}
        data={periods}
        loading={isLoading}
        searchPlaceholder="Search periods by name or status..."
        onRefresh={() => refetch()}
        pageSize={12}
      />

      {/* Edit Rates Dialog */}
      <Dialog open={!!editingPeriod} onOpenChange={(open) => !open && setEditingPeriod(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Adjust Rates: {editingPeriod?.name}
            </DialogTitle>
            <DialogDescription>
              Configure the active fuel rate and USD exchange rate applied to transport allowances
              and foreign currency compensations for this period.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRates} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="fuelInput">Fuel Rate (ETB per Liter) *</Label>
              <Input
                id="fuelInput"
                type="number"
                step="0.01"
                placeholder="e.g. 102.50"
                value={fuelRate}
                onChange={(e) =>
                  setFuelRate(e.target.value === "" ? "" : parseFloat(e.target.value))
                }
                required
              />
              <span className="text-[11px] text-muted-foreground block">
                Applied to compute monthly transport allowances per executive vehicle policies.
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exchangeInput">USD Conversion Rate (ETB per 1 USD) *</Label>
              <Input
                id="exchangeInput"
                type="number"
                step="0.01"
                placeholder="e.g. 138.50"
                value={exchangeRate}
                onChange={(e) =>
                  setExchangeRate(e.target.value === "" ? "" : parseFloat(e.target.value))
                }
                required
              />
              <span className="text-[11px] text-muted-foreground block">
                Official NBE spot exchange rate for converting multi-currency remuneration.
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingPeriod(null)}
                disabled={updateRatesMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateRatesMutation.isPending}>
                {updateRatesMutation.isPending ? "Saving..." : "Save Period Parameters"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
