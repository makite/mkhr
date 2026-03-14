import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Calendar,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Building,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

export default function HRDashboard() {
  const navigate = useNavigate();
  const { loading, stats, activities, departments, upcomingEvents } =
    useDashboardData("hr");

  const quickActions = [
    {
      title: "Add Employee",
      description: "Register a new employee",
      icon: UserPlus,
      action: () => navigate("/employees/new"),
      color: "bg-blue-500",
    },
    {
      title: "Manage Leave",
      description: "Review and approve leave requests",
      icon: Calendar,
      action: () => navigate("/hr-leave/manage"),
      color: "bg-green-500",
    },
    {
      title: "Employee List",
      description: "View and manage all employees",
      icon: Users,
      action: () => navigate("/employees"),
      color: "bg-purple-500",
    },
    {
      title: "Training",
      description: "Manage training programs",
      icon: GraduationCap,
      action: () => navigate("/hr-admin/training"),
      color: "bg-orange-500",
    },
  ];

  const hrStats = [
    {
      title: "Total Employees",
      value: stats.totalEmployees.toLocaleString(),
      change: "+5.2%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "New Hires",
      value: stats.newHires.toString(),
      change: "+8",
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Open Positions",
      value: stats.openPositions.toString(),
      change: "-3",
      icon: Briefcase,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Training Programs",
      value: stats.trainingPrograms.toString(),
      change: "+2",
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case "review":
        return FileText;
      case "training":
        return GraduationCap;
      case "meeting":
        return Users;
      default:
        return Calendar;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "warning":
        return Clock;
      case "alert":
        return AlertTriangle;
      default:
        return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              HR Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Manage human resources and employee administration
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button size="sm" className="w-full sm:w-auto">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {hrStats.map((stat, index) => (
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
                                : activity.type === "alert"
                                  ? "bg-red-100"
                                  : "bg-blue-100"
                          }`}
                        >
                          {(() => {
                            const Icon = getActivityIcon(activity.type);
                            return (
                              <Icon
                                className={`w-4 h-4 ${
                                  activity.type === "success"
                                    ? "text-green-600"
                                    : activity.type === "warning"
                                      ? "text-orange-600"
                                      : activity.type === "alert"
                                        ? "text-red-600"
                                        : "text-blue-600"
                                }`}
                              />
                            );
                          })()}
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

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <Skeleton className="h-5 w-5 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))
                : upcomingEvents.map((event) => {
                    const EventIcon = getEventIcon(event.type);
                    return (
                      <div key={event.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <EventIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {event.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {event.date}
                            </p>
                            <p className="text-xs text-gray-500">
                              {event.participants}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </CardContent>
        </Card>

        {/* Department Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Department Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <Skeleton className="h-5 w-5 mb-2" />
                      <Skeleton className="h-8 w-16 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  ))
                : departments.map((dept, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {dept.name}
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {dept.count}
                          </p>
                          <p className="text-sm text-green-600">
                            {dept.growth}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
