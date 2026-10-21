/**
 * Centralized Query Keys Factory for TanStack Query.
 * Guarantees consistent cache keys for fetching and invalidation across the app.
 */
export const queryKeys = {
  lookups: {
    all: ["lookups"] as const,
    byCode: (code: string) => ["lookups", code] as const,
    types: () => ["lookups", "types"] as const,
    allMerged: () => ["lookups", "merged"] as const,
  },
  organization: {
    all: ["organization"] as const,
    departments: () => ["organization", "departments"] as const,
    departmentsTree: () => ["organization", "departments", "tree"] as const,
    branches: () => ["organization", "branches"] as const,
    branchesTree: () => ["organization", "branches", "tree"] as const,
    positions: () => ["organization", "positions"] as const,
    grades: () => ["organization", "grades"] as const,
    scales: () => ["organization", "scales"] as const,
    salaryMatrix: () => ["organization", "salary-matrix"] as const,
    allMerged: () => ["organization", "merged"] as const,
  },
  employees: {
    all: ["employees"] as const,
    list: (params?: Record<string, unknown>) => ["employees", "list", params] as const,
    detail: (id: string) => ["employees", "detail", id] as const,
    combinedLookupAndOrg: () => ["employees", "master-lookup-org"] as const,
  },
  hrActions: {
    all: ["hr-actions"] as const,
    queue: (status = "PENDING") => ["hr-actions", "queue", status] as const,
    byEmployee: (empId: string) => ["hr-actions", "employee", empId] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    stats: (type: "system-admin" | "hr") => ["dashboard", type] as const,
  },
  benefits: {
    all: ["benefits"] as const,
    types: () => ["benefits", "types"] as const,
    assignments: () => ["benefits", "assignments"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params?: Record<string, unknown>) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
  company: {
    public: () => ["company", "public"] as const,
  },
  payroll: {
    all: ["payroll"] as const,
    dashboard: () => ["payroll", "dashboard"] as const,
    periods: (fiscalYearId?: string) => ["payroll", "periods", fiscalYearId] as const,
    currentPeriod: () => ["payroll", "current-period"] as const,
    transactionTypes: () => ["payroll", "transaction-types"] as const,
    taxBrackets: () => ["payroll", "tax-brackets"] as const,
    banks: () => ["payroll", "banks"] as const,
    overtimeRates: () => ["payroll", "overtime-rates"] as const,
    transactions: (params?: Record<string, unknown>) =>
      ["payroll", "transactions", params] as const,
    loans: (employeeId?: string) => ["payroll", "loans", employeeId] as const,
    costSharing: (employeeId?: string) => ["payroll", "cost-sharing", employeeId] as const,
    employeeProfiles: (params?: Record<string, unknown>) =>
      ["payroll", "employee-profiles", params] as const,
    register: (params: { periodId: string; branchId?: string; page?: number; limit?: number }) =>
      ["payroll", "register", params] as const,
    glJournal: (params: { periodId: string; branchId?: string }) =>
      ["payroll", "gl-journal", params] as const,
  },
} as const;
