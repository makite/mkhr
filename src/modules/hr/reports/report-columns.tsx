/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { ReportRow } from "./report-types";

export type ReportType =
  | "all"
  | "terminated"
  | "promoted"
  | "experience"
  | "education"
  | "employment-letter";

export function safeStr(v: any): string {
  if (v == null) return "-";
  if (typeof v === "object")
    return String((v as any).name ?? (v as any).code ?? (v as any).value ?? "-");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

export function formatDateSafe(value: unknown, fmt: string): string {
  if (value == null || value === "") return "-";
  const d = value instanceof Date ? value : new Date(value as string | number);
  if (Number.isNaN(d.getTime())) return "-";
  try {
    return format(d, fmt);
  } catch {
    return "-";
  }
}

/** All available column ids per report (full set for customization). */
const EMPLOYEE_ALL_COLUMNS = [
  "name",
  "employeeId",
  "fullNameAm",
  "position",
  "department",
  "branch",
  "grade",
  "scale",
  "status",
  "employment",
  "hireDate",
  "employmentDateGrg",
  "dateOfBirthGrg",
  "contractStartGrg",
  "contractEndGrg",
  "supervisor",
  "basicSalary",
  "currency",
  "tin",
  "pensionPfNumber",
  "employmentType",
  "fileNo",
  "idCard",
  "project",
  "createdAt",
  "approvedAt",
] as const;

/** Default column order per report (ids). Same as all available for employee types. */
export const REPORT_DEFAULT_COLUMN_IDS: Record<ReportType, string[]> = {
  experience: [
    "employeeName",
    "employeeId",
    "department",
    "company",
    "experiencePosition",
    "startDate",
    "endDate",
    "description",
    "achievements",
  ],
  education: [
    "employeeName",
    "employeeId",
    "department",
    "position",
    "institution",
    "degree",
    "field",
    "grade",
    "startDate",
    "endDate",
  ],
  all: [...EMPLOYEE_ALL_COLUMNS],
  terminated: [...EMPLOYEE_ALL_COLUMNS],
  promoted: [...EMPLOYEE_ALL_COLUMNS],
  "employment-letter": [...EMPLOYEE_ALL_COLUMNS],
};

/** Basic columns shown by default for employee reports (rest available in Customize). */
export const REPORT_DEFAULT_VISIBLE_IDS: Record<ReportType, string[]> = {
  experience: [
    "employeeName",
    "employeeId",
    "department",
    "company",
    "experiencePosition",
    "startDate",
    "endDate",
  ],
  education: [
    "employeeName",
    "employeeId",
    "department",
    "institution",
    "degree",
    "field",
    "startDate",
    "endDate",
  ],
  all: [
    "name",
    "employeeId",
    "position",
    "department",
    "branch",
    "grade",
    "status",
    "employment",
    "createdAt",
  ],
  terminated: [
    "name",
    "employeeId",
    "position",
    "department",
    "branch",
    "grade",
    "status",
    "employment",
    "createdAt",
  ],
  promoted: [
    "name",
    "employeeId",
    "position",
    "department",
    "branch",
    "grade",
    "status",
    "employment",
    "createdAt",
  ],
  "employment-letter": [
    "name",
    "employeeId",
    "position",
    "department",
    "branch",
    "grade",
    "status",
    "employment",
    "createdAt",
  ],
};

export const COLUMN_LABELS: Record<string, string> = {
  employeeName: "Employee",
  employeeId: "Employee ID",
  department: "Department",
  company: "Company",
  experiencePosition: "Job position (experience)",
  startDate: "Start date",
  endDate: "End date",
  description: "Description",
  achievements: "Achievements",
  position: "Position",
  institution: "Institution",
  degree: "Degree",
  field: "Field of study",
  grade: "Grade / level",
  name: "Employee name",
  branch: "Branch",
  status: "Approval status",
  employment: "Employment",
  createdAt: "Record created",
  fullNameAm: "Full name (Amharic)",
  scale: "Scale",
  hireDate: "Hire date",
  employmentDateGrg: "Employment date",
  dateOfBirthGrg: "Date of birth",
  contractStartGrg: "Contract start",
  contractEndGrg: "Contract end",
  supervisor: "Supervisor",
  basicSalary: "Basic salary",
  currency: "Currency",
  tin: "TIN",
  pensionPfNumber: "Pension/PF number",
  employmentType: "Employment type",
  fileNo: "File no.",
  idCard: "ID card",
  project: "Project",
  approvedAt: "Approved at",
};

function experienceCol(id: string): ColumnDef<ReportRow> | null {
  switch (id) {
    case "employeeName":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.employeeName),
        cell: ({ row }: any) => safeStr(row.original.employeeName),
      };
    case "employeeId":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.employeeId),
        cell: ({ row }: any) => safeStr(row.original.employeeId),
      };
    case "department":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.department),
        cell: ({ row }: any) => safeStr(row.original.department),
      };
    case "company":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.company),
        cell: ({ row }: any) => safeStr(row.original.company),
      };
    case "experiencePosition":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.experiencePosition),
        cell: ({ row }: any) => safeStr(row.original.experiencePosition),
      };
    case "startDate":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => r.startDate,
        cell: ({ row }: any) => formatDateSafe(row.original.startDate, "PP"),
      };
    case "endDate":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => ((r as any).current ? "Current" : (r as any).endDate),
        cell: ({ row }: any) =>
          row.original.current ? "Current" : formatDateSafe(row.original.endDate, "PP"),
      };
    case "description":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.description),
        cell: ({ row }: any) => safeStr(row.original.description),
      };
    case "achievements":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.achievements),
        cell: ({ row }: any) => safeStr(row.original.achievements),
      };
    default:
      return null;
  }
}

