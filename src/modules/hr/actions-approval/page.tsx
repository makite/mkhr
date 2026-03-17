import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, XCircle } from "lucide-react";

import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type ActionType = "PROMOTION" | "SALARY_INCREMENT" | "TERMINATION" | "REINSTATE";
type ActionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

type QueueAction = {
  id: string;
  type: ActionType;
  status: ActionStatus;
  effectiveDate: string;
  requestedAt: string;
  payload: any;
  employee?: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    positionRef?: { name?: string | null } | null;
    department?: { name?: string | null } | null;
  } | null;
};

export default function HrActionsApprovalPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<QueueAction[]>([]);
  const [status, setStatus] = useState<ActionStatus | "ALL">("PENDING");
  const [type, setType] = useState<ActionType | "ALL">("ALL");

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== "ALL") params.set("status", status);
      if (type !== "ALL") params.set("type", type);
      const res: any = await api.get(`/hr-actions?${params.toString()}`);
      setActions(res?.data?.actions || res?.actions || []);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to load actions queue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type]);

  const visible = useMemo(() => actions, [actions]);

  const approve = async (actionId: string) => {
    if (!confirm("Approve this request?")) return;
    try {
      await api.put(`/hr-actions/${actionId}/approve`, {});
      toast({ title: "Success", description: "Request approved" });
      fetchQueue();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to approve",
        variant: "destructive",
      });
    }
  };

  const reject = async (actionId: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    try {
      await api.put(`/hr-actions/${actionId}/reject`, { reason });
      toast({ title: "Success", description: "Request rejected" });
      fetchQueue();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to reject",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Actions Approval</h1>
          <p className="text-muted-foreground">Approve or reject employee action requests</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="ALL">All</SelectItem>
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PROMOTION">Promotion</SelectItem>
              <SelectItem value="SALARY_INCREMENT">Salary Increment</SelectItem>
              <SelectItem value="TERMINATION">Termination</SelectItem>
              <SelectItem value="REINSTATE">Reinstate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : visible.length === 0 ? (
            <div className="text-sm text-muted-foreground">No requests.</div>
          ) : (
            <div className="space-y-3">
              {visible.map((a) => (
                <div key={a.id} className="rounded-lg border p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {a.type === "PROMOTION"
                          ? "Promotion"
                          : a.type === "SALARY_INCREMENT"
                            ? "Salary Increment"
                            : a.type === "TERMINATION"
                              ? "Termination"
                              : "Reinstate"}
                      </span>
                      <Badge variant={a.status === "PENDING" ? "outline" : a.status === "APPROVED" ? "default" : a.status === "REJECTED" ? "destructive" : "secondary"}>
                        {a.status}
                      </Badge>
                    </div>

                    {a.type === "PROMOTION" && a.payload?.promotionReason && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Reason: {String(a.payload.promotionReason).replace(/_/g, " ")}
                      </div>
                    )}
                    {a.type === "TERMINATION" && a.payload?.reasonId && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Termination reason id: {String(a.payload.reasonId)}
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground mt-1">
                      Employee:{" "}
                      <button
                        className="underline underline-offset-4"
                        onClick={() => a.employee?.id && navigate(`/hr/employees/${a.employee.id}`)}
                      >
                        {a.employee?.firstName} {a.employee?.lastName} ({a.employee?.employeeId})
                      </button>
                    </div>
                  </div>

                  {a.status === "PENDING" ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="default" onClick={() => approve(a.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button variant="destructive" onClick={() => reject(a.id)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground shrink-0">—</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

