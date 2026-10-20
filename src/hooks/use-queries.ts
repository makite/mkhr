import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { CACHE_POLICIES } from "@/lib/query-client";

/**
 * Hook to fetch and cache master lookup values for a given code (e.g. TITLE, GENDER, MARITAL_STATUS).
 * Cached for 10 minutes with automated background revalidation.
 */
export function useLookupValues(code: string) {
  return useQuery({
    queryKey: queryKeys.lookups.byCode(code),
    queryFn: async () => {
      const res = await api.get(`/lookups/${code}`);
      return res?.data?.values || res?.values || [];
    },
    enabled: Boolean(code),
    ...CACHE_POLICIES.STATIC_LOOKUPS,
  });
}

/**
 * Hook to fetch and cache hierarchical department tree.
 * Cached for 5 minutes with automated background sync.
 */
export function useDepartmentTree() {
  return useQuery({
    queryKey: queryKeys.organization.departmentsTree(),
    queryFn: async () => {
      const res = await api.get("/departments/tree");
      return res?.data?.departments || res?.departments || [];
    },
    ...CACHE_POLICIES.ORGANIZATION_DATA,
  });
}

/**
 * Hook to fetch and cache branch hierarchy tree.
 * Cached for 5 minutes with automated background sync.
 */
export function useBranchTree() {
  return useQuery({
    queryKey: queryKeys.organization.branchesTree(),
    queryFn: async () => {
      const res = await api.get("/branches/tree");
      return res?.data?.branches || res?.branches || [];
    },
    ...CACHE_POLICIES.ORGANIZATION_DATA,
  });
}

/**
 * Hook to fetch and cache the full 2D salary matrix.
 */
export function useSalaryMatrix() {
  return useQuery({
    queryKey: queryKeys.organization.salaryMatrix(),
    queryFn: async () => {
      const res = await api.get("/salary-matrix/full");
      return res?.data?.matrix || res?.matrix || {};
    },
    ...CACHE_POLICIES.ORGANIZATION_DATA,
  });
}

/**
 * Hook to monitor pending HR actions queue.
 * Refreshes frequently (30s) to keep badge counts up to date.
 */
export function usePendingHrActions() {
  return useQuery({
    queryKey: queryKeys.hrActions.queue("PENDING"),
    queryFn: async () => {
      const res = await api.get("/hr-actions?status=PENDING");
      return res?.data?.items || res?.items || [];
    },
    ...CACHE_POLICIES.TRANSACTIONAL,
    refetchInterval: 30 * 1000, // 30-second auto-poll
  });
}

/**
 * Helper to easily invalidate related cache keys upon mutations (e.g. after approving an employee).
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateEmployees: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all }),
    invalidateHrActions: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.hrActions.all }),
    invalidateOrganization: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.organization.all }),
    invalidateLookups: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.lookups.all }),
    invalidateDashboard: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
  };
}
