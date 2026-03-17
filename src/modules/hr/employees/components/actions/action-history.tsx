/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { actionTypeLabel } from "./action-types";

type Props = {
  employeeId: string;
  actions: any[];
  currentUserId: string;
  onOpenDetail: (action: any) => void;
  onEdit: (action: any) => void;
  onCancel: (action: any) => Promise<void>;
};

export function ActionHistory({
  actions,
  currentUserId,
  onOpenDetail,
  onEdit,
  onCancel,
}: Props) {
  return (
    <div className="w-full text-left">
      <p className="text-sm font-semibold mb-2">Action History</p>
      {actions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No requests yet.</p>
      ) : (
        <div className="space-y-2">
          {actions.slice(0, 10).map((a: any) => (
            <div
              key={a.id}
              className="rounded-md border p-2 text-sm flex items-center justify-between gap-2 cursor-pointer hover:bg-accent/30"
              role="button"
              tabIndex={0}
              onClick={() => onOpenDetail(a)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onOpenDetail(a);
              }}
            >
              <div className="flex flex-col">
                <span className="font-medium">
                  {actionTypeLabel(String(a.type || ""))}
                </span>
                <span className="text-xs text-muted-foreground">
                  Effective:{" "}
                  {a.effectiveDate
                    ? format(new Date(a.effectiveDate), "PPP")
                    : "-"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    a.status === "APPROVED"
                      ? "default"
                      : a.status === "REJECTED"
                        ? "destructive"
                        : a.status === "PENDING"
                          ? "outline"
                          : "secondary"
                  }
                >
                  {a.status}
                </Badge>

                {["PENDING", "REJECTED"].includes(String(a.status)) &&
                  String(a.requestedBy || "") === currentUserId && (
                    <>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(a);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        title="Cancel"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await onCancel(a);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
