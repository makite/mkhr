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
import { useCloseMonthEndMutation } from "../services/use-payroll-queries";
import { Lock, ShieldCheck, CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodId: string | null;
  periodName: string;
  onSuccess?: () => void;
}

export const MonthEndModal: React.FC<Props> = ({
  open,
  onOpenChange,
  periodId,
  periodName,
  onSuccess,
}) => {
  const closeMonthMutation = useCloseMonthEndMutation();

  const handleCloseMonthEnd = async () => {
    if (!periodId) return;
    await closeMonthMutation.mutateAsync(periodId);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" /> Close Month End: {periodName}
          </DialogTitle>
          <DialogDescription className="text-xs pt-1">
            Closing the month end performs statutory year-to-date finalization:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-xs text-muted-foreground p-3 rounded-xl bg-muted/40 border border-border">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Copies all finalized payslips into <code>payroll_slip_ytd</code> tables for tax authority audit reporting.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Locks <strong>{periodName}</strong> status permanently to <code>CLOSED</code>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Purges one-off monthly variables configured with <em>Clear on Month End</em>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Promotes the subsequent fiscal period to <strong>OPEN &amp; Active</strong> automatically.
              </span>
            </li>
          </ul>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={closeMonthMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCloseMonthEnd}
            disabled={closeMonthMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            {closeMonthMutation.isPending ? "Finalizing Month End..." : "Confirm Month-End Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
