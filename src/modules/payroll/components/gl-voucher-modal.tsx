import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatETB } from "@/lib/utils";
import { FileSpreadsheet, CheckCircle2, AlertTriangle, Printer } from "lucide-react";

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" /> General Ledger Journal Voucher:{" "}
              <span className="font-mono text-primary">{voucherData.voucherNo}</span>
            </DialogTitle>
            <Badge
              variant="outline"
              className={
                voucherData.isBalanced
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 flex items-center gap-1 w-fit"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20 flex items-center gap-1 w-fit"
              }
            >
              {voucherData.isBalanced ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Balanced Double-Entry
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" /> Unbalanced Voucher
                </>
              )}
            </Badge>
          </div>
          <DialogDescription className="flex flex-wrap gap-4 pt-1 text-xs">
            <span>
              <strong>Period:</strong> {voucherData.periodName}
            </span>
            <span>
              <strong>Branch:</strong> {voucherData.branchName}
            </span>
            <span>
              <strong>Base Currency:</strong> {voucherData.currency}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-xl overflow-hidden mt-2">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-32">Account Code</TableHead>
                <TableHead>Account Description</TableHead>
                <TableHead className="text-right w-36">Debit (ETB)</TableHead>
                <TableHead className="text-right w-36">Credit (ETB)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {voucherData.lines.map((line, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {line.accountCode}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{line.accountName}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {line.debit > 0 ? formatETB(line.debit) : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {line.credit > 0 ? formatETB(line.credit) : "-"}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30 font-bold border-t-2">
                <TableCell colSpan={2} className="text-right text-sm">
                  Total Voucher Amount
                </TableCell>
                <TableCell className="text-right font-mono text-primary text-sm">
                  {formatETB(voucherData.totalDebits)}
                </TableCell>
                <TableCell className="text-right font-mono text-emerald-600 text-sm">
                  {formatETB(voucherData.totalCredits)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => window.print()} variant="secondary" className="gap-1.5">
            <Printer className="w-4 h-4" /> Print Journal Voucher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
