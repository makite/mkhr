import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { payrollService } from "../services/payroll-service";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodId: string | null;
  periodName: string;
  onSuccess: () => void;
}

export const MonthEndModal: React.FC<Props> = ({ open, onOpenChange, periodId, periodName, onSuccess }) => {
  const [closing, setClosing] = useState(false);

  const handleCloseMonthEnd = async () => {
    if (!periodId) return;
    setClosing(true);
    try {
      const res = await payrollService.closeMonthEnd(periodId);
      toast.success(`Month-end closed successfully! YTD tables updated. Next period: ${res.nextActivePeriod}`);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to close month end.");
    } finally {
      setClosing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            🔒 Close Month End: {periodName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Closing the month end performs irreversible statutory year-to-date operations:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Copies all finalized slips and items into <code>payroll_slip_ytd</code> tables for tax audits.</li>
            <li>Locks <strong>{periodName}</strong> status permanently to <code>CLOSED</code>.</li>
            <li>Purges one-off transactions configured with <code>Clear on Month End</code>.</li>
            <li>Automatically promotes the subsequent period to <strong>OPEN & Active</strong>.</li>
          </ul>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={closing}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleCloseMonthEnd} disabled={closing} className="bg-emerald-600 hover:bg-emerald-700">
            {closing ? "Closing Month End..." : "Confirm Month-End Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
