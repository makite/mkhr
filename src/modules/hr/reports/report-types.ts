/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EmployeeRow {
  id: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  fullNameAm?: string | null;
  requestStatus?: string;
  empStatus?: string;
  createdAt?: string;
  approvedAt?: string | null;
  hireDate?: string | null;
  employmentDateGrg?: string | null;
  dateOfBirthGrg?: string | null;
  contractStartGrg?: string | null;
  contractEndGrg?: string | null;
  employmentType?: string;
  basicSalary?: unknown;
  currency?: string | null;
  tin?: string | null;
  pensionPfNumber?: string | null;
  fileNo?: string | null;
  idCard?: string | null;
  project?: string | null;
  positionRef?: { name?: string; code?: string } | null;
  grade?: { name?: string; level?: number } | null;
  scale?: { name?: string; stepNumber?: number } | null;
  branch?: { name?: string; code?: string } | null;
  department?: { name?: string } | null;
  supervisor?: { id?: string; firstName?: string; lastName?: string; employeeId?: string } | null;
}

export interface ExperienceRow {
  id: string;
  employeeId: string;
  employeeName: string;
  department?: string | null;
  position?: string | null;
  company: string;
  experiencePosition: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  description?: string | null;
  achievements?: string | null;
}

export interface EducationRow {
  id: string;
  employeeId: string;
  employeeName: string;
  department?: string | null;
  position?: string | null;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  grade?: string | null;
}

export type ReportRow = EmployeeRow | ExperienceRow | EducationRow;
