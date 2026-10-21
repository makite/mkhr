import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { type EmployeePayrollProfile, type Bank, payrollService } from "../services/payroll-service";
import { useCompanyBranding } from "@/services/company-branding";
import { Search, UserCheck, UserX, Users, Edit3 } from "lucide-react";
import { toast } from "sonner";

export default function PayrollEmployeesPage() {
  const branding = useCompanyBranding();
  const primaryColor = branding?.primaryColor || "#1e40af";

  const [employees, setEmployees] = useState<EmployeePayrollProfile[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Bank Editor Modal State
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeePayrollProfile | null>(null);
  const [bankName, setBankName] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [savingBank, setSavingBank] = useState(false);

  // Skip Reason Modal State
  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [skipReason, setSkipReason] = useState("");
  const [toggling, setToggling] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profs, bankList] = await Promise.all([
        payrollService.getEmployeeProfiles(),
        payrollService.getBanks(),
      ]);
      setEmployees(profs || []);
      setBanks(bankList || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load employee profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openBankEditor = (emp: EmployeePayrollProfile) => {
    setSelectedEmp(emp);
    setBankName(emp.bankName || "");
    setBankAccountNo(emp.bankAccountNo || "");
    setBankBranch(emp.bankBranch || "");
    setPaymentMethod(emp.paymentMethod || "BANK_TRANSFER");
    setBankModalOpen(true);
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setSavingBank(true);
    try {
      await payrollService.updateBankDetails(selectedEmp.employeeIdDb, {
        bankName,
        accountNumber: bankAccountNo,
        bankBranchName: bankBranch,
        paymentMethod: paymentMethod as any,
      });
      toast.success(`Updated disbursement details for ${selectedEmp.fullName}`);
      setBankModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update bank details.");
    } finally {
      setSavingBank(false);
    }
  };

  const handleAccept = async (emp: EmployeePayrollProfile) => {
    try {
      await payrollService.acceptEmployee(emp.employeeIdDb);
      toast.success(`${emp.fullName} is now ACCEPTED for payroll calculation.`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept employee.");
    }
  };

  const handleSkipPrompt = (emp: EmployeePayrollProfile) => {
    setSelectedEmp(emp);
    setSkipReason("");
    setSkipModalOpen(true);
  };

  const handleConfirmSkip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setToggling(true);
    try {
      await payrollService.skipEmployee(selectedEmp.employeeIdDb, skipReason);
      toast.warning(`${selectedEmp.fullName} will be SKIPPED in next payroll run.`);
      setSkipModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to skip employee.");
    } finally {
      setToggling(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.fullName?.toLowerCase().includes(q) ||
        e.employeeId?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.bankName?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const acceptedCount = useMemo(() => employees.filter(e => e.eligibility === "ACCEPTED").length, [employees]);
  const skippedCount = useMemo(() => employees.filter(e => e.eligibility === "SKIPPED").length, [employees]);

  return (
    <div className="flex w-full min-w-sm flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
          Employee Payroll Profiles &amp; Bank Details
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {branding?.companyName || "Meku"} disbursement methods, assigned bank accounts, and monthly payroll eligibility (Accept / Skip).
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Active Workforce</p>
              <h4 className="text-lg font-bold text-gray-900">{employees.length} Staff</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Eligible for Payroll</p>
              <h4 className="text-lg font-bold text-emerald-700">{acceptedCount} Accepted</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Skipped From Run</p>
              <h4 className="text-lg font-bold text-amber-700">{skippedCount} Excluded</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by employee name, ID, branch or bank..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {/* Employee Profiles Table */}
      <div className="border rounded-lg overflow-x-auto bg-white shadow-xs">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department / Branch</TableHead>
              <TableHead className="text-right">Basic Salary (ETB)</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Bank &amp; Account</TableHead>
              <TableHead className="text-center">Payroll Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <span className="animate-spin">â ³</span> Loading employee payroll profiles...
                  </div>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No employee profiles matched the search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((emp) => (
                <TableRow key={emp.employeeIdDb} className="hover:bg-gray-50/60">
                  <TableCell className="font-medium">
                    <div className="font-semibold text-gray-900">{emp.fullName}</div>
                    <span className="text-xs text-gray-400 font-mono">{emp.employeeId}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-900">{emp.department || "General"}</div>
                    <span className="text-[11px] text-gray-500">{emp.payrollBranch || "Head Office"}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-gray-900">
                    {Number(emp.basicSalary || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {emp.paymentMethod?.replace("_", " ") || "BANK TRANSFER"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {emp.paymentMethod === "CASH" ? (
                      <span className="text-xs text-gray-500 italic">Disbursed in Cash</span>
                    ) : (
                      <div>
                        <div className="text-xs font-semibold text-gray-900">{emp.bankName || "Commercial Bank of Ethiopia"}</div>
                        <span className="text-xs text-gray-500 font-mono">{emp.bankAccountNo || "No Account Assigned"}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={emp.eligibility === "ACCEPTED" ? "default" : "destructive"}
                      className={emp.eligibility === "ACCEPTED" ? "bg-emerald-600" : "bg-amber-600"}
                    >
                      {emp.eligibility}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openBankEditor(emp)}
                        className="text-xs gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-gray-500" /> Bank
                      </Button>
                      {emp.eligibility === "ACCEPTED" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSkipPrompt(emp)}
                          className="text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                        >
                          Skip
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAccept(emp)}
                          className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                        >
                          Accept
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bank Account Modal */}
      <Dialog open={bankModalOpen} onOpenChange={setBankModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Disbursement Details: {selectedEmp?.fullName}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveBank} className="space-y-4 py-2">
            <div>
              <Label htmlFor="pm">Disbursement Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="pm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer (Direct Deposit)</SelectItem>
                  <SelectItem value="CASH">Cash Payment</SelectItem>
                  <SelectItem value="CHEQUE">Company Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "BANK_TRANSFER" && (
              <>
                <div>
                  <Label htmlFor="bank">Commercial Bank</Label>
                  <Select value={bankName} onValueChange={setBankName}>
                    <SelectTrigger id="bank"><SelectValue placeholder="Select Bank" /></SelectTrigger>
                    <SelectContent>
                      {banks.map((b) => (
                        <SelectItem key={b.id} value={b.name}>
                          {b.name} ({b.code})
                        </SelectItem>
                      ))}
                      <SelectItem value="Commercial Bank of Ethiopia">Commercial Bank of Ethiopia</SelectItem>
                      <SelectItem value="Awash International Bank">Awash International Bank</SelectItem>
                      <SelectItem value="Dashen Bank">Dashen Bank</SelectItem>
                      <SelectItem value="Bank of Abyssinia">Bank of Abyssinia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="acc">Bank Account Number *</Label>
                  <Input
                    id="acc"
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    placeholder="e.g. 1000123456789"
                    className="font-mono mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="branch">Bank Branch Location</Label>
                  <Input
                    id="branch"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    placeholder="e.g. Bole Medhanialem Branch"
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setBankModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={savingBank} style={{ backgroundColor: primaryColor }} className="text-white">
                {savingBank ? "Saving..." : "Save Details"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Skip Employee Modal */}
      <Dialog open={skipModalOpen} onOpenChange={setSkipModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-amber-700">
              Skip from Current Payroll Run
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleConfirmSkip} className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Are you sure you want to exclude <strong>{selectedEmp?.fullName}</strong> from the upcoming calculation?
            </p>

            <div>
              <Label htmlFor="reason">Exclusion Justification / Remarks *</Label>
              <Textarea
                id="reason"
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                placeholder="e.g. Leave without pay, pending disciplinary clearance, final settlement on hold..."
                required
                className="mt-1"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setSkipModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={toggling} variant="destructive">
                {toggling ? "Excluding..." : "Confirm Skip"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
