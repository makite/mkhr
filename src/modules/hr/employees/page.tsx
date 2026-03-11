/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Pencil,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  UserPlus,
  Ban,
  CheckCheck,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, type Action } from "@/components/shared/table-data";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullNameAm?: string;
  requestStatus: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  positionRef?: {
    id: string;
    name: string;
    code: string;
  };
  grade?: {
    id: string;
    name: string;
    level: number;
  };
  scale?: {
    id: string;
    name: string;
    stepNumber: number;
  };
  branch?: {
    id: string;
    name: string;
    code: string;
  };
  department?: {
    id: string;
    name: string;
    code: string;
  };
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: string;
}

const getStatusBadge = (status: string) => {
  const statusMap: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      icon: any;
    }
  > = {
    DRAFT: {
      label: "Draft",
      variant: "secondary",
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    PENDING: {
      label: "Pending",
      variant: "outline",
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
    },
    APPROVED: {
      label: "Approved",
      variant: "default",
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
    },
    REJECTED: {
      label: "Rejected",
      variant: "destructive",
      icon: <XCircle className="h-3 w-3 mr-1" />,
    },
    CANCELLED: {
      label: "Cancelled",
      variant: "outline",
      icon: <Ban className="h-3 w-3 mr-1" />,
    },
  };
  return statusMap[status] || statusMap.DRAFT;
};

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    department: "",
  });

  const columns: ColumnDef<Employee>[] = [
    {
      id: "employee",
      header: "Employee",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {row.original.firstName?.[0] || "?"}
              {row.original.lastName?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">
              {row.original.firstName} {row.original.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.employeeId}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "position",
      header: "Position",
      accessorFn: (row) => row.positionRef?.name,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.original.positionRef?.name || "-"}</span>
          {row.original.grade && (
            <span className="text-xs text-muted-foreground">
              {row.original.grade.name} (Level {row.original.grade.level})
            </span>
          )}
        </div>
      ),
    },
    {
      id: "branch",
      header: "Branch",
      accessorFn: (row) => row.branch?.name,
      cell: ({ row }) => <span>{row.original.branch?.name || "-"}</span>,
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => row.requestStatus,
      cell: ({ row }) => {
        const status = getStatusBadge(row.original.requestStatus);
        return (
          <Badge variant={status.variant} className="flex items-center w-fit">
            {status.icon}
            {status.label}
          </Badge>
        );
      },
    },
    {
      id: "createdAt",
      header: "Created",
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
        </span>
      ),
    },
  ];

  // Persist a rotation context so the detail page can navigate prev/next within the current list
  const openDetailWithRotation = (selected: Employee, list: Employee[]) => {
    try {
      const ids = list.map((e) => e.id);
      const index = Math.max(0, ids.indexOf(selected.id));
      sessionStorage.setItem(
        "employeeRotation",
        JSON.stringify({ ids, index, ts: Date.now() }),
      );
    } catch {
      // ignore storage errors
    }
    navigate(`/employees/${selected.id}`);
  };

  const createActions = (list: Employee[]): Action<Employee>[] => [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => openDetailWithRotation(item, list),
    },
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item) => navigate(`/employees/${item.id}/edit`),
      show: (item) =>
        item.requestStatus === "DRAFT" || item.requestStatus === "PENDING",
    },
    {
      label: "Approve",
      icon: <CheckCheck className="h-4 w-4" />,
      onClick: async (item) => {
        if (confirm(`Approve employee ${item.firstName} ${item.lastName}?`)) {
          try {
            await api.put(`/employees/${item.id}/approve`, {});
            toast({
              title: "Success",
              description: "Employee approved successfully",
            });
            fetchData();
          } catch (error: any) {
            toast({
              title: "Error",
              description:
                error.response?.data?.message || "Failed to approve",
              variant: "destructive",
            });
          }
        }
      },
      variant: "success",
      show: (item) => item.requestStatus === "PENDING",
    },
    {
      label: "Reject",
      icon: <XCircle className="h-4 w-4" />,
      onClick: async (item) => {
        const reason = prompt("Please enter rejection reason:");
        if (reason !== null) {
          try {
            await api.put(`/employees/${item.id}/reject`, { reason });
            toast({
              title: "Success",
              description: "Employee rejected",
            });
            fetchData();
          } catch (error: any) {
            toast({
              title: "Error",
              description:
                error.response?.data?.message || "Failed to reject",
              variant: "destructive",
            });
          }
        }
      },
      variant: "destructive",
      show: (item) => item.requestStatus === "PENDING",
    },
  ];

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.limit, filters.status]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.department && { departmentId: filters.department }),
      });

      const response: ApiResponse = await api.get(`/employees?${params}`);
      setData(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0,
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
    setTimeout(fetchData, 500);
  };

  const handleExport = () => {
    toast({
      title: "Info",
      description: "Export feature coming soon",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage employee records and approvals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => navigate("/hr/administration")}>
            <UserPlus className="mr-2 h-4 w-4" />
            New Employee
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search employees..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, status: value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
                fetchData();
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchData}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data.filter((e) => e.requestStatus === "PENDING").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.filter((e) => e.requestStatus === "APPROVED").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {data.filter((e) => e.requestStatus === "DRAFT").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Employees</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <DataTable
            data={data}
            columns={columns}
            loading={loading}
            actions={createActions(data)}
            onRefresh={fetchData}
            searchPlaceholder="Search employees..."
            showPagination={true}
            pageSize={pagination.limit}
            pageSizeOptions={[10, 20, 30, 50]}
            onRowClick={(item) => openDetailWithRotation(item, data)}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <DataTable
            data={data.filter((e) => e.requestStatus === "PENDING")}
            columns={columns}
            loading={loading}
            actions={createActions(
              data.filter((e) => e.requestStatus === "PENDING"),
            )}
            onRefresh={fetchData}
            searchPlaceholder="Search pending employees..."
            showPagination={true}
            pageSize={pagination.limit}
            onRowClick={(item) =>
              openDetailWithRotation(
                item,
                data.filter((e) => e.requestStatus === "PENDING"),
              )
            }
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <DataTable
            data={data.filter((e) => e.requestStatus === "APPROVED")}
            columns={columns}
            loading={loading}
            actions={createActions(
              data.filter((e) => e.requestStatus === "APPROVED"),
            ).filter((a) => a.label !== "Approve" && a.label !== "Reject")}
            onRefresh={fetchData}
            searchPlaceholder="Search approved employees..."
            showPagination={true}
            pageSize={pagination.limit}
            onRowClick={(item) =>
              openDetailWithRotation(
                item,
                data.filter((e) => e.requestStatus === "APPROVED"),
              )
            }
          />
        </TabsContent>

        <TabsContent value="draft" className="mt-4">
          <DataTable
            data={data.filter((e) => e.requestStatus === "DRAFT")}
            columns={columns}
            loading={loading}
            actions={createActions(
              data.filter((e) => e.requestStatus === "DRAFT"),
            )}
            onRefresh={fetchData}
            searchPlaceholder="Search drafts..."
            showPagination={true}
            pageSize={pagination.limit}
            onRowClick={(item) =>
              openDetailWithRotation(
                item,
                data.filter((e) => e.requestStatus === "DRAFT"),
              )
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
