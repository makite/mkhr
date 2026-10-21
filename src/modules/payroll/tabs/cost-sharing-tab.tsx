import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, GraduationCap, DollarSign, Users, Plus } from "lucide-react";
import { payrollService } from "../services/payroll-service";
import { useCompanyBranding } from "@/services/company-branding";
import { toast } from "sonner";

export const CostSharingTab: React.FC = () => {
  const branding = useCompanyBranding();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Form State
  const [employeeId, setEmployeeId] = useState("");
  const [university, setUniversity] = useState("");
  const [totalCost, setTotalCost] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [costData, profs] = await Promise.all([
        payrollService.getCostSharing(),
        payrollService.getEmployeeProfiles(),
      ]);
      setItems(costData || []);
      setEmployees(profs || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load cost sharing records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !totalCost) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      await payrollService.saveCostSharing({
        employeeId,
        university: university.trim() || "Higher Education Institution",
        totalObligation: Number(totalCost),
        remainingBalance: Number(totalCost),
        deductionPercent: 0.10, // 10% statutory higher ed deduction
        status: "ACTIVE",
      });
      toast.success("Higher education cost sharing recorded successfully.");
      setDialogOpen(false);
      setTotalCost(0);
      setUniversity("");
      setEmployeeId("");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save cost sharing.");
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((cs) => {
      const name = (cs.employee?.fullName || "").toLowerCase();
      const empCode = (cs.employee?.employeeId || "").toLowerCase();
      const uni = (cs.university || cs.universityName || "").toLowerCase();
      return name.includes(q) || empCode.includes(q) || uni.includes(q);
    });
  }, [items, search]);

  const totalObligations = useMemo(() => {
    return items.reduce((sum, cs) => sum + Number(cs.totalObligation || cs.totalCommitment || 0), 0);
  }, [items]);

  const totalRemaining = useMemo(() => {
    return items.reduce((sum, cs) => sum + Number(cs.remainingBalance || 0), 0);
  }, [items]);

  const primaryColor = branding?.primaryColor || "#1e40af";

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Registered Beneficiaries</p>
              <h4 className="text-lg font-bold text-gray-900">{items.length} Employees</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Ministry Obligation</p>
              <h4 className="text-lg font-bold text-gray-900">ETB {totalObligations.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Outstanding Balance</p>
              <h4 className="text-lg font-bold text-gray-900">ETB {totalRemaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Higher Education Cost Sharing (Statutory 10%)
          </h3>
          <p className="text-sm text-gray-500">
            Automated statutory 10% basic salary deduction until government graduate obligation is cleared.
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          style={{ backgroundColor: primaryColor }}
          className="text-white hover:opacity-90 transition-opacity gap-1.5"
        >
          <Plus className="w-4 h-4" /> Register Cost Sharing
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by employee name, ID or institution..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>

      {/* Responsive Table */}
      <div className="border rounded-lg overflow-x-auto bg-white shadow-xs">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Higher Institution</TableHead>
              <TableHead className="text-right">Total Obligation (ETB)</TableHead>
              <TableHead className="text-right">Statutory Deduction</TableHead>
              <TableHead className="text-right">Remaining Balance (ETB)</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <span className="animate-spin">â ³</span> Loading cost sharing records...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <GraduationCap className="w-8 h-8 text-gray-300" />
                    <p className="font-medium text-gray-600">No cost sharing records found.</p>
                    <p className="text-xs text-gray-400">Click 'Register Cost Sharing' to record graduate obligations.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredItems.map((cs) => (
              <TableRow key={cs.id} className="hover:bg-gray-50/80 transition-colors">
                <TableCell className="font-medium">
                  <div>{cs.employee?.fullName || "Employee"}</div>
                  <span className="text-xs text-gray-400 font-mono">{cs.employee?.employeeId || cs.employeeId}</span>
                </TableCell>
                <TableCell>{cs.university || cs.universityName || "Higher Education Institution"}</TableCell>
                <TableCell className="text-right font-mono font-medium">
                  {Number(cs.totalObligation || cs.totalCommitment || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-mono font-bold" style={{ color: primaryColor }}>
                  {((cs.deductionPercent || (cs.deductionRate ? cs.deductionRate / 100 : 0.10)) * 100).toFixed(0)}% Basic
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-emerald-700">
                  {Number(cs.remainingBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={cs.status === "ACTIVE" ? "default" : "secondary"} className={cs.status === "ACTIVE" ? "bg-emerald-600" : ""}>
                    {cs.status || "ACTIVE"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Registration Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Register Cost Sharing Obligation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div>
              <Label htmlFor="emp">Select Employee *</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger id="emp"><SelectValue placeholder="Choose employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.employeeIdDb || e.id} value={e.employeeIdDb || e.id}>
                      {e.employeeId} - {e.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="uni">Higher Education Institution / University</Label>
              <Input id="uni" placeholder="e.g. Addis Ababa University" value={university} onChange={e => setUniversity(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="total">Total Ministry Obligation (ETB) *</Label>
              <Input id="total" type="number" step="0.01" value={totalCost || ""} onChange={e => setTotalCost(parseFloat(e.target.value) || 0)} required />
              <p className="text-xs text-gray-500 mt-1">Deducted at 10% of basic salary per month until completed.</p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} style={{ backgroundColor: primaryColor }} className="text-white">
                {saving ? "Saving..." : "Register"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
