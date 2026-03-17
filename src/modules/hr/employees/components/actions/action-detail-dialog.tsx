/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { actionTypeLabel } from "./action-types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: any | null;
  currency?: string | null;
  lookupData: any;
  terminationReasons: Array<{ id: string; value: string }>;
};

const nameById = (list: any[] | undefined, id?: string | null, key = "name") =>
  (list || []).find((x: any) => String(x.id) === String(id || ""))?.[key] ||
  null;

const terminationReasonById = (
  reasons: Array<{ id: string; value: string }>,
  id?: string | null,
) => reasons.find((r) => String(r.id) === String(id || ""))?.value || null;

export function ActionDetailDialog({
  open,
  onOpenChange,
  action,
  currency,
  lookupData,
  terminationReasons,
}: Props) {
  const a: any = action;
  const p: any = a?.payload || {};

  const Row = ({ label, value }: { label: string; value: any }) => (
    <div className="flex items-start justify-between gap-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-right break-words">
        {value ?? "-"}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {actionTypeLabel(String(a?.type || ""))} details
          </DialogTitle>
          <DialogDescription>
            Status: {String(a?.status || "-")} • Effective:{" "}
            {a?.effectiveDate ? format(new Date(a.effectiveDate), "PPP") : "-"}
          </DialogDescription>
        </DialogHeader>

        {!a ? null : a.type === "PROMOTION" ? (
          <div className="space-y-3">
            <Row
              label="Reason"
              value={
                p.promotionReason
                  ? String(p.promotionReason).replace(/_/g, " ")
                  : "-"
              }
            />
            <Row
              label="Job position"
              value={nameById(lookupData.positions as any, p.toPositionId)}
            />
            <Row
              label="Department"
              value={nameById(lookupData.departments as any, p.toDepartmentId)}
            />
            <Row
              label="Branch"
              value={nameById(lookupData.branches as any, p.toBranchId)}
            />
            <Row
              label="Duty station"
              value={
                p.toDutyStationId
                  ? nameById(lookupData.branches as any, p.toDutyStationId)
                  : "-"
              }
            />
            <Row
              label="Grade"
              value={nameById(lookupData.grades as any, p.toGradeId)}
            />
            <Row
              label="Scale"
              value={nameById(lookupData.scales as any, p.toScaleId)}
            />
            <Row
              label="Basic salary"
              value={
                typeof p.newBasicSalary === "number"
                  ? `${currency || "ETB"} ${Number(p.newBasicSalary).toLocaleString()}`
                  : "-"
              }
            />
            <Row label="Note" value={p.note || "-"} />
          </div>
        ) : a.type === "SALARY_INCREMENT" ? (
          <div className="space-y-3">
            <Row
              label="Mode"
              value={
                p.incrementMode
                  ? String(p.incrementMode).replace(/_/g, " ")
                  : "-"
              }
            />
            <Row
              label="Old salary"
              value={
                typeof p.oldBasicSalary === "number"
                  ? `${currency || "ETB"} ${Number(p.oldBasicSalary).toLocaleString()}`
                  : "-"
              }
            />
            <Row
              label="Incremented amount"
              value={
                typeof p.incrementedAmount === "number"
                  ? `${currency || "ETB"} ${Number(p.incrementedAmount).toLocaleString()}`
                  : "-"
              }
            />
            <Row
              label="New salary"
              value={
                typeof p.newBasicSalary === "number"
                  ? `${currency || "ETB"} ${Number(p.newBasicSalary).toLocaleString()}`
                  : "-"
              }
            />
            <Row
              label="Scale"
              value={
                p.toScaleId
                  ? nameById(lookupData.scales as any, p.toScaleId)
                  : "-"
              }
            />
            <Row label="Reason" value={p.reason || "-"} />
          </div>
        ) : a.type === "TERMINATION" ? (
          <div className="space-y-3">
            <Row
              label="Application date"
              value={
                p.applicationDate
                  ? format(new Date(p.applicationDate), "PPP")
                  : "-"
              }
            />
            <Row
              label="Resignation date"
              value={
                p.resignationDate
                  ? format(new Date(p.resignationDate), "PPP")
                  : "-"
              }
            />
            <Row
              label="Reason"
              value={
                terminationReasonById(terminationReasons, p.reasonId) ||
                (p.reasonId ? `ReasonId: ${p.reasonId}` : "-")
              }
            />
            <Row
              label="Notice days"
              value={typeof p.noticeDays === "number" ? p.noticeDays : 60}
            />
            <Row label="Remark" value={p.remark || "-"} />
          </div>
        ) : a.type === "REINSTATE" ? (
          <div className="space-y-3">
            <Row
              label="Last termination"
              value={(() => {
                const lt = p.lastTermination;
                const ltDate = lt?.effectiveDate
                  ? format(new Date(lt.effectiveDate), "PPP")
                  : null;
                const ltReason =
                  lt?.payload?.reasonId &&
                  terminationReasonById(
                    terminationReasons,
                    lt.payload.reasonId,
                  );
                return ltDate
                  ? `${ltDate}${ltReason ? ` • ${ltReason}` : ""}`
                  : "-";
              })()}
            />
            <Row
              label="Reinstate date"
              value={
                p.reinstateDate
                  ? format(new Date(p.reinstateDate), "PPP")
                  : a.effectiveDate
                    ? format(new Date(a.effectiveDate), "PPP")
                    : "-"
              }
            />
            <Row label="Remark" value={p.remark || "-"} />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No detail view available for this action type.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
