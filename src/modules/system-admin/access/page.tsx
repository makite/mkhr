import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Action } from "@/components/shared/table-data";
import { FormDialog, type FormField } from "@/components/shared/form-dialog";
import { Pencil, Trash2, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

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

type NavItem = {
  id: string;
  title: string;
  path: string;
  module?: string | null;
  roles?: string[] | null;
  permissions?: string[] | null; // permission codes
  isActive?: boolean;
  isVisible?: boolean;
  children?: NavItem[];
};

export default function AccessManagementPage() {
  const { toast } = useToast();

  const pickArray = <T,>(res: any, paths: string[]): T[] => {
    for (const p of paths) {
      const v = p
        .split(".")
        .reduce((acc: any, k) => (acc && typeof acc === "object" ? acc[k] : undefined), res);
      if (Array.isArray(v)) return v as T[];
    }
    return [];
  };

  const [loadingPerms, setLoadingPerms] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roles, setRoles] = useState<RoleModel[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);

  const [permUsageOpen, setPermUsageOpen] = useState(false);
  const [permUsageLoading, setPermUsageLoading] = useState(false);
  const [permUsage, setPermUsage] = useState<{
    permission: Permission | null;
    roles: { id: string; name: string; description?: string | null }[];
    users: { id: string; email: string; firstName?: string; lastName?: string }[];
  }>({ permission: null, roles: [], users: [] });

  const [loadingNav, setLoadingNav] = useState(true);
  const [navConfig, setNavConfig] = useState<NavItem[]>([]);

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

  const [newRoleDialogOpen, setNewRoleDialogOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({ name: "", description: "" });

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [userDirectPerms, setUserDirectPerms] = useState<string[]>([]);

  const [assignGroupOpen, setAssignGroupOpen] = useState(false);
  const [assignUser, setAssignUser] = useState<UserRow | null>(null);
  const [assignRoleId, setAssignRoleId] = useState<string>("");

  const [menuTabRoleId, setMenuTabRoleId] = useState<string>("");
  const menuRole = useMemo(
    () => roles.find((r) => r.id === menuTabRoleId) || null,
    [roles, menuTabRoleId],
  );

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
      setPermissions(
        pickArray<Permission>(res, [
          "data.permissions",
          "permissions",
          "data.data.permissions",
        ]),
      );
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
      setRoles(
        pickArray<RoleModel>(res, ["data.roles", "roles", "data.data.roles"]),
      );
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
      const list =
        (res as any)?.data?.users ||
        (res as any)?.users ||
        (res as any)?.data ||
        (res as any)?.data?.data ||
        [];
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
    fetchNavConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNavConfig = async () => {
    try {
      setLoadingNav(true);
      const res = await api.get<any>("/navigation/config");
      const items =
        pickArray<NavItem>(res, ["data.items", "items", "data.data.items"]) || [];
      setNavConfig(items);
    } catch (e) {
      setNavConfig([]);
      toast({
        title: "Error",
        description:
          (e as { message?: string })?.message || "Failed to load navigation config",
        variant: "destructive",
      });
    } finally {
      setLoadingNav(false);
    }
  };

  const flattenNav = (items: NavItem[]): NavItem[] => {
    const out: NavItem[] = [];
    const walk = (arr: NavItem[]) => {
      for (const it of arr || []) {
        out.push(it);
        if (Array.isArray(it.children) && it.children.length) walk(it.children);
      }
    };
    walk(items);
    return out;
  };

  const hrNavItems = useMemo(() => {
    const all = flattenNav(navConfig);
    return all.filter((n) => (n.module || "") === "hr" && n.isActive !== false && n.isVisible !== false);
  }, [navConfig]);

  const permByCode = useMemo(() => {
    const m = new Map<string, Permission>();
    for (const p of permissions) m.set(p.code, p);
    return m;
  }, [permissions]);

  const menuPermissionCode = (navId: string) => `nav:${navId}:view`;

  const ensureMenuPermission = async (nav: NavItem) => {
    const code = menuPermissionCode(nav.id);
    if (permByCode.has(code)) return code;
    // Create a permission for this menu item
    await api.post("/permission", {
      name: `Menu access: ${nav.title}`,
      code,
      module: "navigation",
      description: `Allows viewing menu item ${nav.title} (${nav.path})`,
    });
    await fetchPermissions();
    return code;
  };

  const patchNavPermissions = async (nav: NavItem, requiredCode: string) => {
    const existing = Array.isArray(nav.permissions) ? nav.permissions : [];
    if (existing.includes(requiredCode)) return;
    await api.put(`/navigation/items/${nav.id}`, {
      permissions: [...existing, requiredCode],
    });
    await fetchNavConfig();
  };

  const toggleMenuForGroup = async (nav: NavItem, enabled: boolean) => {
    if (!menuRole) return;
    try {
      const code = await ensureMenuPermission(nav);
      await patchNavPermissions(nav, code);
      const perm = permByCode.get(code) || null;
      if (!perm) {
        toast({
          title: "Error",
          description: "Permission created but not found after refresh",
          variant: "destructive",
        });
        return;
      }
      const currentIds = (menuRole.permissions || []).map((p) => p.id);
      const nextIds = enabled
        ? Array.from(new Set([...currentIds, perm.id]))
        : currentIds.filter((id) => id !== perm.id);

      await api.post(`/role/${menuRole.id}/permissions`, {
        permissions: nextIds,
      });
      toast({
        title: "Updated",
        description: `${enabled ? "Enabled" : "Disabled"} ${nav.title} for ${menuRole.name}`,
      });
      await fetchRoles();
    } catch (e) {
      toast({
        title: "Error",
        description: (e as { message?: string })?.message || "Failed to update menu access",
        variant: "destructive",
      });
    }
  };

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
      label: "Usage",
      icon: <Users className="h-4 w-4" />,
      onClick: async (p) => {
        try {
          setPermUsageLoading(true);
          setPermUsageOpen(true);
          const res = await api.get<any>(`/permission/${p.id}`);
          const perm =
            (res as any)?.data?.permission ||
            (res as any)?.permission ||
            (res as any)?.data?.data?.permission ||
            null;
          setPermUsage({
            permission: perm,
            roles: Array.isArray(perm?.roles) ? perm.roles : [],
            users: Array.isArray(perm?.users) ? perm.users : [],
          });
        } catch (e) {
          toast({
            title: "Error",
            description:
              (e as { message?: string })?.message || "Failed to load permission usage",
            variant: "destructive",
          });
          setPermUsage({ permission: null, roles: [], users: [] });
          setPermUsageOpen(false);
        } finally {
          setPermUsageLoading(false);
        }
      },
    },
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

  const createRole = async () => {
    try {
      await api.post("/role", {
        name: newRoleForm.name,
        description: newRoleForm.description,
        permissions: [],
      });
      toast({ title: "Success", description: "Group created" });
      setNewRoleDialogOpen(false);
      setNewRoleForm({ name: "", description: "" });
      fetchRoles();
    } catch (e) {
      toast({
        title: "Error",
        description: (e as { message?: string })?.message || "Failed to create group",
        variant: "destructive",
      });
    }
  };

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
          const direct = pickArray<{ permissionId: string; granted: boolean }>(
            res,
            ["data.directPermissions", "directPermissions", "data.data.directPermissions"],
          );
          const granted = direct.filter((p) => p.granted).map((p) => p.permissionId);
          setUserDirectPerms(granted);
        } catch {
          setUserDirectPerms([]);
        }
        setUserDialogOpen(true);
      },
    },
    {
      label: "Assign group",
      icon: <Users className="h-4 w-4" />,
      onClick: (u) => {
        setAssignUser(u);
        setAssignRoleId("");
        setAssignGroupOpen(true);
      },
    },
  ];

  const assignGroup = async () => {
    if (!assignUser || !assignRoleId) return;
    try {
      await api.post(`/user/${assignUser.id}/assign-role`, { roleId: assignRoleId });
      toast({ title: "Success", description: "Group assigned to user" });
      setAssignGroupOpen(false);
      setAssignUser(null);
      setAssignRoleId("");
    } catch (e) {
      toast({
        title: "Error",
        description: (e as { message?: string })?.message || "Failed to assign group",
        variant: "destructive",
      });
    }
  };

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
          <TabsTrigger value="menu">Menu access</TabsTrigger>
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

          {permUsageOpen && (
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Permission usage
                    {permUsage?.permission?.code
                      ? `: ${permUsage.permission.code}`
                      : ""}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {permUsageLoading ? (
                    <div className="text-sm text-muted-foreground">Loading…</div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm text-muted-foreground">
                          Roles/users currently having this permission.
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPermUsageOpen(false)}
                        >
                          Close
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-md border p-3">
                          <div className="font-medium mb-2">Groups (roles)</div>
                          {permUsage.roles.length === 0 ? (
                            <div className="text-sm text-muted-foreground">None</div>
                          ) : (
                            <div className="space-y-2">
                              {permUsage.roles.map((r) => (
                                <div key={r.id} className="flex items-center justify-between">
                                  <span>{r.name}</span>
                                  <Badge variant="secondary">role</Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="rounded-md border p-3">
                          <div className="font-medium mb-2">Users (direct)</div>
                          {permUsage.users.length === 0 ? (
                            <div className="text-sm text-muted-foreground">None</div>
                          ) : (
                            <div className="space-y-2">
                              {permUsage.users.map((u) => (
                                <div key={u.id} className="flex items-center justify-between gap-2">
                                  <span className="truncate">
                                    {[u.firstName, u.lastName].filter(Boolean).join(" ") ||
                                      u.email}
                                  </span>
                                  <Badge variant="outline" className="font-mono">
                                    {u.email}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

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
            onAdd={() => setNewRoleDialogOpen(true)}
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

          <FormDialog
            open={newRoleDialogOpen}
            onOpenChange={setNewRoleDialogOpen}
            title="Create group"
            fields={[
              { name: "name", label: "Group name", type: "text", required: true },
              { name: "description", label: "Description", type: "textarea" },
            ]}
            values={newRoleForm}
            onChange={(name, value) =>
              setNewRoleForm((p) => ({ ...p, [name]: String(value ?? "") }))
            }
            onSubmit={createRole}
            isEditing={false}
            size="lg"
          />
        </TabsContent>

        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Menu access (by group)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Select a group, then enable the HR menus it can access. This will automatically:
                (1) create a permission code for the menu if missing, (2) attach that permission
                code to the menu item, and (3) grant/revoke the permission to the selected group.
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-medium">Group</div>
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={menuTabRoleId}
                  onChange={(e) => setMenuTabRoleId(e.target.value)}
                >
                  <option value="">Select group…</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {loadingNav && <span className="text-sm text-muted-foreground">Loading menus…</span>}
              </div>

              {!menuRole ? (
                <div className="text-sm text-muted-foreground">Pick a group to manage menu access.</div>
              ) : (
                <div className="space-y-2">
                  {hrNavItems.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No HR menu items found in navigation config.
                    </div>
                  ) : (
                    hrNavItems.map((nav) => {
                      const code = menuPermissionCode(nav.id);
                      const perm = permByCode.get(code);
                      const enabled =
                        !!perm && (menuRole.permissions || []).some((p) => p.id === perm.id);
                      return (
                        <div
                          key={nav.id}
                          className="flex items-center justify-between gap-4 rounded-md border p-3"
                        >
                          <div className="min-w-0">
                            <div className="font-medium truncate">{nav.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{nav.path}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {code}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={enabled}
                              onCheckedChange={(v) => toggleMenuForGroup(nav, v === true)}
                            />
                            <span className="text-sm">{enabled ? "Enabled" : "Disabled"}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
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

          <FormDialog
            open={assignGroupOpen}
            onOpenChange={setAssignGroupOpen}
            title={`Assign group${assignUser ? `: ${assignUser.email}` : ""}`}
            fields={[
              {
                name: "roleId",
                label: "Group",
                type: "select",
                required: true,
                options: roles.map((r) => ({ value: r.id, label: r.name })),
              },
            ]}
            values={{ roleId: assignRoleId }}
            onChange={(name, value) => {
              if (name === "roleId") setAssignRoleId(String(value || ""));
            }}
            onSubmit={assignGroup}
            isEditing={false}
            size="lg"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

