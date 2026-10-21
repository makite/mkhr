
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucherData: {
    voucherNo: string;
    periodName: string;
    branchName: string;
    currency: string;
    isBalanced: boolean;
    totalDebits: number;
    totalCredits: number;
    lines: Array<{
      accountCode: string;
      accountName: string;
      debit: number;
      credit: number;
    }>;
  } | null;
}

export const GlVoucherModal: React.FC<Props> = ({ open, onOpenChange, voucherData }) => {
  if (!voucherData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              📑 General Ledger Journal Voucher: {voucherData.voucherNo}
            </DialogTitle>
            <Badge variant={voucherData.isBalanced ? "default" : "destructive"}>
              {voucherData.isBalanced ? "✅ Balanced Double-Entry" : "⚠️ Unbalanced"}
            </Badge>
          </div>
          <div className="text-sm text-gray-500 flex gap-4 pt-2">
            <span><strong>Period:</strong> {voucherData.periodName}</span>
            <span><strong>Branch:</strong> {voucherData.branchName}</span>
            <span><strong>Currency:</strong> {voucherData.currency}</span>
          </div>
        </DialogHeader>

        <div className="border rounded-lg overflow-hidden mt-4">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-32">Account Code</TableHead>
                <TableHead>Account Description</TableHead>
                <TableHead className="text-right w-32">Debit (ETB)</TableHead>
                <TableHead className="text-right w-32">Credit (ETB)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voucherData.lines.map((line, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-xs">{line.accountCode}</TableCell>
                  <TableCell className="font-medium">{line.accountName}</TableCell>
                  <TableCell className="text-right font-mono">
                    {line.debit > 0 ? line.debit.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {line.credit > 0 ? line.credit.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "-"}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-100 font-bold border-t-2">
                <TableCell colSpan={2} className="text-right">Total (ETB)</TableCell>
                <TableCell className="text-right font-mono text-blue-700">
                  {voucherData.totalDebits.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-mono text-green-700">
                  {voucherData.totalCredits.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Voucher
          </Button>
          <Button onClick={() => window.print()} variant="secondary">
            🖨️ Print Voucher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
