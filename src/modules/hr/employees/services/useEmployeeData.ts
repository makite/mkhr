/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { EmployeeLookupData } from "../types/employee.type";
import { employeeService } from "./employee-service";
import { queryKeys } from "@/lib/query-keys";
import { CACHE_POLICIES } from "@/lib/query-client";

const emptyLookupData: EmployeeLookupData = {
  titles: [],
  genders: [],
  maritalStatuses: [],
  nationalities: [],
  employmentTypes: [],
  departments: [],
  positions: [],
  grades: [],
  scales: [],
  branches: [],
  employees: [],
  currencies: [],
  salaryMatrix: {},
};

/**
 * Enterprise hook backed by TanStack Query.
 * Caches master lookups, departments, positions, grades, scales, and salary matrix.
 * - Stale time: 5 minutes (served instantly from cache on navigation).
 * - Background auto-sync: every 5 minutes in case values change.
 * - Backward-compatible API for all existing consumer components.
 */
export const useEmployeeData = () => {
  const { toast } = useToast();
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.employees.combinedLookupAndOrg(),
    queryFn: async () => {
      try {
        const [lookup, org] = await Promise.all([
          employeeService.fetchLookupData(),
          employeeService.fetchOrganizationData(),
        ]);

        const combinedData = {
          ...lookup,
          ...org,
        };

        // Build 2D salary matrix map: gradeId -> scaleId -> amount
        const salaryMatrixRaw = (combinedData as any).salaryMatrixFull || {};
        const gradeCodeById = new Map<string, string>();
        const scaleCodeById = new Map<string, string>();

        for (const g of (combinedData as any).grades || []) {
          if (g?.id && g?.code) gradeCodeById.set(String(g.id), String(g.code));
        }
        for (const s of (combinedData as any).scales || []) {
          if (s?.id && s?.code) scaleCodeById.set(String(s.id), String(s.code));
        }

        const salaryMatrix: Record<string, Record<string, number>> = {};
        for (const [gradeId, gradeCode] of gradeCodeById.entries()) {
          for (const [scaleId, scaleCode] of scaleCodeById.entries()) {
            const amount = salaryMatrixRaw?.[gradeCode]?.[scaleCode];
            if (typeof amount === "number") {
              salaryMatrix[gradeId] = salaryMatrix[gradeId] || {};
              salaryMatrix[gradeId][scaleId] = amount;
            }
          }
        }

        const lookupData: EmployeeLookupData = {
          ...(combinedData as any),
          salaryMatrix,
        };

        return {
          lookupData,
          allPositions: combinedData.positions || [],
          allScales: combinedData.scales || [],
        };
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load master lookup and organization data",
          variant: "destructive",
        });
        throw err;
      }
    },
    ...CACHE_POLICIES.ORGANIZATION_DATA,
  });

  const lookupData: EmployeeLookupData = data?.lookupData || emptyLookupData;
  const allPositions = data?.allPositions || [];
  const allScales = data?.allScales || [];

  // Filter positions and scales based on selected grade
  const filteredPositions = useMemo(() => {
    if (selectedGradeId && allPositions.length > 0) {
      return allPositions.filter((p: any) => p.gradeId === selectedGradeId);
    }
    return allPositions;
  }, [selectedGradeId, allPositions]);

  const filteredScales = useMemo(() => {
    if (selectedGradeId && allScales.length > 0) {
      return allScales;
    }
    return allScales;
  }, [selectedGradeId, allScales]);

  const updateFilteredPositions = useCallback((gradeId: string) => {
    setSelectedGradeId(gradeId || null);
  }, []);

  const updateFilteredScales = useCallback((_gradeId: string) => {
    // Scales remain available for the grade
  }, []);

  return {
    loading: isLoading,
    isFetching,
    lookupData,
    filteredPositions,
    filteredScales,
    updateFilteredPositions,
    updateFilteredScales,
    refetch,
    error,
  };
};
