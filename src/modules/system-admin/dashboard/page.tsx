import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building,
  Settings,
  TrendingUp,
  Calendar,
  UserCheck,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

export default function SystemAdminDashboard() {
  const navigate = useNavigate();
  const { loading, stats, activities, systemStatus } =
    useDashboardData("system-admin");

  const quickActions = [
    {
      title: "User Management",
      description: "Add, edit, and manage user accounts",
      icon: Users,
      action: () => navigate("/users"),
      color: "bg-blue-500",
    },
    {
      title: "Role Management",
      description: "Configure user roles and permissions",
      icon: Settings,
      action: () => navigate("/roles"),
      color: "bg-purple-500",
    },
    {
      title: "Company Settings",
      description: "Manage company profile and settings",
      icon: Building,
      action: () => navigate("/system-admin/company-profile"),
      color: "bg-green-500",
    },
    {
      title: "Branch Management",
      description: "Configure organizational branches",
      icon: Building,
      action: () => navigate("/system-admin/branches"),
      color: "bg-orange-500",
    },
  ];

  const systemStats = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Branches",
      value: stats.activeBranches.toString(),
      change: "+2",
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "System Health",
      value: `${stats.systemHealth}%`,
      change: "+0.5%",
      icon: Activity,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals.toString(),
      change: "-5",
      icon: UserCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
      case "online":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              System Administration
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Manage system-wide settings and user administration
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Calendar className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm" className="w-full sm:w-auto">
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {systemStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                      {loading ? <Skeleton className="h-8 w-20" /> : stat.value}
                    </p>
                    <p className="text-xs md:text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div
                    className={`p-2 md:p-3 rounded-full ${stat.bgColor} flex-shrink-0`}
                  >
                    <stat.icon
                      className={`h-4 w-4 md:h-6 md:w-6 ${stat.color}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={action.action}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${action.color} group-hover:scale-105 transition-transform`}
                      >
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {loading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))
                  : activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div
                          className={`p-1 rounded-full ${
                            activity.type === "success"
                              ? "bg-green-100"
                              : activity.type === "warning"
                                ? "bg-orange-100"
                                : "bg-blue-100"
                          }`}
                        >
                          {activity.type === "success" && (
                            <UserCheck className="w-4 h-4 text-green-600" />
                          )}
                          {activity.type === "warning" && (
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                          )}
                          {activity.type === "info" && (
                            <Settings className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user}</span>{" "}
                            {activity.action}{" "}
                            <span className="font-medium">
                              {activity.target}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {systemStatus.map((status, index) => {
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{status.name}</p>
                      <p className="text-sm text-gray-600">
                        {status.responseTime || status.usage}
                      </p>
                    </div>
                    <Badge
                      variant="default"
                      className={getStatusColor(status.status)}
                    >
                      {status.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
