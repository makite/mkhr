/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  UserPlus,
  Pencil,
  Trash2,
  Eye,
  Shield,
  Power,
  PowerOff,
  Filter,
  Search,
  RefreshCw,
  Download,
} from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DataTable, type Action } from "@/components/shared/table-data";
import { useUserManagement } from "./user-management";
import { RoleBadge } from "./component/user-role-badge";

const userFormSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters").optional(),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  phone: z.string().optional(),
  role: z.string().min(1, "Required"),
  isActive: z.boolean().default(true),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UsersPage() {
  const navigate = useNavigate();
  const {
    users,
    roles,
    systemRoles,
    loading,
    dialogLoading,
    pagination,
    filters,
    selectedUser,
    selectedRoleId,
    isUserDialogOpen,
    isRoleDialogOpen,
    isDeleteDialogOpen,
    setIsUserDialogOpen,
    setIsRoleDialogOpen,
    setIsDeleteDialogOpen,
    setSelectedRoleId,
    handleSearch,
    handleRoleChange,
    handleStatusChange,
    handleCreateUser,
    handleEditUser,
    handleAssignRole,
    handleToggleStatus,
    handleDeleteClick,
    handleDeleteConfirm,
    handleUserSubmit,
    handleRoleAssign,
    refresh,
  } = useUserManagement();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema) as any,
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "EMPLOYEE",
      isActive: true,
    },
  });

  const columns = [
    {
      id: "user",
      header: "User",
      accessorFn: (row: any) => `${row.firstName} ${row.lastName}`,
      cell: ({ row }: any) => (
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
              {row.original.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      accessorFn: (row: any) => row.role,
      cell: ({ row }: any) => <RoleBadge role={row.original.role} />,
    },
    {
      id: "contact",
      header: "Contact",
      accessorFn: (row: any) => row.phone,
      cell: ({ row }: any) => (
        <span className="text-sm">{row.original.phone || "No phone"}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row: any) => row.isActive,
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={row.original.isActive ? "default" : "destructive"}
            className="capitalize"
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
          {row.original.emailVerified && (
            <Badge variant="outline">Verified</Badge>
          )}
        </div>
      ),
    },
    {
      id: "lastLogin",
      header: "Last Login",
      accessorFn: (row: any) => row.lastLogin,
      cell: ({ row }: any) => (
        <span className="text-sm text-muted-foreground">
          {row.original.lastLogin
            ? format(new Date(row.original.lastLogin), "MMM dd, yyyy")
            : "Never"}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      accessorFn: (row: any) => row.createdAt,
      cell: ({ row }: any) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
        </span>
      ),
    },
  ];

  const actions: Action<any>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => navigate(`/system-admin/users/${item.id}`),
    },
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item) => {
        handleEditUser(item);
        form.reset(item);
      },
    },
    {
      label: "Assign Role",
      icon: <Shield className="h-4 w-4" />,
      onClick: (item) => handleAssignRole(item),
    },
    {
      label: (item) => (item.isActive ? "Deactivate" : "Activate"),
      icon: (item) =>
        item.isActive ? (
          <PowerOff className="h-4 w-4" />
        ) : (
          <Power className="h-4 w-4" />
        ),
      onClick: (item) => handleToggleStatus(item),
      variant: (item) => (item.isActive ? "destructive" : "success"),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item) => handleDeleteClick(item),
      variant: "destructive",
      show: (item) => item.role !== "SUPER_ADMIN",
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleCreateUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            New User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {users.filter((u) => !u.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter((u) => u.emailVerified).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                defaultValue={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={filters.role} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {(systemRoles.length
                  ? systemRoles
                  : ["SUPER_ADMIN", "ADMIN", "MANAGER", "HR", "ACCOUNTANT", "EMPLOYEE"]
                ).map((r) => (
                  <SelectItem key={r} value={r}>
                    {String(r).replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={refresh}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        actions={actions}
        onRefresh={refresh}
        pageSize={pagination.limit}
        pageSizeOptions={[10, 20, 30, 50]}
        onRowClick={(item) => navigate(`/system-admin/users/${item.id}`)}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Edit User" : "New User"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUserSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!selectedUser && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(systemRoles.length
                          ? systemRoles
                          : ["SUPER_ADMIN", "ADMIN", "MANAGER", "HR", "ACCOUNTANT", "EMPLOYEE"]
                        ).map((r) => (
                          <SelectItem key={r} value={r}>
                            {String(r).replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsUserDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={dialogLoading}>
                  {dialogLoading
                    ? "Saving..."
                    : selectedUser
                      ? "Update"
                      : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role: any) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleAssign}
              disabled={!selectedRoleId || dialogLoading}
            >
              {dialogLoading ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Delete {selectedUser?.firstName} {selectedUser?.lastName}? This
            cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={dialogLoading}
            >
              {dialogLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
