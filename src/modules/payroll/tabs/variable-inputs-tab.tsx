import React, { useState, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/table-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePayrollTransactions,
  usePayrollTransactionTypes,
  usePayrollEmployeeProfiles,
  useCurrentPayrollPeriod,
  useSaveTransactionMutation,
  useDeleteTransactionMutation,
} from "../services/use-payroll-queries";
import { formatETB } from "@/lib/utils";
import { Plus, Trash2, Receipt, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const VariableInputsTab: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Queries
  const { data: currentPeriod, isLoading: isPeriodLoading } = useCurrentPayrollPeriod();
  const { data: transactions = [], isLoading: isTransLoading, refetch } = usePayrollTransactions();
  const { data: transTypes = [] } = usePayrollTransactionTypes();
  const { data: employees = [] } = usePayrollEmployeeProfiles();

  // Mutations
  const saveMutation = useSaveTransactionMutation();
  const deleteMutation = useDeleteTransactionMutation();

  // Form State
  const [employeeId, setEmployeeId] = useState("");
  const [transactionTypeId, setTransactionTypeId] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [remarks, setRemarks] = useState("");

  const resetForm = () => {
    setEmployeeId("");
    setTransactionTypeId("");
    setAmount("");
    setQuantity("");
    setRemarks("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !transactionTypeId || (!amount && !quantity)) {
      return;
    }

    await saveMutation.mutateAsync({
      employeeId,
      periodId: currentPeriod?.id,
      transactionTypeId,
      amount: Number(amount) || 0,
      quantity: Number(quantity) || 0,
      remarks: remarks.trim(),
    });

    setDialogOpen(false);
    resetForm();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "employee",
        header: "Employee",
        cell: ({ row }) => {
          const emp = row.original.employee;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm">
                {emp?.fullName || row.original.fullName || "-"}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{emp?.employeeId || row.original.employeeId || "-"}</span>
                {emp?.fullNameAm && (
                  <span className="font-amharic text-[11px] text-muted-foreground/80">
                    ({emp.fullNameAm})
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "transactionType",
        header: "Transaction Rule",
        cell: ({ row }) => {
          const tType = row.original.transactionType;
          const isAddition = tType?.transType === "ADDITION";
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant={isAddition ? "default" : "secondary"}
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
                {tType?.code || "-"}
              </Badge>
              <span className="text-sm font-medium">{tType?.name || "-"}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "quantity",
        header: () => <div className="text-right">Qty / Hours</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-sm text-foreground">
            {row.original.quantity ? Number(row.original.quantity).toFixed(1) : "-"}
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount (ETB)</div>,
        cell: ({ row }) => {
          const amt = row.original.amount;
          const isAddition = row.original.transactionType?.transType === "ADDITION";
          return (
            <div
              className={`text-right font-mono font-bold text-sm ${
                isAddition ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {amt ? formatETB(amt) : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "remarks",
        header: "Notes & Remarks",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
            {row.original.remarks || "-"}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-rose-600 h-8 w-8"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {/* Active Period Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Variable Entries for Active Period:
              <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                {isPeriodLoading ? "Loading..." : currentPeriod?.name || "No Active Period"}
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Record monthly dynamic items: discretionary bonuses, overtime, LWOP / absence deductions, and allowances.
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Variable Entry
        </Button>
      </div>

      {/* TanStack Table Data Grid */}
      <DataTable
        columns={columns}
        data={transactions}
        loading={isTransLoading}
        searchPlaceholder="Search variable entries by employee name or code..."
        onRefresh={() => refetch()}
        pageSize={10}
      />

      {/* Add Variable Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" /> New Monthly Variable Entry
            </DialogTitle>
            <DialogDescription>
              Assign a monthly transaction to an employee for active period{" "}
              <strong>{currentPeriod?.name || "current cycle"}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="empSelect">Employee *</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger id="empSelect">
                  <SelectValue placeholder="Choose employee" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {employees.map((e) => (
                    <SelectItem key={e.employeeIdDb} value={e.employeeIdDb}>
                      {e.employeeId} — {e.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="typeSelect">Transaction Type *</Label>
              <Select value={transactionTypeId} onValueChange={setTransactionTypeId}>
                <SelectTrigger id="typeSelect">
                  <SelectValue placeholder="Choose transaction rule" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {transTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      [{t.code}] {t.name} ({t.transType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="amountInput">Amount (ETB)</Label>
                <Input
                  id="amountInput"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : parseFloat(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qtyInput">Qty / Hours</Label>
                <Input
                  id="qtyInput"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === "" ? "" : parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notesInput">Remarks / Justification</Label>
              <Input
                id="notesInput"
                placeholder="e.g. Approved weekend overtime 4 hrs"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending || (!amount && !quantity)}
              >
                {saveMutation.isPending ? "Recording..." : "Record Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="w-5 h-5" /> Delete Variable Entry
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this transaction entry? This action will permanently
              exclude it from the next payroll calculation cycle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Entry"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