function educationCol(id: string): ColumnDef<ReportRow> | null {
  switch (id) {
    case "employeeName":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.employeeName),
        cell: ({ row }: any) => safeStr(row.original.employeeName),
      };
    case "employeeId":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.employeeId),
        cell: ({ row }: any) => safeStr(row.original.employeeId),
      };
    case "department":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.department),
        cell: ({ row }: any) => safeStr(row.original.department),
      };
    case "position":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.position),
        cell: ({ row }: any) => safeStr(row.original.position),
      };
    case "institution":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.institution),
        cell: ({ row }: any) => safeStr(row.original.institution),
      };
    case "degree":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.degree),
        cell: ({ row }: any) => safeStr(row.original.degree),
      };
    case "field":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.field),
        cell: ({ row }: any) => safeStr(row.original.field),
      };
    case "grade":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr(r.grade),
        cell: ({ row }: any) => safeStr(row.original.grade),
      };
    case "startDate":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => r.startDate,
        cell: ({ row }: any) => formatDateSafe(row.original.startDate, "PP"),
      };
    case "endDate":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => ((r as any).current ? "Current" : (r as any).endDate),
        cell: ({ row }: any) =>
          row.original.current ? "Current" : formatDateSafe(row.original.endDate, "PP"),
      };
    default:
      return null;
  }
}

