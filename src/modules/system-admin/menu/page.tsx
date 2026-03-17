import { useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Action } from "@/components/shared/table-data";
import { FormDialog, type FormField } from "@/components/shared/form-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  lucideIconNames,
  navigationService,
  type ApiNavItem,
} from "@/services/navigation-service";
import api from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FlatItem = ApiNavItem & { parentTitle?: string; parentId?: string };

function flatten(items: ApiNavItem[], parent?: ApiNavItem): FlatItem[] {
  const out: FlatItem[] = [];
  for (const it of items) {
    out.push({
      ...it,
      parentId: parent?.id,
      parentTitle: parent?.title,
    });
    if (it.children?.length) out.push(...flatten(it.children, it));
  }
  return out;
}

function groupByModule(items: ApiNavItem[]) {
  const map = new Map<string, ApiNavItem[]>();
  for (const it of items) {
    const key = it.module || "unassigned";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(it);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function TreeNode({
  node,
  depth = 0,
  onEdit,
  onAddChild,
  isExpanded,
  toggleExpanded,
}: {
  node: ApiNavItem;
  depth?: number;
  onEdit: (n: ApiNavItem) => void;
  onAddChild: (n: ApiNavItem) => void;
  isExpanded: (id: string) => boolean;
  toggleExpanded: (id: string) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const expanded = isExpanded(node.id);
  return (
    <div className="py-1" style={{ paddingLeft: depth * 16 }}>
      <div className="flex items-center gap-2 rounded-md border bg-card/50 px-2 py-2">
        {hasChildren ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => toggleExpanded(node.id)}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        ) : (
          <div className="h-7 w-7" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{node.title}</span>
            <Badge variant="secondary">{node.module || "-"}</Badge>
            <Badge variant="outline">{node.isVisible === false ? "Hidden" : "Visible"}</Badge>
            <Badge variant="outline">{node.isPublic ? "Public" : "Private"}</Badge>
            <Badge variant={node.isActive === false ? "secondary" : "default"}>
              {node.isActive === false ? "Inactive" : "Active"}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground truncate">{node.path}</div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddChild(node)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add child
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(node)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {hasChildren && expanded ? (
        <div className="mt-2 space-y-2">
          {node.children!.map((c) => (
            <TreeNode
              key={c.id}
              node={c}
              depth={depth + 1}
              onEdit={onEdit}
              onAddChild={onAddChild}
              isExpanded={isExpanded}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function MenuManagementPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ApiNavItem[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<
    { id: string; name: string; code: string; module: string }[]
  >([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FlatItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [formValues, setFormValues] = useState({
    title: "",
    path: "",
    module: "",
    icon: "",
    roles: "",
    permissions: "",
    isPublic: false,
    isVisible: true,
    isActive: true,
    order: 0,
    parentId: "none",
  });

  const flat = useMemo(() => flatten(items), [items]);

  const descendantIds = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const visit = (node: ApiNavItem): Set<string> => {
      const set = new Set<string>();
      for (const c of node.children || []) {
        set.add(c.id);
        for (const x of visit(c)) set.add(x);
      }
      map.set(node.id, set);
      return set;
    };
    for (const r of items) visit(r);
    return map;
  }, [items]);

  const parentOptions = useMemo(() => {
    const blocked = new Set<string>();
    if (editing?.id) {
      blocked.add(editing.id);
      for (const d of descendantIds.get(editing.id) || []) blocked.add(d);
    }
    return flat
      .filter((x) => !blocked.has(x.id))
      .map((x) => ({
        value: x.id,
        label: `${x.title} (${x.module || "unassigned"})`,
      }));
  }, [flat, editing?.id, descendantIds]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isExpanded = (id: string) => expandedIds.has(id);

  const columns: ColumnDef<FlatItem>[] = [
    {
      id: "title",
      header: "Title",
      accessorFn: (r) => r.title,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-muted-foreground">{row.original.path}</div>
        </div>
      ),
    },
    {
      id: "parent",
      header: "Parent",
      accessorFn: (r) => r.parentTitle || "Root",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.parentTitle || "Root"}</Badge>
      ),
    },
    {
      id: "module",
      header: "Module",
      accessorFn: (r) => r.module || "-",
      cell: ({ row }) => <Badge variant="outline">{row.original.module || "-"}</Badge>,
    },
    {
      id: "icon",
      header: "Icon",
      accessorFn: (r) => r.icon || "",
      cell: ({ row }) => <Badge variant="secondary">{row.original.icon || "-"}</Badge>,
    },
    {
      id: "roles",
      header: "Roles",
      accessorFn: (r) => (r.roles || []).join(", "),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.original.roles || []).map((r) => (
            <Badge key={r} variant="outline">
              {r}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (r) => (r.isActive === false ? "Inactive" : "Active"),
      cell: ({ row }) => (
        <Badge variant={row.original.isActive === false ? "secondary" : "default"}>
          {row.original.isActive === false ? "Inactive" : "Active"}
        </Badge>
      ),
    },
    {
      id: "visibility",
      header: "Visibility",
      accessorFn: (r) =>
        `${r.isVisible === false ? "Hidden" : "Visible"} / ${r.isPublic ? "Public" : "Private"}`,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Badge variant="outline">
            {row.original.isVisible === false ? "Hidden" : "Visible"}
          </Badge>
          <Badge variant="outline">{row.original.isPublic ? "Public" : "Private"}</Badge>
        </div>
      ),
    },
  ];

  const actions: Action<FlatItem>[] = [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item) => {
        setEditing(item);
        setFormValues({
          title: item.title,
          path: item.path,
          module: item.module || "",
          icon: item.icon || "",
          roles: (item.roles || []).join(","),
          permissions: String(((item as any).permissions || []).join(",")),
          isPublic: Boolean((item as any).isPublic),
          isVisible: (item as any).isVisible === false ? false : true,
          isActive: item.isActive !== false,
          order: Number(item.order || 0),
          parentId: String((item as any).parentId || "none"),
        });
        setDialogOpen(true);
      },
    },
    {
      label: (item) => (item.isActive === false ? "Activate" : "Deactivate"),
      icon: (item) =>
        item.isActive === false ? (
          <Power className="h-4 w-4" />
        ) : (
          <PowerOff className="h-4 w-4" />
        ),
      onClick: async (item) => {
        try {
          await navigationService.updateItem(item.id, {
            isActive: item.isActive === false ? true : false,
          });
          await fetchConfig();
          toast({ title: "Success", description: "Menu item updated" });
        } catch (e) {
          toast({
            title: "Error",
            description: (e as { message?: string })?.message || "Failed to update menu item",
            variant: "destructive",
          });
        }
      },
      variant: (item) => (item.isActive === false ? "success" : "destructive"),
    },
    {
      label: (item) => (item.isVisible === false ? "Show" : "Hide"),
      icon: (item) =>
        item.isVisible === false ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        ),
      onClick: async (item) => {
        try {
          await navigationService.updateItem(item.id, {
            isVisible: item.isVisible === false ? true : false,
          });
          await fetchConfig();
          toast({ title: "Success", description: "Visibility updated" });
        } catch (e) {
          toast({
            title: "Error",
            description:
              (e as { message?: string })?.message ||
              "Failed to update visibility",
            variant: "destructive",
          });
        }
      },
      variant: (item) => (item.isVisible === false ? "success" : "default"),
    },
    {
      label: (item) => (item.isPublic ? "Make private" : "Make public"),
      icon: (item) =>
        item.isPublic ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Globe className="h-4 w-4" />
        ),
      onClick: async (item) => {
        try {
          await navigationService.updateItem(item.id, {
            isPublic: !Boolean(item.isPublic),
          });
          await fetchConfig();
          toast({ title: "Success", description: "Access updated" });
        } catch (e) {
          toast({
            title: "Error",
            description:
              (e as { message?: string })?.message || "Failed to update access",
            variant: "destructive",
          });
        }
      },
      variant: "default",
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async (item) => {
        if (!confirm("Delete this menu item? This will also remove it from the sidebar.")) return;
        try {
          await navigationService.deleteItem(item.id);
          await fetchConfig();
          toast({ title: "Success", description: "Menu item deleted" });
        } catch (e) {
          toast({
            title: "Error",
            description: (e as { message?: string })?.message || "Failed to delete menu item",
            variant: "destructive",
          });
        }
      },
      variant: "destructive",
    },
  ];

  const fields: FormField[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "path", label: "Path", type: "text", required: true },
    { name: "module", label: "Module", type: "text", placeholder: "e.g. system-admin, hr, payroll" },
    {
      name: "icon",
      label: "Icon key",
      type: "icon",
      placeholder: "Start typing e.g. Settings, Users, LayoutDashboard…",
      options: lucideIconNames.map((n) => ({ value: n, label: n })),
    },
    {
      name: "roles",
      label: "Roles (comma-separated)",
      type: "text",
      placeholder: "e.g. ADMIN,SUPER_ADMIN,HR",
    },
    {
      name: "permissions",
      label: "Permissions (comma-separated codes)",
      type: "text",
      placeholder: "e.g. user:create,permission:view",
    },
    { name: "order", label: "Order", type: "number" },
    { name: "isPublic", label: "Public", type: "switch" },
    { name: "isVisible", label: "Visible", type: "switch" },
    { name: "isActive", label: "Active", type: "switch" },
    {
      name: "parentId",
      label: "Parent",
      type: "select",
      required: false,
      options: parentOptions,
    },
  ];

  const iconIsValid =
    !formValues.icon || lucideIconNames.includes(formValues.icon);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const cfg = await navigationService.getConfig();
      setItems(cfg);
    } catch (e) {
      toast({
        title: "Error",
        description: (e as { message?: string })?.message || "Failed to load navigation config",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    (async () => {
      try {
        const res = await api.get<{
          roles: string[];
          permissions: { id: string; name: string; code: string; module: string }[];
        }>("/meta/security");
        setRoles((res as any).roles || []);
        setPermissions((res as any).permissions || []);
      } catch {
        // ignore; form still usable with manual input
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async () => {
    try {
      const patch: Partial<ApiNavItem> = {
        title: formValues.title,
        path: formValues.path,
        module: formValues.module || undefined,
        icon: formValues.icon || undefined,
        roles: formValues.roles
          ? formValues.roles
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        ...(formValues.permissions
          ? {
              permissions: formValues.permissions
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : { permissions: [] }),
        isPublic: Boolean(formValues.isPublic),
        isVisible: Boolean(formValues.isVisible),
        isActive: Boolean(formValues.isActive),
        order: Number(formValues.order || 0),
        parentId: formValues.parentId === "none" ? null : formValues.parentId,
      };

      if (creating) {
        await navigationService.createItem(patch);
      } else if (editing) {
        await navigationService.updateItem(editing.id, patch);
      }
      await fetchConfig();

      setDialogOpen(false);
      setEditing(null);
      setCreating(false);
      toast({ title: "Success", description: "Menu updated" });
    } catch (e) {
      toast({
        title: "Error",
        description: (e as { message?: string })?.message || "Failed to save menu",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {(roles.length > 0 || permissions.length > 0) && (
        <div className="rounded-md border p-3 text-sm">
          {roles.length > 0 && (
            <div className="mb-2">
              <span className="font-medium">Roles:</span>{" "}
              <span className="text-muted-foreground">{roles.join(", ")}</span>
            </div>
          )}
          {permissions.length > 0 && (
            <div>
              <span className="font-medium">Permissions:</span>{" "}
              <span className="text-muted-foreground">
                {permissions.slice(0, 12).map((p) => p.code).join(", ")}
                {permissions.length > 12 ? " …" : ""}
              </span>
            </div>
          )}
        </div>
      )}

      {!iconIsValid && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <span className="font-medium text-destructive">Unknown icon:</span>{" "}
          <span className="font-mono">{formValues.icon}</span>
          <div className="text-muted-foreground mt-1">
            Pick one of the Lucide icon names (autocomplete list). If you save
            this anyway, the sidebar will fall back to a default icon.
          </div>
        </div>
      )}

      {/* Icon picker is handled by FormDialog (type: "icon") */}
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="tree">Tree by module</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <DataTable
            data={flat}
            columns={columns}
            loading={loading}
            title="Menu Management"
            description="Sidebar menu is loaded from the API. Edit titles, paths, roles, permissions, flags and activate/deactivate items."
            onRefresh={fetchConfig}
            actions={actions}
            searchPlaceholder="Search menu..."
            onAdd={() => {
              setCreating(true);
              setEditing(null);
              setFormValues({
                title: "",
                path: "",
                module: "system-admin",
                icon: "",
                roles: "",
                permissions: "",
                isPublic: false,
                isVisible: true,
                isActive: true,
                order: 0,
                parentId: "none",
              });
              setDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="tree">
          <div className="rounded-md border p-3">
            {groupByModule(items).map(([moduleKey, moduleItems]) => (
              <div key={moduleKey} className="mb-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="default">{moduleKey}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {moduleItems.length} root item(s)
                  </span>
                  <Button
                    className="ml-auto"
                    size="sm"
                    onClick={() => {
                      setCreating(true);
                      setEditing(null);
                      setFormValues({
                        title: "",
                        path: "",
                        module: moduleKey === "unassigned" ? "system-admin" : moduleKey,
                        icon: "",
                        roles: "",
                        permissions: "",
                        isPublic: false,
                        isVisible: true,
                        isActive: true,
                        order: 0,
                        parentId: "none",
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add root
                  </Button>
                </div>
                <div className="space-y-1">
                  {moduleItems.map((n) => (
                    <TreeNode
                      key={n.id}
                      node={n}
                      onEdit={(node) => {
                        // re-use the same edit dialog
                        setCreating(false);
                        setEditing(node as any);
                        setFormValues({
                          title: node.title,
                          path: node.path,
                          module: node.module || "",
                          icon: node.icon || "",
                          roles: (node.roles || []).join(","),
                          permissions: ((node as any).permissions || []).join(","),
                          isPublic: Boolean((node as any).isPublic),
                          isVisible: (node as any).isVisible === false ? false : true,
                          isActive: node.isActive !== false,
                          order: Number(node.order || 0),
                          parentId: (node as any).parentId || "none",
                        });
                        setDialogOpen(true);
                      }}
                      onAddChild={(parent) => {
                        setCreating(true);
                        setEditing(null);
                        setFormValues({
                          title: "",
                          path: "",
                          module: parent.module || moduleKey,
                          icon: "",
                          roles: (parent.roles || []).join(","),
                          permissions: ((parent as any).permissions || []).join(","),
                          isPublic: false,
                          isVisible: true,
                          isActive: true,
                          order: 0,
                          parentId: parent.id,
                        });
                        // expand parent to show the new item after refresh
                        setExpandedIds((prev) => new Set(prev).add(parent.id));
                        setDialogOpen(true);
                      }}
                      isExpanded={isExpanded}
                      toggleExpanded={toggleExpanded}
                    />
                  ))}
                </div>
              </div>
            ))}
            {items.length === 0 && !loading && (
              <div className="text-sm text-muted-foreground">No menu items.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={creating ? "Add Menu Item" : "Edit Menu Item"}
        fields={fields.map((f) =>
          f.name === "icon" ? { ...f, className: "w-full", placeholder: f.placeholder } : f,
        )}
        values={formValues}
        onChange={(name, value) => setFormValues((p) => ({ ...p, [name]: value }))}
        onSubmit={onSubmit}
        isEditing
        size="lg"
      />
    </div>
  );
}

