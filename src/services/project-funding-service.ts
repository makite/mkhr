/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface Funder {
  id: string;
  code: string;
  name: string;
  type: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProjectGrant {
  id: string;
  grantNumber: string;
  fundedAmount: number;
  fundedPercent?: number;
  currency: string;
  grantStartDate: string;
  grantEndDate: string;
  funder: {
    id: string;
    code: string;
    name: string;
  };
}

export interface BudgetLine {
  id: string;
  code: string;
  description: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  currency: string;
  isActive: boolean;
  grant?: ProjectGrant;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: "PLANNING" | "ACTIVE" | "SUSPENDED" | "CLOSED";
  totalBudget: number;
  currency: string;
  projectManager?: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
  };
  grants?: ProjectGrant[];
  budgetLines?: BudgetLine[];
}

export interface EmployeeAllocationItem {
  id?: string;
  budgetLineId: string;
  percentage: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  justification?: string;
  budgetLine?: {
    code: string;
    description: string;
    project?: {
      code: string;
      name: string;
    };
    grant?: {
      grantNumber: string;
      funder?: {
        code: string;
        name: string;
      };
    };
  };
}

export interface EmployeeAllocationResponse {
  employeeId: string;
  asOfDate: string;
  totalPercentage: number;
  isBalanced: boolean;
  allocations: EmployeeAllocationItem[];
}

export const projectFundingService = {
  // Funders
  async listFunders(params?: any): Promise<Funder[]> {
    const res = await api.get("/projects/funders", { params });
    return res.data?.data?.funders || [];
  },

  async createFunder(data: Partial<Funder>): Promise<Funder> {
    const res = await api.post("/projects/funders", data);
    return res.data?.data?.funder;
  },

  // Projects
  async listProjects(params?: any): Promise<Project[]> {
    const res = await api.get("/projects", { params });
    return res.data?.data?.projects || [];
  },

  async getProjectById(id: string): Promise<Project> {
    const res = await api.get(`/projects/${id}`);
    return res.data?.data?.project;
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const res = await api.post("/projects", data);
    return res.data?.data?.project;
  },

  // Employee Allocations (LOE)
  async getEmployeeAllocations(employeeId: string, date?: string): Promise<EmployeeAllocationResponse> {
    const res = await api.get(`/projects/allocations/employee/${employeeId}`, {
      params: { date },
    });
    return res.data?.data;
  },

  async setEmployeeAllocations(
    employeeId: string,
    allocations: { budgetLineId: string; percentage: number }[],
    options?: { effectiveFrom?: string; effectiveTo?: string; justification?: string }
  ): Promise<any> {
    const res = await api.put(`/projects/allocations/employee/${employeeId}`, {
      allocations,
      ...options,
    });
    return res.data?.data;
  },

  async getProjectStaffReport(projectId: string): Promise<any> {
    const res = await api.get(`/projects/${projectId}/staff`);
    return res.data?.data;
  },
};
