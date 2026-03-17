export interface LookupValue {
  id: string;
  code: string;
  value: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Position {
  id: string;
  name: string;
  code: string;
  gradeId: string;
}

export interface Grade {
  id: string;
  name: string;
  level: number;
}

export interface Scale {
  id: string;
  name: string;
  stepNumber: number;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface EmployeeFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  fullNameAm?: string;
  titleId?: string;
  genderId?: string;
  dateOfBirthGrg?: Date;
  dateOfBirthEth?: string;
  nationality?: string;
  maritalStatus?: string;

  // Contact Information
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  // Employment Details
  employmentTypeId?: string;
  hireDate?: Date;
  departmentId?: string;
  positionId?: string;
  gradeId?: string;
  scaleId?: string;
  branchId?: string;
  supervisorId?: string;

  // Compensation
  basicSalary?: number;
  currency: string;
  pfContRate: number;
  tin?: string;
  pensionPfNumber?: string;
  bankAccount?: string;

  // Experience
  yearsOfExperience?: number;
  relevantExperience: boolean;

  // Status
  isActive: boolean;
}

export interface EmployeeLookupData {
  titles: LookupValue[];
  genders: LookupValue[];
  maritalStatuses: LookupValue[];
  nationalities: LookupValue[];
  employmentTypes: LookupValue[];
  departments: Department[];
  positions: Position[];
  grades: Grade[];
  scales: Scale[];
  branches: Branch[];
  employees: Employee[];

  // Derived helper map: gradeId -> scaleId -> amount
  salaryMatrix?: Record<string, Record<string, number>>;
}
