import { useQuery } from "@tanstack/react-query";
import {
  dashboardService,
  type DashboardStats,
  type RecentActivity,
  type DepartmentData,
  type SystemStatus,
  type UpcomingEvent,
} from "../services/dashboard-service";
import { queryKeys } from "@/lib/query-keys";
import { CACHE_POLICIES } from "@/lib/query-client";

interface DashboardDataState {
  stats: DashboardStats;
  activities: RecentActivity[];
  departments: DepartmentData[];
  systemStatus: SystemStatus[];
  upcomingEvents: UpcomingEvent[];
}

const getMockData = (type: "system-admin" | "hr"): DashboardDataState => {
  if (type === "system-admin") {
    return {
      stats: {
        totalUsers: 1234,
        activeBranches: 8,
        systemHealth: 98,
        pendingApprovals: 23,
        newHires: 0,
        totalEmployees: 0,
        openPositions: 0,
        trainingPrograms: 0,
      },
      activities: [
        {
          id: "1",
          user: "John Doe",
          action: "created new user",
          target: "Jane Smith",
          time: "2 hours ago",
          type: "success",
        },
        {
          id: "2",
          user: "Admin",
          action: "updated system settings",
          target: "Email Configuration",
          time: "4 hours ago",
          type: "info",
        },
        {
          id: "3",
          user: "System",
          action: "detected unusual activity",
          target: "Multiple login attempts",
          time: "6 hours ago",
          type: "warning",
        },
      ],
      systemStatus: [
        { name: "Database", status: "Healthy", responseTime: "45ms" },
        { name: "API Server", status: "Online", responseTime: "45ms" },
        { name: "Storage", status: "Good", usage: "45%" },
      ],
      departments: [],
      upcomingEvents: [],
    };
  }

  return {
    stats: {
      totalUsers: 0,
      activeBranches: 0,
      systemHealth: 0,
      pendingApprovals: 23,
      newHires: 24,
      totalEmployees: 856,
      openPositions: 12,
      trainingPrograms: 18,
    },
    activities: [
      {
        id: "1",
        user: "Sarah Johnson",
        action: "submitted leave request",
        target: "Annual Leave - 5 days",
        time: "1 hour ago",
        type: "warning",
      },
      {
        id: "2",
        user: "Mike Chen",
        action: "completed training",
        target: "Leadership Development",
        time: "3 hours ago",
        type: "success",
      },
      {
        id: "3",
        user: "HR System",
        action: "contract ending soon",
        target: "John Doe - 15 days",
        time: "5 hours ago",
        type: "alert",
      },
      {
        id: "4",
        user: "Emily Davis",
        action: "profile updated",
        target: "Contact information",
        time: "1 day ago",
        type: "info",
      },
    ],
    departments: [
      { name: "Engineering", count: 245, growth: "+8%" },
      { name: "Sales", count: 156, growth: "+12%" },
      { name: "Marketing", count: 89, growth: "+5%" },
      { name: "Operations", count: 366, growth: "+3%" },
    ],
    upcomingEvents: [
      {
        id: "1",
        title: "Performance Review Cycle",
        date: "Dec 15, 2024",
        type: "review",
        participants: "All Employees",
      },
      {
        id: "2",
        title: "Team Building Workshop",
        date: "Dec 20, 2024",
        type: "training",
        participants: "Department Heads",
      },
      {
        id: "3",
        title: "Policy Update Meeting",
        date: "Dec 22, 2024",
        type: "meeting",
        participants: "HR Team",
      },
    ],
    systemStatus: [],
  };
};

/**
 * Enterprise dashboard data hook backed by TanStack Query.
 * - Stale time: 60s
 * - Background auto-refresh interval: 2 minutes for real-time ERP metrics.
 * - Seamless cache reuse when navigating between tabs.
 */
export const useDashboardData = (dashboardType: "system-admin" | "hr") => {
  const { data, isLoading, isFetching, refetch } = useQuery<DashboardDataState>({
    queryKey: queryKeys.dashboard.stats(dashboardType),
    queryFn: async () => {
      try {
        if (dashboardType === "system-admin") {
          const [statsData, activitiesData, statusData] = await Promise.all([
            dashboardService.getSystemAdminStats(),
            dashboardService.getSystemAdminActivities(),
            dashboardService.getSystemStatus(),
          ]);

          return {
            stats: statsData,
            activities: activitiesData,
            systemStatus: statusData,
            departments: [],
            upcomingEvents: [],
          };
        } else {
          const [statsData, activitiesData, departmentsData, eventsData] =
            await Promise.all([
              dashboardService.getHRStats(),
              dashboardService.getHRActivities(),
              dashboardService.getDepartments(),
              dashboardService.getUpcomingEvents(),
            ]);

          return {
            stats: statsData,
            activities: activitiesData,
            departments: departmentsData,
            upcomingEvents: eventsData,
            systemStatus: [],
          };
        }
      } catch (error) {
        console.warn("API unavailable, serving fallback dashboard state:", error);
        return getMockData(dashboardType);
      }
    },
    ...CACHE_POLICIES.DASHBOARD_DATA,
  });

  const resolved = data || getMockData(dashboardType);

  return {
    loading: isLoading,
    isFetching,
    stats: resolved.stats,
    activities: resolved.activities,
    departments: resolved.departments,
    systemStatus: resolved.systemStatus,
    upcomingEvents: resolved.upcomingEvents,
    refetch,
  };
};
