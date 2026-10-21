import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { payrollService } from "../services/payroll-service";
import { toast } from "sonner";

export const StaffLoansTab: React.FC = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  // Form State
  const [employeeId, setEmployeeId] = useState("");
  const [loanType, setLoanType] = useState("STAFF_ADVANCE");
  const [principalAmount, setPrincipalAmount] = useState<number>(0);
  const [monthlyDeduction, setMonthlyDeduction] = useState<number>(0);
  const [startDate, setStartDate] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [loanData, profs] = await Promise.all([
        payrollService.getStaffLoans(),
        payrollService.getEmployeeProfiles(),
      ]);
      setLoans(loanData || []);
      setEmployees(profs || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load staff loans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !principalAmount || !monthlyDeduction || !startDate) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      await payrollService.saveStaffLoan({
        employeeId,
        loanType,
        principalAmount,
        monthlyDeduction,
        startDate,
        remainingBalance: principalAmount,
        status: "ACTIVE",
      });
      toast.success("Staff loan recorded successfully.");
      setDialogOpen(false);
      setPrincipalAmount(0);
      setMonthlyDeduction(0);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save staff loan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Staff Loans & Salary Advances</h3>
          <p className="text-sm text-gray-500">Automated monthly installment deduction and balance tracking.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>➕ Grant Staff Loan</Button>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Loan Type</TableHead>
              <TableHead className="text-right">Principal (ETB)</TableHead>
              <TableHead className="text-right">Monthly Installment (ETB)</TableHead>
              <TableHead className="text-right">Remaining Balance (ETB)</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Loading staff loans...
                </TableCell>
              </TableRow>
            ) : loans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No staff loans found.
                </TableCell>
              </TableRow>
            ) : loans.map((ln) => (
              <TableRow key={ln.id}>
                <TableCell className="font-medium">
                  <div>{ln.employee?.fullName}</div>
                  <span className="text-xs text-gray-400 font-mono">{ln.employee?.employeeId}</span>
                </TableCell>
                <TableCell>{ln.loanType}</TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {ln.principalAmount?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-red-600">
                  {ln.monthlyDeduction?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-emerald-700">
                  {ln.remainingBalance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{new Date(ln.startDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={ln.status === "ACTIVE" ? "default" : "secondary"}>
                    {ln.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">New Staff Loan / Advance</DialogTitle>
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
              <Label htmlFor="ltype">Loan Type</Label>
              <Select value={loanType} onValueChange={setLoanType}>
                <SelectTrigger id="ltype"><SelectValue placeholder="Loan Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAFF_ADVANCE">Salary Advance</SelectItem>
                  <SelectItem value="PERSONAL_LOAN">Personal Staff Loan</SelectItem>
                  <SelectItem value="EMERGENCY_LOAN">Emergency Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="principal">Principal (ETB) *</Label>
                <Input id="principal" type="number" step="0.01" value={principalAmount || ""} onChange={e => setPrincipalAmount(parseFloat(e.target.value) || 0)} required />
              </div>
              <div>
                <Label htmlFor="inst">Monthly (ETB) *</Label>
                <Input id="inst" type="number" step="0.01" value={monthlyDeduction || ""} onChange={e => setMonthlyDeduction(parseFloat(e.target.value) || 0)} required />
              </div>
            </div>

            <div>
              <Label htmlFor="start">Start Date *</Label>
              <Input id="start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Grant Loan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
