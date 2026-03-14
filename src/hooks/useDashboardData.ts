import { useState, useEffect } from "react";
import {
  dashboardService,
  type DashboardStats,
  type RecentActivity,
  type DepartmentData,
  type SystemStatus,
  type UpcomingEvent,
} from "../services/dashboard-service";
import { useToast } from "./use-toast";

export const useDashboardData = (dashboardType: "system-admin" | "hr") => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeBranches: 0,
    systemHealth: 0,
    pendingApprovals: 0,
    newHires: 0,
    totalEmployees: 0,
    openPositions: 0,
    trainingPrograms: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        if (dashboardType === "system-admin") {
          const [statsData, activitiesData, statusData] = await Promise.all([
            dashboardService.getSystemAdminStats(),
            dashboardService.getSystemAdminActivities(),
            dashboardService.getSystemStatus(),
          ]);

          setStats(statsData);
          setActivities(activitiesData);
          setSystemStatus(statusData);
        } else {
          const [statsData, activitiesData, departmentsData, eventsData] =
            await Promise.all([
              dashboardService.getHRStats(),
              dashboardService.getHRActivities(),
              dashboardService.getDepartments(),
              dashboardService.getUpcomingEvents(),
            ]);

          setStats(statsData);
          setActivities(activitiesData);
          setDepartments(departmentsData);
          setUpcomingEvents(eventsData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });

        // Set mock data as fallback
        setMockData(dashboardType);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dashboardType]);

  // Mock data fallback
  const setMockData = (type: "system-admin" | "hr") => {
    if (type === "system-admin") {
      setStats({
        totalUsers: 1234,
        activeBranches: 8,
        systemHealth: 98,
        pendingApprovals: 23,
        newHires: 0,
        totalEmployees: 0,
        openPositions: 0,
        trainingPrograms: 0,
      });
      setActivities([
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
      ]);
      setSystemStatus([
        {
          name: "Database",
          status: "Healthy",
          responseTime: "45ms",
        },
        {
          name: "API Server",
          status: "Online",
          responseTime: "45ms",
        },
        {
          name: "Storage",
          status: "Good",
          usage: "45%",
        },
      ]);
    } else {
      setStats({
        totalUsers: 0,
        activeBranches: 0,
        systemHealth: 0,
        pendingApprovals: 23,
        newHires: 24,
        totalEmployees: 856,
        openPositions: 12,
        trainingPrograms: 18,
      });
      setActivities([
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
      ]);
      setDepartments([
        { name: "Engineering", count: 245, growth: "+8%" },
        { name: "Sales", count: 156, growth: "+12%" },
        { name: "Marketing", count: 89, growth: "+5%" },
        { name: "Operations", count: 366, growth: "+3%" },
      ]);
      setUpcomingEvents([
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
      ]);
    }
  };

  return {
    loading,
    stats,
    activities,
    departments,
    systemStatus,
    upcomingEvents,
  };
};
