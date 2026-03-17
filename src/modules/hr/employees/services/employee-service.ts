/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";
import type { BasicInfoValues } from "@/modules/hr/employees/schema/employeeSchema";

import { format } from "date-fns";

class EmployeeService {
  async createEmployee(
    data: BasicInfoValues,
    userId: string,
    companyId: string,
  ) {
    const payload: any = {
      ...data,
      companyId,
      createdBy: userId,
      createdById: userId,
      requestStatus: "PENDING",
    };

    if (data.dateOfBirthGrg) {
      payload.dateOfBirthGrg = format(data.dateOfBirthGrg, "yyyy-MM-dd");
    }

    const response = await api.post("/employees", payload);
    return response.data;
  }

  async updateEmployee(
    employeeId: string,
    data: Partial<BasicInfoValues>,
    userId: string,
  ) {
    const payload: any = {
      ...data,
      updatedBy: userId,
    };

    if (data.hireDate) {
      payload.hireDate = format(data.hireDate, "yyyy-MM-dd");
    }

    const response = await api.put(`/employees/${employeeId}`, payload);
    return response.data;
  }

  async submitForApproval(employeeId: string) {
    const response = await api.put(`/employees/${employeeId}/approve`, {});
    return response.data;
  }

  async fetchLookupData() {
    const [titlesRes, gendersRes, maritalRes, nationalitiesRes, empTypesRes] =
      await Promise.all([
        api.get("/lookups/TITLE"),
        api.get("/lookups/GENDER"),
        api.get("/lookups/MARITAL_STATUS"),
        api.get("/lookups/COUNTRY"),
        api.get("/lookups/EMPLOYMENT_TYPE"),
      ]);

    return {
      titles: titlesRes.data?.values || [],
      genders: gendersRes.data?.values || [],
      maritalStatuses: maritalRes.data?.values || [],
      nationalities: nationalitiesRes.data?.values || [],
      employmentTypes: empTypesRes.data?.values || [],
    };
  }

  async fetchOrganizationData() {
    const [
      deptsRes,
      positionsRes,
      gradesRes,
      scalesRes,
      branchesRes,
      employeesRes,
      salaryMatrixRes,
    ] = await Promise.all([
      api.get("/departments"),
      api.get("/positions"),
      api.get("/grades"),
      api.get("/scales"),
      api.get("/branches"),
      api.get("/employees?limit=100"),
      api.get("/salary-matrix/full"),
    ]);

    return {
      departments: deptsRes.data?.departments || [],
      positions: positionsRes.data?.positions || [],
      grades: gradesRes.data?.grades || [],
      scales: scalesRes.data?.scales || [],
      branches: branchesRes.data?.branches || [],
      employees: employeesRes.data?.employees || [],
      salaryMatrixFull:
        salaryMatrixRes.data?.data?.matrix || salaryMatrixRes.data?.matrix || {},
    };
  }
}

export const employeeService = new EmployeeService();
