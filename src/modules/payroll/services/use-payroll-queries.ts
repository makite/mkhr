import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { CACHE_POLICIES } from "@/lib/query-client";
import {
  payrollService,
  type PayrollPeriod,
  type TransactionType,
  type TaxBracket,
  type Bank,
  type OvertimeRate,
  type EmployeePayrollProfile,
  type PayrollRunSummary,
  type PayrollSlipItem,
} from "./payroll-service";
import { toast } from "sonner";

// ── Query Hooks ─────────────────────────────────────────────────────────────

export function usePayrollDashboard() {
  return useQuery({
    queryKey: queryKeys.payroll.dashboard(),
    queryFn: () => payrollService.getDashboardStats(),
    ...CACHE_POLICIES.TRANSACTIONAL,
  });
}

export function usePayrollPeriods(fiscalYearId?: string) {
  return useQuery<PayrollPeriod[]>({
    queryKey: queryKeys.payroll.periods(fiscalYearId),
    queryFn: () => payrollService.getPeriods(fiscalYearId),
    ...CACHE_POLICIES.ORGANIZATION_DATA,
  });
}

export function useCurrentPayrollPeriod() {
  return useQuery<PayrollPeriod>({
    queryKey: queryKeys.payroll.currentPeriod(),
    queryFn: () => payrollService.getCurrentPeriod(),
    ...CACHE_POLICIES.TRANSACTIONAL,
  });
}

export function usePayrollTransactionTypes() {
  return useQuery<TransactionType[]>({
    queryKey: queryKeys.payroll.transactionTypes(),
    queryFn: () => payrollService.getTransactionTypes(),
    ...CACHE_POLICIES.ORGANIZATION_DATA,
  });
}

export function usePayrollTaxBrackets() {
  return useQuery<TaxBracket[]>({
    queryKey: queryKeys.payroll.taxBrackets(),
    queryFn: () => payrollService.getTaxBrackets(),
    ...CACHE_POLICIES.STATIC_LOOKUPS,
  });
}

export function usePayrollBanks() {
  return useQuery<Bank[]>({
    queryKey: queryKeys.payroll.banks(),
    queryFn: () => payrollService.getBanks(),
    ...CACHE_POLICIES.ORGANIZATION_DATA,
  });
}

export function usePayrollOvertimeRates() {
  return useQuery<OvertimeRate[]>({
    queryKey: queryKeys.payroll.overtimeRates(),
    queryFn: () => payrollService.getOvertimeRates(),
    ...CACHE_POLICIES.ORGANIZATION_DATA,
  });
}

export function usePayrollTransactions(params?: {
  periodId?: string;
  employeeId?: string;
  transactionTypeId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.payroll.transactions(params),
    queryFn: () => payrollService.getTransactions(params),
    ...CACHE_POLICIES.TRANSACTIONAL,
  });
}

export function usePayrollLoans(employeeId?: string) {
  return useQuery({
    queryKey: queryKeys.payroll.loans(employeeId),
    queryFn: () => payrollService.getStaffLoans(employeeId),
    ...CACHE_POLICIES.TRANSACTIONAL,
  });
}

export function usePayrollCostSharing(employeeId?: string) {
  return useQuery({
    queryKey: queryKeys.payroll.costSharing(employeeId),
    queryFn: () => payrollService.getCostSharing(employeeId),
    ...CACHE_POLICIES.TRANSACTIONAL,
  });
}

export function usePayrollEmployeeProfiles(params?: {
  branchId?: string;
  search?: string;
}) {
  return useQuery<EmployeePayrollProfile[]>({
    queryKey: queryKeys.payroll.employeeProfiles(params),
    queryFn: () => payrollService.getEmployeeProfiles(params),
    ...CACHE_POLICIES.TRANSACTIONAL,
  });
}

export function usePayrollMasterRegister(
  params: { periodId: string; branchId?: string; page?: number; limit?: number },
  enabled = true
) {
  return useQuery<{
    run: PayrollRunSummary | null;
    pagination: { total: number; page: number; limit: number; totalPages: number };
    items: PayrollSlipItem[];
  }>({
    queryKey: queryKeys.payroll.register(params),
    queryFn: () => payrollService.getMasterRegister(params),
    enabled: enabled && !!params.periodId,
    ...CACHE_POLICIES.TRANSACTIONAL,
  });
}

