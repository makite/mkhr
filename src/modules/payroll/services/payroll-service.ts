import api from "@/lib/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PayrollPeriod {
  id: string;
  fiscalYearId: string;
  periodNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  fuelRate: number;
  exchangeRateUSD: number;
  status: "OPEN" | "CLOSED" | "UPCOMING";
  isCurrent: boolean;
  workingDays?: number;
}

export interface TransactionType {
  id: string;
  code: string;
  name: string;
  shortName?: string;
  description?: string;
  transType: "ADDITION" | "DEDUCTION";
  calcTypeId?: string;
  takeFromId?: string;
  eligibilityId?: string;
  prioritySeq: number;
  isTaxed: boolean;
  applyPension: boolean;
  deductAbsence: boolean;
  deductPenalty: boolean;
  deductCostSharing: boolean;
  clearOnMonthEnd: boolean;
  hasException: boolean;
  excludeFromSeverance: boolean;
  allowNegative: boolean;
  allowBackPayment: boolean;
  isVariable: boolean;
  directPayToBank: boolean;
  accountCode?: string;
  subAccountCode?: string;
  costCenterCode?: string;
  debitCredit: "DEBIT" | "CREDIT";
  defaultValue: number;
  isActive: boolean;
}

export interface TaxBracket {
  id: string;
  bracketNo: number;
  minIncome: number;
  maxIncome?: number | null;
  ratePercent: number;
  deductible: number;
  description?: string;
}

export interface Bank {
  id: string;
  code: string;
  name: string;
  swiftCode?: string;
  accountNumberPattern?: string;
  isActive: boolean;
}

export interface OvertimeRate {
  id: string;
  code: string;
  name: string;
  rateMultiplier: number;
  startTime?: string;
  endTime?: string;
  isActive: boolean;
}

export interface EmployeePayrollProfile {
  id: string;
  employeeId: string;
  employeeIdDb: string;
  fullName: string;
  fullNameAm?: string;
  branch?: string;
  department?: string;
  position?: string;
  basicSalary: number;
  bankName?: string;
  bankAccountNo?: string;
  bankBranch?: string;
  paymentMethod: string;
  skipFromPayroll: boolean;
  skipReason?: string;
  eligibility?: string;
  payrollBranch?: string;
}

export interface PayrollSlipItem {
  rowNo: number;
  slipId: string;
  employeeIdDb: string;
  fullName: string;
  fullNameAm?: string;
  branch: string;
  basicSalary: number;
  employeeId: string;
  salaryPayable: number;
  transportAllowance: number;
  transportAllowanceNonTaxable: number;
  hardshipAllowance: number;
  housingAllowance: number;
  repAllowance: number;
  commAllowance: number;
  overTime: number;
  otherAllowance: number;
  grossEarning: number;
  taxableEarnings: number;
  incomeTax: number;
  employeePension7: number;
  pension11: number;
  staffLoan: number;
  costSharing: number;
  pf4: number;
  severancePay: number;
  otherDeduction: number;
  totalDeduction: number;
  netPayETB: number;
  netPayUSD: number;
  absentDays: number;
  absentDeduction: number;
  bankAccount: string;
  department: string;
  position: string;
}

export interface PayrollRunSummary {
  id: string;
  periodId: string;
  periodName: string;
  branchId?: string | null;
  branchName: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "FINALIZED" | "CLOSED";
  totalEmployees: number;
  totalGross: number;
  totalTaxable: number;
  totalIncomeTax: number;
  totalPensionEmp: number;
  totalPensionOrg: number;
  totalDeductions: number;
  totalNetPayETB: number;
  totalNetPayUSD: number;
  submittedBy?: string | null;
  approvedBy?: string | null;
  finalizedBy?: string | null;
}

