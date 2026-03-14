import api from "@/lib/api";
// Types for dashboard data
export interface DashboardStats {
  totalUsers: number;
  activeBranches: number;
  systemHealth: number;
  pendingApprovals: number;
  newHires: number;
  totalEmployees: number;
  openPositions: number;
  trainingPrograms: number;
}

export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: "success" | "warning" | "info" | "alert";
}

export interface DepartmentData {
  name: string;
  count: number;
  growth: string;
}

export interface SystemStatus {
  name: string;
  status: string;
  responseTime?: string;
  usage?: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  participants: string;
}

// Dashboard API service
export const dashboardService = {
  // System Admin Dashboard APIs
  getSystemAdminStats: async (): Promise<DashboardStats> => {
    const response = await api.get("/dashboard/system-admin/stats");
    return response.data;
  },

  getSystemAdminActivities: async (): Promise<RecentActivity[]> => {
    const response = await api.get("/dashboard/system-admin/activities");
    return response.data;
  },

  getSystemStatus: async (): Promise<SystemStatus[]> => {
    const response = await api.get("/dashboard/system-admin/status");
    return response.data;
  },

  // HR Dashboard APIs
  getHRStats: async (): Promise<DashboardStats> => {
    const response = await api.get("/dashboard/hr/stats");
    return response.data;
  },

  getHRActivities: async (): Promise<RecentActivity[]> => {
    const response = await api.get("/dashboard/hr/activities");
    return response.data;
  },

  getDepartments: async (): Promise<DepartmentData[]> => {
    const response = await api.get("/dashboard/hr/departments");
    return response.data;
  },

  getUpcomingEvents: async (): Promise<UpcomingEvent[]> => {
    const response = await api.get("/dashboard/hr/events");
    return response.data;
  },
};
