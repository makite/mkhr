export type ActionType =
  | "PROMOTION"
  | "SALARY_INCREMENT"
  | "TERMINATION"
  | "REINSTATE";

export type ActionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type EmployeeAction = {
  id: string;
  employeeId: string;
  type: ActionType;
  status: ActionStatus;
  effectiveDate: string;
  requestedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  requestedBy?: string | null;
  payload: any;
};

export const actionTypeLabel = (t: string) =>
  t === "PROMOTION"
    ? "Promotion"
    : t === "SALARY_INCREMENT"
      ? "Salary Increment"
      : t === "TERMINATION"
        ? "Termination"
        : t === "REINSTATE"
          ? "Reinstate"
          : t || "Action";

