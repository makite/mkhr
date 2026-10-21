import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Bank, payrollService } from "../services/payroll-service";
import { toast } from "sonner";

export const BanksTab: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const data = await payrollService.getBanks();
      setBanks(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load banks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      toast.error("Code and Name are required.");
      return;
    }
    setSaving(true);
    try {
      await payrollService.saveBank({ code, name, swiftCode, isActive: true });
      toast.success("Bank added successfully.");
      setDialogOpen(false);
      setCode("");
      setName("");
      setSwiftCode("");
      fetchBanks();
    } catch (err: any) {
      toast.error(err.message || "Failed to save bank.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-700">Ethiopian Commercial Banks Registry</h3>
        <Button onClick={() => setDialogOpen(true)}>➕ Add Bank</Button>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-24">Bank Code</TableHead>
              <TableHead>Bank Name</TableHead>
              <TableHead>SWIFT / BIC Code</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Loading banks...
                </TableCell>
              </TableRow>
            ) : banks.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono font-bold text-blue-600">{b.code}</TableCell>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell className="font-mono text-xs">{b.swiftCode || "-"}</TableCell>
                <TableCell className="text-center">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${b.isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Ethiopian Bank</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div>
              <Label htmlFor="bankCode">Bank Code *</Label>
              <Input id="bankCode" placeholder="e.g. CBE" value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input id="bankName" placeholder="e.g. Commercial Bank of Ethiopia" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="swift">SWIFT Code</Label>
              <Input id="swift" placeholder="e.g. CBETETAA" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Bank"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