export function usePayrollGlJournal(
  params: { periodId: string; branchId?: string },
  enabled = false
) {
  return useQuery({
    queryKey: queryKeys.payroll.glJournal(params),
    queryFn: () => payrollService.getGlJournal(params),
    enabled: enabled && !!params.periodId,
    ...CACHE_POLICIES.TRANSACTIONAL,
  });
}

// ── Mutation Hooks ──────────────────────────────────────────────────────────

export function useSaveTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => payrollService.saveTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.transactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.dashboard() });
      toast.success("Variable entry recorded successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save variable entry.");
    },
  });
}

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payrollService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.transactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.dashboard() });
      toast.success("Transaction deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete transaction.");
    },
  });
}

export function useSaveStaffLoanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => payrollService.saveStaffLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.loans() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.dashboard() });
      toast.success("Staff loan recorded successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save staff loan.");
    },
  });
}

export function useSaveCostSharingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => payrollService.saveCostSharing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.costSharing() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.dashboard() });
      toast.success("Higher education cost sharing recorded successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save cost sharing.");
    },
  });
}

export function useUpdatePeriodRatesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { fuelRate?: number; exchangeRateUSD?: number } }) =>
      payrollService.updatePeriodRates(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.periods() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.currentPeriod() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.dashboard() });
      toast.success("Period rates updated successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update rates.");
    },
  });
}

export function useSaveTransactionTypeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TransactionType>) => payrollService.saveTransactionType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.transactionTypes() });
      toast.success("Transaction rule saved successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save transaction rule.");
    },
  });
}

export function useSaveBankMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Bank>) => payrollService.saveBank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.banks() });
      toast.success("Bank saved successfully.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save bank.");
    },
  });
}

export function useUpdateBankDetailsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, data }: { employeeId: string; data: any }) =>
      payrollService.updateBankDetails(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.employeeProfiles() });
      toast.success("Disbursement banking details updated.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update bank details.");
    },
  });
}

export function useAcceptEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: string) => payrollService.acceptEmployee(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.employeeProfiles() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.dashboard() });
      toast.success("Employee accepted for payroll calculation.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to accept employee.");
    },
  });
}

export function useSkipEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, reason }: { employeeId: string; reason?: string }) =>
      payrollService.skipEmployee(employeeId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.employeeProfiles() });
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.dashboard() });
      toast.success("Employee skipped from payroll calculation.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to skip employee.");
    },
  });
}

export function useSubmitPayrollMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) => payrollService.submitForApproval(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.register({ periodId: "" }) });
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.all });
      toast.success("Payroll successfully submitted for checker approval.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit payroll.");
    },
  });
}

export function useApprovePayrollMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) => payrollService.approvePayroll(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.all });
      toast.success("Payroll successfully approved.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to approve payroll.");
    },
  });
}

export function useFinalizePayrollMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) => payrollService.finalizePayroll(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.all });
      toast.success("Payroll successfully finalized and locked.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to finalize payroll.");
    },
  });
}

export function useRollbackPayrollMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ runId, reason }: { runId: string; reason: string }) =>
      payrollService.rollbackToDraft(runId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.all });
      toast.success("Payroll rolled back to DRAFT. Audit snapshot logged.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to rollback payroll.");
    },
  });
}

export function useCloseMonthEndMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (periodId: string) => payrollService.closeMonthEnd(periodId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.all });
      toast.success(`Month-end closed successfully! Next active period: ${res.nextActivePeriod}`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to close month end.");
    },
  });
}

export function useCalculateBackpayMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { employeeId: string; fromPeriodId: string; toPeriodId: string; newBasicSalary: number }) =>
      payrollService.calculateBackpay(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.transactions() });
      toast.success("Backpay calculated and scheduled for current payroll run.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to calculate backpay.");
    },
  });
}
