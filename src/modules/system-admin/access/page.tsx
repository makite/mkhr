import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Action } from "@/components/shared/table-data";
import { FormDialog, type FormField } from "@/components/shared/form-dialog";
import { Pencil, Trash2 } from "lucide-react";

type Permission = {
  id: string;
  name: string;
  code: string;
  module: string;
  description?: string | null;
};

type RoleModel = {
  id: string;
  name: string;
  description?: string | null;
  permissions: Permission[];
  userCount?: number;
};

type UserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
};

export default function AccessManagementPage() {
  const { toast } = useToast();

  const [loadingPerms, setLoadingPerms] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roles, setRoles] = useState<RoleModel[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);

  // dialogs
  const [permDialogOpen, setPermDialogOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  const [permForm, setPermForm] = useState({
    name: "",
    code: "",
    module: "",
    description: "",
  });

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleModel | null>(null);
  const [rolePerms, setRolePerms] = useState<string[]>([]);

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [userDirectPerms, setUserDirectPerms] = useState<string[]>([]);

  const permissionOptions = useMemo(
    () =>
      permissions.map((p) => ({
        value: p.id,
        label: `${p.module} · ${p.name}`,
      })),
    [permissions],
  );

  const fetchPermissions = async () => {
    try {
      setLoadingPerms(true);
      const res = await api.get<{ permissions: Permission[] }>("/permission");
      setPermissions(res.data.permissions || []);
    } catch (e) {
      toast({
        title: "Error",
        description: (e as { message?: string })?.message || "Failed to load permissions",
        variant: "destructive",
      });
    } finally {
      setLoadingPerms(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const res = await api.get<{ roles: RoleModel[] }>("/role");
      setRoles(res.data.roles || []);
    } catch (e) {
      toast({
        title: "Error",
        description: (e as { message?: string })?.message || "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await api.get<{ data: UserRow[] }>("/user?limit=100");
      // user list endpoint is paginated; api wrapper returns body, so use res.data
      const list = (res as any).data || (res as any).data?.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      toast({
        title: "Error",
        description: (e as { message?: string })?.message || "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchRoles();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Permissions UI
  const permFields: FormField[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "code", label: "Code", type: "text", required: true, disabled: !!editingPerm },
    { name: "module", label: "Module", type: "text", required: true, disabled: !!editingPerm },
    { name: "description", label: "Description", type: "textarea" },
  ];

  const permColumns = [
    {
      id: "code",
      header: "Code",
      accessorFn: (r: Permission) => r.code,
      cell: ({ row }: any) => (
        <Badge variant="outline" className="font-mono">
          {row.original.code}
        </Badge>
      ),
    },
    {
      id: "name",
      header: "Name",
      accessorFn: (r: Permission) => r.name,
    },
    {
      id: "module",
      header: "Module",
      accessorFn: (r: Permission) => r.module,
      cell: ({ row }: any) => <Badge variant="secondary">{row.original.module}</Badge>,
    },
  ];

  const permActions: Action<Permission>[] = [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (p) => {
        setEditingPerm(p);
        setPermForm({
          name: p.name,
          code: p.code,
          module: p.module,
          description: p.description || "",
        });
        setPermDialogOpen(true);
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive",
      onClick: async (p) => {
        if (!confirm(`Delete permission ${p.code}?`)) return;
        try {
          await api.delete(`/permission/${p.id}`);
          toast({ title: "Success", description: "Permission deleted" });
          fetchPermissions();
        } catch (e) {
          toast({
            title: "Error",
            description: (e as { message?: string })?.message || "Failed to delete permission",
            variant: "destructive",
          });
        }
      },
    },
  ];

  const savePermission = async () => {
    try {
      if (editingPerm) {
        await api.put(`/permission/${editingPerm.id}`, {
          name: permForm.name,
          description: permForm.description,
        });
      } else {
        await api.post("/permission", {
          name: permForm.name,
          code: permForm.code,
          module: permForm.module,
          description: permForm.description,
        });
      }
      setPermDialogOpen(false);
      setEditingPerm(null);
      setPermForm({ name: "", code: "", module: "", description: "" });
      toast({ title: "Success", description: "Permission saved" });
      fetchPermissions();
    } catch (e) {
      toast({
        title: "Error",
        description: (e as { message?: string })?.message || "Failed to save permission",
        variant: "destructive",
      });
    }
  };

  // Roles -> permissions
  const roleFields: FormField[] = [
    {
      name: "permissions",
      label: "Permissions",
      type: "multiselect",
      placeholder: "Search permissions...",
      options: permissionOptions,
    },
  ];

  const roleColumns = [
    {
      id: "name",
      header: "Role",
      accessorFn: (r: RoleModel) => r.name,
      cell: ({ row }: any) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      id: "count",
      header: "Permissions",
      accessorFn: (r: RoleModel) => r.permissions?.length || 0,
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.original.permissions?.length || 0}</Badge>
      ),
    },
  ];

  const roleActions: Action<RoleModel>[] = [
    {
      label: "Manage permissions",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (r) => {
        setEditingRole(r);
        setRolePerms((r.permissions || []).map((p) => p.id));
        setRoleDialogOpen(true);
      },
    },
  ];

  const saveRolePerms = async () => {
    if (!editingRole) return;
    try {
      await api.post(`/role/${editingRole.id}/permissions`, {
        permissions: rolePerms,
      });
      toast({ title: "Success", description: "Role permissions updated" });
      setRoleDialogOpen(false);
      setEditingRole(null);
      fetchRoles();
    } catch (e) {
      toast({
        title: "Error",
        description: (e as { message?: string })?.message || "Failed to update role permissions",
        variant: "destructive",
      });
    }
  };

  // Users -> direct permissions
  const userColumns = [
    {
      id: "name",
      header: "User",
      accessorFn: (u: UserRow) => u.email,
      cell: ({ row }: any) => (
        <div className="space-y-1">
          <div className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      accessorFn: (u: UserRow) => u.role,
      cell: ({ row }: any) => <Badge variant="secondary">{row.original.role}</Badge>,
    },
    {
      id: "active",
      header: "Active",
      accessorFn: (u: UserRow) => u.isActive,
      cell: ({ row }: any) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const userActions: Action<UserRow>[] = [
    {
      label: "Direct permissions",
      icon: <Pencil className="h-4 w-4" />,
      onClick: async (u) => {
        setEditingUser(u);
        try {
          const res = await api.get<{
            directPermissions: { permissionId: string; granted: boolean }[];
          }>(`/user/${u.id}/permissions`);
          const granted = (res.data.directPermissions || [])
            .filter((p) => p.granted)
            .map((p) => p.permissionId);
          setUserDirectPerms(granted);
        } catch {
          setUserDirectPerms([]);
        }
        setUserDialogOpen(true);
      },
    },
  ];

  const userPermFields: FormField[] = [
    {
      name: "directPermissions",
      label: "Direct permissions (granted)",
      type: "multiselect",
      placeholder: "Search permissions...",
      options: permissionOptions,
    },
  ];

  const saveUserPerms = async () => {
    if (!editingUser) return;
    try {
      const payload = permissions.map((p) => ({
        permissionId: p.id,
        granted: userDirectPerms.includes(p.id),
      }));
      await api.post(`/user/${editingUser.id}/permissions`, { permissions: payload });
      toast({ title: "Success", description: "User permissions updated" });
      setUserDialogOpen(false);
      setEditingUser(null);
    } catch (e) {
      toast({
        title: "Error",
        description: (e as { message?: string })?.message || "Failed to update user permissions",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Access Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage permissions, role permissions, and user direct permissions.
        </p>
      </div>

      <Tabs defaultValue="permissions">
        <TabsList>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="roles">Role access</TabsTrigger>
          <TabsTrigger value="users">User access</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions">
          <DataTable
            data={permissions}
            columns={permColumns as any}
            loading={loadingPerms}
            title="Permissions"
            description="Create and manage permission codes used by the API and menu access."
            onRefresh={fetchPermissions}
            onAdd={() => {
              setEditingPerm(null);
              setPermForm({ name: "", code: "", module: "", description: "" });
              setPermDialogOpen(true);
            }}
            actions={permActions}
            searchPlaceholder="Search permissions..."
          />

          <FormDialog
            open={permDialogOpen}
            onOpenChange={setPermDialogOpen}
            title={editingPerm ? "Edit Permission" : "Add Permission"}
            fields={permFields}
            values={permForm}
            onChange={(name, value) => setPermForm((p) => ({ ...p, [name]: value }))}
            onSubmit={savePermission}
            isEditing={!!editingPerm}
            size="lg"
          />
        </TabsContent>

        <TabsContent value="roles">
          <DataTable
            data={roles}
            columns={roleColumns as any}
            loading={loadingRoles}
            title="Role access"
            description="Assign permissions to roles."
            onRefresh={fetchRoles}
            actions={roleActions}
            searchPlaceholder="Search roles..."
          />

          <FormDialog
            open={roleDialogOpen}
            onOpenChange={setRoleDialogOpen}
            title={`Role permissions${editingRole ? `: ${editingRole.name}` : ""}`}
            fields={roleFields}
            values={{ permissions: rolePerms }}
            onChange={(name, value) => {
              if (name === "permissions") setRolePerms(value as string[]);
            }}
            onSubmit={saveRolePerms}
            isEditing
            size="xl"
          />
        </TabsContent>

        <TabsContent value="users">
          <DataTable
            data={users}
            columns={userColumns as any}
            loading={loadingUsers}
            title="User access"
            description="Grant/revoke direct permissions for a user."
            onRefresh={fetchUsers}
            actions={userActions}
            searchPlaceholder="Search users..."
          />

          <FormDialog
            open={userDialogOpen}
            onOpenChange={setUserDialogOpen}
            title={`User permissions${editingUser ? `: ${editingUser.email}` : ""}`}
            fields={userPermFields}
            values={{ directPermissions: userDirectPerms }}
            onChange={(name, value) => {
              if (name === "directPermissions") setUserDirectPerms(value as string[]);
            }}
            onSubmit={saveUserPerms}
            isEditing
            size="xl"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

