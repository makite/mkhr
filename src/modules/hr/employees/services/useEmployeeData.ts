/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { EmployeeLookupData } from "../types/employee.type";
import { employeeService } from "./employee-service";

export const useEmployeeData = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lookupData, setLookupData] = useState<EmployeeLookupData>({
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
    salaryMatrix: {},
  });

  const [filteredPositions, setFilteredPositions] = useState<any[]>([]);
  const [filteredScales, setFilteredScales] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [lookup, org] = await Promise.all([
          employeeService.fetchLookupData(),
          employeeService.fetchOrganizationData(),
        ]);

        const combinedData = {
          ...lookup,
          ...org,
        };

        // Build salary map: gradeId -> scaleId -> amount
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
        
        setLookupData({
          ...(combinedData as any),
          salaryMatrix,
        });
        
        // Initialize filtered data with all positions and scales
        setFilteredPositions(combinedData.positions || []);
        setFilteredScales(combinedData.scales || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateFilteredPositions = useCallback((gradeId: string) => {
    if (gradeId && lookupData.positions.length > 0) {
      const filtered = lookupData.positions.filter((p) => p.gradeId === gradeId);
      setFilteredPositions(filtered);
    } else {
      setFilteredPositions(lookupData.positions);
    }
  }, [lookupData.positions]);

  const updateFilteredScales = useCallback((gradeId: string) => {
    if (gradeId && lookupData.scales.length > 0) {
      setFilteredScales(lookupData.scales);
    } else {
      setFilteredScales([]);
    }
  }, [lookupData.scales]);

  return {
    loading,
    lookupData,
    filteredPositions,
    filteredScales,
    updateFilteredPositions,
    updateFilteredScales,
  };
};
