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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Bank } from "../services/payroll-service";
import { usePayrollBanks, useSaveBankMutation } from "../services/use-payroll-queries";
import { Landmark } from "lucide-react";

export const BanksTab: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [swiftCode, setSwiftCode] = useState("");

  const { data: banks = [], isLoading, refetch } = usePayrollBanks();
  const saveMutation = useSaveBankMutation();

  const resetForm = () => {
    setCode("");
    setName("");
    setSwiftCode("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    await saveMutation.mutateAsync({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      swiftCode: swiftCode.trim().toUpperCase() || undefined,
      isActive: true,
    });

    setDialogOpen(false);
    resetForm();
  };

  const columns = useMemo<ColumnDef<Bank>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Bank Code",
        cell: ({ row }) => (
          <span className="font-mono font-bold text-xs text-primary">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Financial Institution Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary shrink-0" />
            <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "swiftCode",
        header: "SWIFT / BIC Code",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.swiftCode || "—"}
          </span>
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
            {row.original.isActive ? "Active Disburser" : "Inactive"}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <DataTable
        title="Commercial Banks Directory"
        description="National Bank of Ethiopia licensed commercial banks for electronic payroll direct deposit files."
        columns={columns}
        data={banks}
        loading={isLoading}
        searchPlaceholder="Search banks by name or code..."
        onAdd={() => {
          resetForm();
          setDialogOpen(true);
        }}
        onRefresh={() => refetch()}
        pageSize={10}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" /> Register Commercial Bank
            </DialogTitle>
            <DialogDescription>
              Add a commercial bank or financial institution for employee account validation and
              direct batch deposit transfers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="bankCodeInput">Bank Code *</Label>
              <Input
                id="bankCodeInput"
                placeholder="e.g. CBE, AWASH, BOA, DAShen"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bankNameInput">Commercial Bank Name *</Label>
              <Input
                id="bankNameInput"
                placeholder="e.g. Commercial Bank of Ethiopia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="swiftInput">SWIFT / BIC Routing Code</Label>
              <Input
                id="swiftInput"
                placeholder="e.g. CBETETAA"
                value={swiftCode}
                onChange={(e) => setSwiftCode(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending || !code || !name}>
                {saveMutation.isPending ? "Registering..." : "Add Bank"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