function employeeCol(id: string): ColumnDef<ReportRow> | null {
  switch (id) {
    case "name":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) =>
          safeStr(`${(r as any).firstName ?? ""} ${(r as any).lastName ?? ""}`.trim()),
        cell: ({ row }: any) =>
          safeStr(
            `${row.original.firstName ?? ""} ${row.original.lastName ?? ""}`.trim(),
          ),
      };
    case "employeeId":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).employeeId),
        cell: ({ row }: any) => safeStr(row.original.employeeId),
      };
    case "fullNameAm":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).fullNameAm),
        cell: ({ row }: any) => safeStr(row.original.fullNameAm),
      };
    case "position":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).positionRef),
        cell: ({ row }: any) => safeStr(row.original.positionRef),
      };
    case "department":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).department),
        cell: ({ row }: any) => safeStr(row.original.department),
      };
    case "branch":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).branch),
        cell: ({ row }: any) => safeStr(row.original.branch),
      };
    case "grade":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).grade),
        cell: ({ row }: any) => safeStr(row.original.grade),
      };
    case "scale":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).scale),
        cell: ({ row }: any) => safeStr(row.original.scale),
      };
    case "status":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).requestStatus),
        cell: ({ row }: any) => safeStr(row.original.requestStatus),
      };
    case "employment":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => (r as any).empStatus,
        cell: ({ row }: any) =>
          row.original.empStatus === "TERMINATED" ? "Terminated" : "Active",
      };
    case "hireDate":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => (r as any).hireDate,
        cell: ({ row }: any) => formatDateSafe(row.original.hireDate, "PP"),
      };
    case "employmentDateGrg":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => (r as any).employmentDateGrg,
        cell: ({ row }: any) => formatDateSafe(row.original.employmentDateGrg, "PP"),
      };
    case "dateOfBirthGrg":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => (r as any).dateOfBirthGrg,
        cell: ({ row }: any) => formatDateSafe(row.original.dateOfBirthGrg, "PP"),
      };
    case "contractStartGrg":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => (r as any).contractStartGrg,
        cell: ({ row }: any) => formatDateSafe(row.original.contractStartGrg, "PP"),
      };
    case "contractEndGrg":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => (r as any).contractEndGrg,
        cell: ({ row }: any) => formatDateSafe(row.original.contractEndGrg, "PP"),
      };
    case "supervisor":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => {
          const s = (r as any).supervisor;
          if (!s) return "-";
          return safeStr(`${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()) || safeStr(s.employeeId);
        },
        cell: ({ row }: any) => {
          const s = row.original.supervisor;
          if (!s) return "-";
          return safeStr(`${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()) || safeStr(s.employeeId);
        },
      };
    case "basicSalary":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => (r as any).basicSalary,
        cell: ({ row }: any) => {
          const v = row.original.basicSalary;
          if (v == null) return "-";
          return String(v);
        },
      };
    case "currency":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).currency),
        cell: ({ row }: any) => safeStr(row.original.currency),
      };
    case "tin":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).tin),
        cell: ({ row }: any) => safeStr(row.original.tin),
      };
    case "pensionPfNumber":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).pensionPfNumber),
        cell: ({ row }: any) => safeStr(row.original.pensionPfNumber),
      };
    case "employmentType":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).employmentType),
        cell: ({ row }: any) => safeStr(row.original.employmentType),
      };
    case "fileNo":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).fileNo),
        cell: ({ row }: any) => safeStr(row.original.fileNo),
      };
    case "idCard":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).idCard),
        cell: ({ row }: any) => safeStr(row.original.idCard),
      };
    case "project":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => safeStr((r as any).project),
        cell: ({ row }: any) => safeStr(row.original.project),
      };
    case "createdAt":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => (r as any).createdAt,
        cell: ({ row }: any) => formatDateSafe(row.original.createdAt, "PP"),
      };
    case "approvedAt":
      return {
        id,
        header: COLUMN_LABELS[id],
        accessorFn: (r: any) => (r as any).approvedAt,
        cell: ({ row }: any) => formatDateSafe(row.original.approvedAt, "PP"),
      };
    default:
      return null;
  }
}

export function buildColumnDef(
  reportType: ReportType,
  colId: string,
): ColumnDef<ReportRow> | null {
  if (reportType === "experience") return experienceCol(colId);
  if (reportType === "education") return educationCol(colId);
  return employeeCol(colId);
}

export function mergeColumnLayout(
  reportType: ReportType,
  savedOrder?: string[] | null,
  savedVisible?: Record<string, boolean> | null,
): { order: string[]; visible: Record<string, boolean> } {
  const allIds = REPORT_DEFAULT_COLUMN_IDS[reportType];
  const defaultVisibleIds = REPORT_DEFAULT_VISIBLE_IDS[reportType];
  const order = [...(savedOrder?.length ? savedOrder : allIds)];
  for (const id of allIds) {
    if (!order.includes(id)) order.push(id);
  }
  const orderFiltered = order.filter((id) => allIds.includes(id));
  const visible: Record<string, boolean> = {};
  for (const id of allIds) {
    if (savedVisible && savedVisible[id] !== undefined) {
      visible[id] = savedVisible[id] !== false;
    } else {
      visible[id] = defaultVisibleIds.includes(id);
    }
  }
  if (!Object.values(visible).some(Boolean)) visible[allIds[0]] = true;
  return { order: orderFiltered, visible };
}
