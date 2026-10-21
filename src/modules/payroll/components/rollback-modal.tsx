import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRollbackPayrollMutation } from "../services/use-payroll-queries";
import { RotateCcw, AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runId: string | null;
  onSuccess?: () => void;
}

export const RollbackModal: React.FC<Props> = ({ open, onOpenChange, runId, onSuccess }) => {
  const [reason, setReason] = useState("");
  const rollbackMutation = useRollbackPayrollMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runId || !reason.trim()) return;

    await rollbackMutation.mutateAsync({ runId, reason: reason.trim() });
    onOpenChange(false);
    setReason("");
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-rose-600 flex items-center gap-2">
            <RotateCcw className="w-5 h-5" /> Admin Rollback to Draft
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-1 text-xs">
            <span className="block text-foreground">
              Rolling back will restore this finalized payroll run to <strong>DRAFT</strong> status so
              modifications or recalculations can occur.
            </span>
            <span className="block text-muted-foreground flex items-center gap-1.5 bg-rose-500/10 p-2 rounded-lg text-rose-700 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              An immutable audit snapshot with your reasoning will be logged in the system ledger.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="rollbackReason">Mandatory Audit Rollback Reason *</Label>
            <Textarea
              id="rollbackReason"
              placeholder="e.g. Retroactive employee promotion approved after finalization; recalculating net pay."
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={rollbackMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={rollbackMutation.isPending || !reason.trim()}
            >
              {rollbackMutation.isPending ? "Rolling back..." : "Confirm Rollback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
