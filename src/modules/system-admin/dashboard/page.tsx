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
} from "lucide-react";
import { useNavigate } from "react-router";

export default function SystemAdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Branches",
      value: "8",
      change: "+2",
      icon: Building,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "System Health",
      value: "98%",
      change: "+0.5%",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Pending Approvals",
      value: "23",
      change: "-5",
      icon: UserCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

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

  const recentActivities = [
    {
      id: 1,
      user: "John Doe",
      action: "created new user",
      target: "Jane Smith",
      time: "2 hours ago",
      type: "success",
    },
    {
      id: 2,
      user: "Admin",
      action: "updated system settings",
      target: "Email Configuration",
      time: "4 hours ago",
      type: "info",
    },
    {
      id: 3,
      user: "System",
      action: "detected unusual activity",
      target: "Multiple login attempts",
      time: "6 hours ago",
      type: "warning",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              System Administration
            </h1>
            <p className="text-gray-600">
              Manage system-wide settings and user administration
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm">
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={action.action}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
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
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
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
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.action}{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
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
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-gray-600">PostgreSQL</p>
                </div>
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">API Server</p>
                  <p className="text-sm text-gray-600">Response: 45ms</p>
                </div>
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Storage</p>
                  <p className="text-sm text-gray-600">45% used</p>
                </div>
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  Good
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
