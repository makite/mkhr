/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Shield,
  MoreHorizontal,
  Users,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type Action } from "@/components/shared/table-data";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Array<{ id: string; name: string; code: string }>;
  userCount?: number;
  createdAt: string;
}

interface RolesResponse {
  success: boolean;
  data: {
    roles: Role[];
  };
}

const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

export default function RolesPage() {
  const { toast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  const roleForm = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get("/role");
      setData(response.data.roles || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    roleForm.reset({ name: "", description: "" });
    setIsDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    roleForm.reset({
      name: role.name,
      description: role.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;
    setDialogLoading(true);
    try {
      await api.delete(`/role/${selectedRole.id}`);
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      fetchRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete role",
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const handleSubmit = async (values: RoleFormValues) => {
    setDialogLoading(true);
    try {
      if (selectedRole) {
        await api.put(`/role/${selectedRole.id}`, values);
        toast({
          title: "Success",
          description: "Role updated successfully",
        });
      } else {
        await api.post("/role", values);
        toast({
          title: "Success",
          description: "Role created successfully",
        });
      }
      setIsDialogOpen(false);
      fetchRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          `Failed to ${selectedRole ? "update" : "create"} role`,
        variant: "destructive",
      });
    } finally {
      setDialogLoading(false);
    }
  };

  const columns: ColumnDef<Role>[] = [
    {
      id: "name",
      header: "Role Name",
      accessorFn: (row) => row.name,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      accessorFn: (row) => row.description,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.description || "-"}
        </span>
      ),
    },
    {
      id: "users",
      header: "Users",
      accessorFn: (row) => row.userCount,
      cell: ({ row }) => (
        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
          <Users className="h-3 w-3" />
          {row.original.userCount || 0}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const actions: Action<Role>[] = [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item) => handleEditRole(item),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item) => handleDeleteClick(item),
      variant: "destructive",
      show: (item) => !["SUPER_ADMIN", "ADMIN", "EMPLOYEE"].includes(item.name),
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchRoles}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreateRole}>
            <Plus className="mr-2 h-4 w-4" />
            New Role
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data}
            columns={columns}
            loading={loading}
            actions={actions}
            onRefresh={fetchRoles}
            searchPlaceholder="Search roles..."
          />
        </CardContent>
      </Card>

      {/* Create/Edit Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "Edit Role" : "Create New Role"}
            </DialogTitle>
            <DialogDescription>
              {selectedRole
                ? "Update role information below."
                : "Enter the details for the new role."}
            </DialogDescription>
          </DialogHeader>
          <Form {...roleForm}>
            <form
              onSubmit={roleForm.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={roleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MANAGER" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Role description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={dialogLoading}>
                  {dialogLoading
                    ? "Saving..."
                    : selectedRole
                      ? "Update"
                      : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "{selectedRole?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
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
