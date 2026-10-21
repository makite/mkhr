import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { payrollService } from "../services/payroll-service";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runId: string | null;
  onSuccess: () => void;
}

export const RollbackModal: React.FC<Props> = ({ open, onOpenChange, runId, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runId) return;
    if (!reason.trim()) {
      toast.error("Audit reason is required to rollback finalized payroll.");
      return;
    }

    setSubmitting(true);
    try {
      await payrollService.rollbackToDraft(runId, reason);
      toast.success("Payroll run successfully rolled back to DRAFT. Audit snapshot logged in history.");
      onSuccess();
      onOpenChange(false);
      setReason("");
    } catch (err: any) {
      toast.error(err.message || "Failed to rollback payroll.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
            ↩️ Admin Rollback to Draft
          </DialogTitle>
          <p className="text-sm text-gray-500 pt-1">
            Rolling back will restore this finalized payroll run to <strong>DRAFT</strong> status so recalculations can occur.
            A complete pre-action copy will automatically be archived to the <code>_history</code> table.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="reason">Mandatory Audit Rollback Reason *</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Retroactive employee promotion approved after finalization."
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={submitting}>
              {submitting ? "Rolling back..." : "Confirm Rollback to Draft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
