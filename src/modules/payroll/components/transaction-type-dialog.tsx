import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type TransactionType, payrollService } from "../services/payroll-service";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionType?: TransactionType | null;
  onSuccess: () => void;
}

export const TransactionTypeDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  transactionType,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Partial<TransactionType>>({
    code: "",
    name: "",
    shortName: "",
    description: "",
    transType: "ADDITION",
    prioritySeq: 10,
    isTaxed: true,
    applyPension: false,
    deductAbsence: false,
    deductPenalty: false,
    deductCostSharing: false,
    clearOnMonthEnd: false,
    hasException: false,
    excludeFromSeverance: false,
    allowNegative: false,
    allowBackPayment: false,
    isVariable: false,
    directPayToBank: false,
    accountCode: "",
    subAccountCode: "",
    costCenterCode: "",
    debitCredit: "DEBIT",
    defaultValue: 0,
    isActive: true,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (transactionType) {
      setFormData(transactionType);
    } else {
      setFormData({
        code: "",
        name: "",
        shortName: "",
        description: "",
        transType: "ADDITION",
        prioritySeq: 10,
        isTaxed: true,
        applyPension: false,
        deductAbsence: false,
        deductPenalty: false,
        deductCostSharing: false,
        clearOnMonthEnd: false,
        hasException: false,
        excludeFromSeverance: false,
        allowNegative: false,
        allowBackPayment: false,
        isVariable: false,
        directPayToBank: false,
        accountCode: "",
        subAccountCode: "",
        costCenterCode: "",
        debitCredit: "DEBIT",
        defaultValue: 0,
        isActive: true,
      });
    }
  }, [transactionType, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error("Transaction Code and Name are required.");
      return;
    }
    setSaving(true);
    try {
      await payrollService.saveTransactionType(formData);
      toast.success(transactionType ? "Transaction Type updated." : "Transaction Type created.");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save transaction type.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            ⚙️ {transactionType ? "Edit Transaction Setting / Type" : "New Transaction Setting / Type"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Panel: Basic Information */}
          <div className="p-4 border rounded-lg bg-gray-50/50 space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Basic Definition & Classification
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="code">Transaction Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g. 101"
                  value={formData.code || ""}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  disabled={!!transactionType}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="name">Transaction Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Transport Allowance"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="shortName">Short Name</Label>
                <Input
                  id="shortName"
                  placeholder="e.g. TRANS_ALLOW"
                  value={formData.shortName || ""}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="transType">Transaction Type</Label>
                <Select
                  value={formData.transType}
                  onValueChange={(val: any) => setFormData({ ...formData, transType: val })}
                >
                  <SelectTrigger id="transType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADDITION">Addition (Earning)</SelectItem>
                    <SelectItem value="DEDUCTION">Deduction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prioritySeq">Calculation Sequence / Priority</Label>
                <Input
                  id="prioritySeq"
                  type="number"
                  value={formData.prioritySeq || 10}
                  onChange={(e) => setFormData({ ...formData, prioritySeq: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="defaultValue">Default Value</Label>
                <Input
                  id="defaultValue"
                  type="number"
                  step="0.01"
                  value={formData.defaultValue || 0}
                  onChange={(e) => setFormData({ ...formData, defaultValue: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                />
                <Label htmlFor="isActive" className="font-medium cursor-pointer">
                  Active in Payroll
                </Label>
              </div>
            </div>
          </div>

          {/* Middle Panel: The 12 Enterprise Rule Flags (matching ASP.NET Screenshot) */}
          <div className="p-4 border rounded-lg bg-blue-50/20 space-y-4">
            <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wider flex items-center justify-between">
              <span>Rule Calculation Flags & Statutory Behaviors</span>
              <span className="text-xs font-normal text-blue-600">(12 Rule Parameters)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isTaxed"
                  checked={formData.isTaxed}
                  onCheckedChange={(checked) => setFormData({ ...formData, isTaxed: !!checked })}
                />
                <Label htmlFor="isTaxed" className="cursor-pointer text-sm font-medium">
                  Is Taxed (Proc 979/2016)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="applyPension"
                  checked={formData.applyPension}
                  onCheckedChange={(checked) => setFormData({ ...formData, applyPension: !!checked })}
                />
                <Label htmlFor="applyPension" className="cursor-pointer text-sm font-medium">
                  Apply Pension (7% / 11%)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deductAbsence"
                  checked={formData.deductAbsence}
                  onCheckedChange={(checked) => setFormData({ ...formData, deductAbsence: !!checked })}
                />
                <Label htmlFor="deductAbsence" className="cursor-pointer text-sm font-medium">
                  Deduct Absence / LWOP
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deductPenalty"
                  checked={formData.deductPenalty}
                  onCheckedChange={(checked) => setFormData({ ...formData, deductPenalty: !!checked })}
                />
                <Label htmlFor="deductPenalty" className="cursor-pointer text-sm font-medium">
                  Deduct Penalty
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deductCostSharing"
                  checked={formData.deductCostSharing}
                  onCheckedChange={(checked) => setFormData({ ...formData, deductCostSharing: !!checked })}
                />
                <Label htmlFor="deductCostSharing" className="cursor-pointer text-sm font-medium">
                  Deduct Cost Sharing
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clearOnMonthEnd"
                  checked={formData.clearOnMonthEnd}
                  onCheckedChange={(checked) => setFormData({ ...formData, clearOnMonthEnd: !!checked })}
                />
                <Label htmlFor="clearOnMonthEnd" className="cursor-pointer text-sm font-medium">
                  Clear on Month End (One-off)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasException"
                  checked={formData.hasException}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasException: !!checked })}
                />
                <Label htmlFor="hasException" className="cursor-pointer text-sm font-medium">
                  Has Exception Rule
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="excludeFromSeverance"
                  checked={formData.excludeFromSeverance}
                  onCheckedChange={(checked) => setFormData({ ...formData, excludeFromSeverance: !!checked })}
                />
                <Label htmlFor="excludeFromSeverance" className="cursor-pointer text-sm font-medium">
                  Exclude From Severance
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowNegative"
                  checked={formData.allowNegative}
                  onCheckedChange={(checked) => setFormData({ ...formData, allowNegative: !!checked })}
                />
                <Label htmlFor="allowNegative" className="cursor-pointer text-sm font-medium">
                  Allow Negative Values
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowBackPayment"
                  checked={formData.allowBackPayment}
                  onCheckedChange={(checked) => setFormData({ ...formData, allowBackPayment: !!checked })}
                />
                <Label htmlFor="allowBackPayment" className="cursor-pointer text-sm font-medium">
                  Allow Back Payment
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isVariable"
                  checked={formData.isVariable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVariable: !!checked })}
                />
                <Label htmlFor="isVariable" className="cursor-pointer text-sm font-medium">
                  Is Variable (Monthly Entry)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="directPayToBank"
                  checked={formData.directPayToBank}
                  onCheckedChange={(checked) => setFormData({ ...formData, directPayToBank: !!checked })}
                />
                <Label htmlFor="directPayToBank" className="cursor-pointer text-sm font-medium">
                  Direct Pay to Bank
                </Label>
              </div>
            </div>
          </div>

          {/* Bottom Panel: GL & Cost Distribution Mapping */}
          <div className="p-4 border rounded-lg bg-gray-50/50 space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              General Ledger & Accounting Mappings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="debitCredit">Debit / Credit</Label>
                <Select
                  value={formData.debitCredit}
                  onValueChange={(val: any) => setFormData({ ...formData, debitCredit: val })}
                >
                  <SelectTrigger id="debitCredit">
                    <SelectValue placeholder="Select D/C" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBIT">DEBIT (Expense)</SelectItem>
                    <SelectItem value="CREDIT">CREDIT (Liability / Pay)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="accountCode">GL Account Code</Label>
                <Input
                  id="accountCode"
                  placeholder="e.g. 5010-003"
                  value={formData.accountCode || ""}
                  onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="subAccountCode">Sub-Account Code</Label>
                <Input
                  id="subAccountCode"
                  placeholder="e.g. 010"
                  value={formData.subAccountCode || ""}
                  onChange={(e) => setFormData({ ...formData, subAccountCode: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="costCenterCode">Cost Center Code</Label>
                <Input
                  id="costCenterCode"
                  placeholder="e.g. CC-BOLE-01"
                  value={formData.costCenterCode || ""}
                  onChange={(e) => setFormData({ ...formData, costCenterCode: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : transactionType ? "Update Transaction Type" : "Create Transaction Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