export const payrollService = {
  // Dashboard
  async getDashboardStats() {
    const res = await api.get<ApiResponse<any>>("/payroll/dashboard/stats");
    return res.data;
  },
  // Setup
  async getPeriods(fiscalYearId?: string) {
    const res = await api.get<ApiResponse<PayrollPeriod[]>>("/payroll/setup/periods", {
      params: { fiscalYearId },
    });
    return res.data;
  },

  async getCurrentPeriod() {
    const res = await api.get<ApiResponse<PayrollPeriod>>("/payroll/setup/current-period");
    return res.data;
  },

  async updatePeriodRates(id: string, data: { fuelRate?: number; exchangeRateUSD?: number }) {
    const res = await api.put<ApiResponse<PayrollPeriod>>(`/payroll/setup/periods/${id}`, data);
    return res.data;
  },

  async getTransactionTypes() {
    const res = await api.get<ApiResponse<TransactionType[]>>("/payroll/setup/transaction-types");
    return res.data;
  },

  async saveTransactionType(data: Partial<TransactionType>) {
    if (data.id) {
      const res = await api.put<ApiResponse<TransactionType>>(`/payroll/setup/transaction-types/${data.id}`, data);
      return res.data;
    }
    const res = await api.post<ApiResponse<TransactionType>>("/payroll/setup/transaction-types", data);
    return res.data;
  },

  async getTaxBrackets() {
    const res = await api.get<ApiResponse<TaxBracket[]>>("/payroll/setup/tax-brackets");
    return res.data;
  },

  async getBanks() {
    const res = await api.get<ApiResponse<Bank[]>>("/payroll/setup/banks");
    return res.data;
  },

  async saveBank(data: Partial<Bank>) {
    const res = await api.post<ApiResponse<Bank>>("/payroll/setup/banks", data);
    return res.data;
  },

  async getOvertimeRates() {
    const res = await api.get<ApiResponse<OvertimeRate[]>>("/payroll/setup/overtime-rates");
    return res.data;
  },

  async saveOvertimeRate(data: Partial<OvertimeRate>) {
    const res = await api.post<ApiResponse<OvertimeRate>>("/payroll/setup/overtime-rates", data);
    return res.data;
  },

  // Variable Transactions
  async getTransactions(params?: { periodId?: string; employeeId?: string; transactionTypeId?: string }) {
    const res = await api.get<ApiResponse<any[]>>("/payroll/transactions", { params });
    return res.data;
  },

  async saveTransaction(data: any) {
    const res = await api.post<ApiResponse<any>>("/payroll/transactions", data);
    return res.data;
  },

  async deleteTransaction(id: string) {
    const res = await api.delete<ApiResponse<any>>(`/payroll/transactions/${id}`);
    return res.data;
  },

  async getStaffLoans(employeeId?: string) {
    const res = await api.get<ApiResponse<any[]>>("/payroll/transactions/loans", { params: { employeeId } });
    return res.data;
  },

  async saveStaffLoan(data: any) {
    const res = await api.post<ApiResponse<any>>("/payroll/transactions/loans", data);
    return res.data;
  },

  async getCostSharing(employeeId?: string) {
    const res = await api.get<ApiResponse<any[]>>("/payroll/transactions/cost-sharing", { params: { employeeId } });
    return res.data;
  },

  async saveCostSharing(data: any) {
    const res = await api.post<ApiResponse<any>>("/payroll/transactions/cost-sharing", data);
    return res.data;
  },

  // Employee Profiles
  async getEmployeeProfiles(params?: { branchId?: string; search?: string }) {
    const res = await api.get<ApiResponse<EmployeePayrollProfile[]>>("/payroll/employees/profiles", { params });
    return res.data;
  },

  async updateBankDetails(employeeId: string, data: any) {
    const res = await api.put<ApiResponse<any>>(`/payroll/employees/bank-details/${employeeId}`, data);
    return res.data;
  },

  async acceptEmployee(employeeId: string) {
    const res = await api.put<ApiResponse<any>>(`/payroll/profiles/${employeeId}/accept`);
    return res.data;
  },

  async skipEmployee(employeeId: string, reason?: string) {
    const res = await api.put<ApiResponse<any>>(`/payroll/profiles/${employeeId}/skip`, { reason });
    return res.data;
  },

  async togglePayrollStatus(employeeId: string, data: { skipFromPayroll: boolean; skipReason?: string }) {
    const res = await api.post<ApiResponse<any>>(`/payroll/employees/toggle-status/${employeeId}`, data);
    return res.data;
  },

  // Payroll Execution & Processing
  async calculatePayroll(data: { periodId: string; branchId?: string }) {
    const res = await api.post<ApiResponse<{ jobId: string; status: string }>>("/payroll/processing/calculate", data);
    return res.data;
  },

  async getJobProgress(jobId: string) {
    const res = await api.get<ApiResponse<{
      jobId: string;
      status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
      progress: number;
      processedCount: number;
      totalCount: number;
      currentEmployee?: string;
      message?: string;
    }>>(`/payroll/processing/progress/${jobId}`);
    return res.data;
  },

  async getMasterRegister(params: { periodId: string; branchId?: string; page?: number; limit?: number }) {
    const res = await api.get<ApiResponse<{
      run: PayrollRunSummary | null;
      pagination: { total: number; page: number; limit: number; totalPages: number };
      items: PayrollSlipItem[];
    }>>("/payroll/processing/register", { params });
    return res.data;
  },

  async submitForApproval(runId: string) {
    const res = await api.post<ApiResponse<any>>("/payroll/processing/submit", { runId });
    return res.data;
  },

  async approvePayroll(runId: string) {
    const res = await api.post<ApiResponse<any>>("/payroll/processing/approve", { runId });
    return res.data;
  },

  async finalizePayroll(runId: string) {
    const res = await api.post<ApiResponse<any>>("/payroll/processing/finalize", { runId });
    return res.data;
  },

  async rollbackToDraft(runId: string, reason: string) {
    const res = await api.post<ApiResponse<any>>("/payroll/processing/rollback-draft", { runId, reason });
    return res.data;
  },

  async calculateBackpay(data: { employeeId: string; fromPeriodId: string; toPeriodId: string; newBasicSalary: number }) {
    const res = await api.post<ApiResponse<any>>("/payroll/processing/backpay", data);
    return res.data;
  },

  async getGlJournal(params: { periodId: string; branchId?: string }) {
    const res = await api.get<ApiResponse<{
      voucherNo: string;
      periodName: string;
      branchName: string;
      currency: string;
      isBalanced: boolean;
      totalDebits: number;
      totalCredits: number;
      lines: Array<{
        accountCode: string;
        accountName: string;
        debit: number;
        credit: number;
      }>;
    }>>("/payroll/processing/gl-journal", { params });
    return res.data;
  },

  async closeMonthEnd(periodId: string) {
    const res = await api.post<ApiResponse<{
      closedPeriod: string;
      nextActivePeriod: string;
    }>>("/payroll/processing/close-month-end", { periodId });
    return res.data;
  },
};
