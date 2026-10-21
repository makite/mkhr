import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { payrollService } from "../services/payroll-service";
import { toast } from "sonner";

export const VariableInputsTab: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transTypes, setTransTypes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<any>(null);

  // Form State
  const [employeeId, setEmployeeId] = useState("");
  const [transactionTypeId, setTransactionTypeId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trans, types, profs, period] = await Promise.all([
        payrollService.getTransactions(),
        payrollService.getTransactionTypes(),
        payrollService.getEmployeeProfiles(),
        payrollService.getCurrentPeriod(),
      ]);
      setItems(trans || []);
      setTransTypes(types || []);
      setEmployees(profs || []);
      setCurrentPeriod(period);
    } catch (err: any) {
      toast.error(err.message || "Failed to load variable transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !transactionTypeId || (!amount && !quantity)) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      await payrollService.saveTransaction({
        employeeId,
        periodId: currentPeriod?.id,
        transactionTypeId,
        amount,
        quantity,
        remarks,
      });
      toast.success("Variable entry recorded successfully.");
      setDialogOpen(false);
      setAmount(0);
      setQuantity(0);
      setRemarks("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save variable entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this variable transaction?")) return;
    try {
      await payrollService.deleteTransaction(id);
      toast.success("Transaction deleted.");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete transaction.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Variable Entries for Active Period: <span className="text-blue-600">{currentPeriod?.name || "Loading..."}</span>
          </h3>
          <p className="text-sm text-gray-500">
            Overtime hours, absent/LWOP days, incentive bonuses, and transport adjustments.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>➕ Add Variable Entry</Button>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Transaction Type</TableHead>
              <TableHead className="text-right">Quantity / Hours</TableHead>
              <TableHead className="text-right">Amount (ETB)</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Loading variable transactions...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No variable transactions recorded for this period.
                </TableCell>
              </TableRow>
            ) : items.map((it) => (
              <TableRow key={it.id}>
                <TableCell className="font-mono font-medium">{it.employee?.employeeId}</TableCell>
                <TableCell className="font-medium">{it.employee?.fullName}</TableCell>
                <TableCell>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded mr-1">
                    {it.transactionType?.code}
                  </span>
                  {it.transactionType?.name}
                </TableCell>
                <TableCell className="text-right font-mono">{it.quantity || "-"}</TableCell>
                <TableCell className="text-right font-mono font-bold text-blue-700">
                  {it.amount ? it.amount.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "-"}
                </TableCell>
                <TableCell className="text-xs text-gray-500">{it.remarks || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(it.id)} className="text-red-600 hover:text-red-700">
                    🗑️
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">New Variable Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div>
              <Label htmlFor="emp">Select Employee *</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger id="emp"><SelectValue placeholder="Choose employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.employeeIdDb} value={e.employeeIdDb}>
                      {e.employeeId} - {e.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Transaction Type *</Label>
              <Select value={transactionTypeId} onValueChange={setTransactionTypeId}>
                <SelectTrigger id="type"><SelectValue placeholder="Choose transaction type" /></SelectTrigger>
                <SelectContent>
                  {transTypes.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      [{t.code}] {t.name} ({t.transType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount (ETB)</Label>
                <Input id="amount" type="number" step="0.01" value={amount || ""} onChange={e => setAmount(parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label htmlFor="quantity">Qty / Hours</Label>
                <Input id="quantity" type="number" step="0.1" value={quantity || ""} onChange={e => setQuantity(parseFloat(e.target.value) || 0)} />
              </div>
            </div>

            <div>
              <Label htmlFor="remarks">Remarks / Reason</Label>
              <Input id="remarks" placeholder="Optional notes" value={remarks} onChange={e => setRemarks(e.target.value)} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Record Entry"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
