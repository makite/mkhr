import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type PayrollPeriod } from "../services/payroll-service";
import { useCalculateBackpayMutation } from "../services/use-payroll-queries";
import { formatETB } from "@/lib/utils";
import { Coins, CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periods: PayrollPeriod[];
  employees: Array<{ id: string; fullName: string; basicSalary: number }>;
  onSuccess?: () => void;
}

export const BackpayModal: React.FC<Props> = ({
  open,
  onOpenChange,
  periods,
  employees,
  onSuccess,
}) => {
  const [employeeId, setEmployeeId] = useState("");
  const [fromPeriodId, setFromPeriodId] = useState("");
  const [toPeriodId, setToPeriodId] = useState("");
  const [newBasicSalary, setNewBasicSalary] = useState<number | "">("");
  const [result, setResult] = useState<any>(null);

  const backpayMutation = useCalculateBackpayMutation();

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !fromPeriodId || !toPeriodId || !newBasicSalary) return;

    const res = await backpayMutation.mutateAsync({
      employeeId,
      fromPeriodId,
      toPeriodId,
      newBasicSalary: Number(newBasicSalary),
    });

    setResult(res);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" /> Generate Retroactive Backpay
          </DialogTitle>
          <DialogDescription className="text-xs">
            Calculate salary differentials, statutory income tax recalculations, and pension
            adjustments across retroactive closed periods.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCalculate} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="backpayEmp">Select Employee *</Label>
            <Select
              value={employeeId}
              onValueChange={(val) => {
                setEmployeeId(val);
                const emp = employees.find((e) => e.id === val);
                if (emp) setNewBasicSalary(emp.basicSalary);
              }}
            >
              <SelectTrigger id="backpayEmp">
                <SelectValue placeholder="Choose employee" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.fullName} (Current: {formatETB(emp.basicSalary)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fromPeriodSelect">From Period *</Label>
              <Select value={fromPeriodId} onValueChange={setFromPeriodId}>
                <SelectTrigger id="fromPeriodSelect">
                  <SelectValue placeholder="Start period" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {periods.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="toPeriodSelect">To Period *</Label>
              <Select value={toPeriodId} onValueChange={setToPeriodId}>
                <SelectTrigger id="toPeriodSelect">
                  <SelectValue placeholder="End period" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {periods.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newSalaryInput">New Monthly Basic Salary (ETB) *</Label>
            <Input
              id="newSalaryInput"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newBasicSalary}
              onChange={(e) =>
                setNewBasicSalary(e.target.value === "" ? "" : parseFloat(e.target.value))
              }
              required
            />
          </div>

          {result && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2 text-xs">
              <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Backpay Calculation Summary
              </div>
              <div className="grid grid-cols-2 gap-2 text-foreground font-mono">
                <div>
                  <span className="text-muted-foreground text-[11px] block">Gross Differential</span>
                  <strong>{formatETB(result.totalGrossDiff || 0)}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px] block">Net Payable</span>
                  <strong className="text-emerald-600">{formatETB(result.totalNetDiff || 0)}</strong>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              type="submit"
              disabled={backpayMutation.isPending || !employeeId || !fromPeriodId || !toPeriodId || !newBasicSalary}
            >
              {backpayMutation.isPending ? "Calculating..." : "Compute Differential"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
