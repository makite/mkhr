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
        
        setLookupData(combinedData);
        
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
