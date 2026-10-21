import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PayrollPeriod, payrollService } from "../services/payroll-service";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periods: PayrollPeriod[];
  employees: Array<{ id: string; fullName: string; basicSalary: number }>;
  onSuccess: () => void;
}

export const BackpayModal: React.FC<Props> = ({ open, onOpenChange, periods, employees, onSuccess }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [fromPeriodId, setFromPeriodId] = useState("");
  const [toPeriodId, setToPeriodId] = useState("");
  const [newBasicSalary, setNewBasicSalary] = useState<number>(0);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !fromPeriodId || !toPeriodId || !newBasicSalary) {
      toast.error("Please fill in all fields.");
      return;
    }
    setCalculating(true);
    try {
      const res = await payrollService.calculateBackpay({
        employeeId,
        fromPeriodId,
        toPeriodId,
        newBasicSalary,
      });
      setResult(res);
      toast.success("Backpay calculated and scheduled for current payroll run.");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to calculate backpay.");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            💰 Generate Retroactive Backpay
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Calculate statutory salary differentials and taxes across retroactive periods.
          </p>
        </DialogHeader>

        <form onSubmit={handleCalculate} className="space-y-4 py-2">
          <div>
            <Label htmlFor="employee">Select Employee *</Label>
            <Select value={employeeId} onValueChange={(val) => {
              setEmployeeId(val);
              const emp = employees.find(e => e.id === val);
              if (emp) setNewBasicSalary(emp.basicSalary);
            }}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="Choose employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.fullName} (Current: ETB {emp.basicSalary?.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fromPeriod">From Period *</Label>
              <Select value={fromPeriodId} onValueChange={setFromPeriodId}>
                <SelectTrigger id="fromPeriod">
                  <SelectValue placeholder="Start period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="toPeriod">To Period *</Label>
              <Select value={toPeriodId} onValueChange={setToPeriodId}>
                <SelectTrigger id="toPeriod">
                  <SelectValue placeholder="End period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="newSalary">New Adjusted Basic Salary (ETB) *</Label>
            <Input
              id="newSalary"
              type="number"
              step="0.01"
              value={newBasicSalary || ""}
              onChange={(e) => setNewBasicSalary(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          {result && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm space-y-1">
              <div className="font-semibold text-emerald-900">Calculation Summary:</div>
              <div className="flex justify-between"><span>Months Elapsed:</span> <strong>{result.monthsCount}</strong></div>
              <div className="flex justify-between"><span>Gross Delta:</span> <strong>ETB {result.totalGrossDelta?.toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Income Tax Delta:</span> <strong>ETB {result.totalTaxDelta?.toFixed(2)}</strong></div>
              <div className="flex justify-between"><span>Employee Pension Delta (7%):</span> <strong>ETB {result.totalPensionEmpDelta?.toFixed(2)}</strong></div>
              <div className="flex justify-between text-base border-t pt-1 font-bold text-emerald-800">
                <span>Net Backpay Payable:</span>
                <span>ETB {result.totalNetDelta?.toFixed(2)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={calculating}>
              {calculating ? "Calculating..." : "Calculate & Apply Backpay"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
