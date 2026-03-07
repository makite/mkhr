/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
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

  const [filteredPositions, setFilteredPositions] = useState(
    lookupData.positions,
  );
  const [filteredScales, setFilteredScales] = useState(lookupData.scales);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [lookup, org] = await Promise.all([
          employeeService.fetchLookupData(),
          employeeService.fetchOrganizationData(),
        ]);

        setLookupData({
          ...lookup,
          ...org,
        });
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

  const updateFilteredPositions = (gradeId: string) => {
    if (gradeId && lookupData.positions.length > 0) {
      setFilteredPositions(
        lookupData.positions.filter((p) => p.gradeId === gradeId),
      );
    } else {
      setFilteredPositions([]);
    }
  };

  const updateFilteredScales = (gradeId: string) => {
    if (gradeId && lookupData.scales.length > 0) {
      setFilteredScales(lookupData.scales);
    } else {
      setFilteredScales([]);
    }
  };

  return {
    loading,
    lookupData,
    filteredPositions,
    filteredScales,
    updateFilteredPositions,
    updateFilteredScales,
  };
};
