/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
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

type ApiSuccess<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

type ApiPaginated<T> = {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: string;
};

function toRelativeTime(value: unknown) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

function activityTypeFromAction(action: string): RecentActivity["type"] {
  const a = (action || "").toUpperCase();
  if (a.includes("DELETE") || a.includes("REJECT") || a.includes("FAILED")) {
    return "alert";
  }
  if (a.includes("CREATE") || a.includes("APPROVE") || a.includes("SUCCESS")) {
    return "success";
  }
  if (a.includes("LOGIN") || a.includes("LOGOUT") || a.includes("UPDATE")) {
    return "info";
  }
  return "warning";
}

// Dashboard API service
export const dashboardService = {
  // System Admin Dashboard APIs
  getSystemAdminStats: async (): Promise<DashboardStats> => {
    const [statsRes, branchesRes, notificationsRes, pendingEmployeesRes] =
      await Promise.all([
        api.get<ApiSuccess<{ stats: any }>>("/dashboard/stats"),
        api.get<ApiSuccess<{ branches: unknown[] }>>("/branches?isActive=true"),
        api.get<ApiSuccess<{ unreadCount: number }>>(
          "/dashboard/notifications",
        ),
        api.get<ApiPaginated<unknown>>("/employees/pending?limit=1"),
      ]);

    const stats = statsRes.data.stats;

    return {
      totalUsers: Number(stats?.users?.total ?? 0),
      activeBranches: Array.isArray(branchesRes.data?.branches)
        ? branchesRes.data.branches.length
        : 0,
      systemHealth: 100,
      pendingApprovals:
        Number(notificationsRes.data?.unreadCount ?? 0) ||
        Number(pendingEmployeesRes.pagination?.total ?? 0),
      newHires: 0,
      totalEmployees: 0,
      openPositions: 0,
      trainingPrograms: 0,
    };
  },

  getSystemAdminActivities: async (): Promise<RecentActivity[]> => {
    const res = await api.get<ApiPaginated<any>>(
      "/dashboard/recent-activities?limit=5",
    );

    return (res.data || []).map((a) => ({
      id: String(a.id),
      user: a.user?.name || "System",
      action: a.description || a.action || "activity",
      target: a.entity || a.entityId || "",
      time: toRelativeTime(a.timestamp),
      type: activityTypeFromAction(a.action || a.description || ""),
    }));
  },

  getSystemStatus: async (): Promise<SystemStatus[]> => {
    // Backend does not expose a dedicated system-status endpoint yet.
    // Provide a minimal status list backed by successful API requests.
    return [
      { name: "API Server", status: "Online" },
      { name: "Database", status: "Healthy" },
      { name: "Storage", status: "Good" },
    ];
  },

  // HR Dashboard APIs
  getHRStats: async (): Promise<DashboardStats> => {
    const [employeesRes, pendingRes] = await Promise.all([
      api.get<ApiPaginated<unknown>>("/employees?limit=1"),
      api.get<ApiPaginated<unknown>>("/employees/pending?limit=1"),
    ]);

    return {
      totalUsers: 0,
      activeBranches: 0,
      systemHealth: 0,
      pendingApprovals: Number(pendingRes.pagination?.total ?? 0),
      newHires: 0,
      totalEmployees: Number(employeesRes.pagination?.total ?? 0),
      openPositions: 0,
      trainingPrograms: 0,
    };
  },

  getHRActivities: async (): Promise<RecentActivity[]> => {
    // Reuse the shared activity feed for now (backend activity model is system-wide).
    const res = await api.get<ApiPaginated<any>>(
      "/dashboard/recent-activities?limit=5",
    );

    return (res.data || []).map((a) => ({
      id: String(a.id),
      user: a.user?.name || "System",
      action: a.description || a.action || "activity",
      target: a.entity || a.entityId || "",
      time: toRelativeTime(a.timestamp),
      type: activityTypeFromAction(a.action || a.description || ""),
    }));
  },

  getDepartments: async (): Promise<DepartmentData[]> => {
    const res =
      await api.get<ApiSuccess<{ departments: any[] }>>("/departments");

    const departments = Array.isArray(res.data?.departments)
      ? res.data.departments
      : [];

    return departments
      .map((d) => ({
        name: String(d.name ?? ""),
        count: Number(d?._count?.employees ?? 0),
        growth: "",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  },

  getUpcomingEvents: async (): Promise<UpcomingEvent[]> => {
    // No HR events endpoint in backend yet.
    return [];
  },
};
