/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Pencil,
  Trash2,
  Power,
  PowerOff,
  GitBranch,
  Users,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { DataTable, type Action } from "@/components/shared/table-data";
import { type FormField, FormDialog } from "@/components/shared/form-dialog";
import { useToast } from "@/hooks/use-toast";

interface Department {
  id: string;
  code: string;
  name: string;
  level: number | null;
  path: string | null;
  description: string | null;
  isActive: boolean;
  parentId: string | null;
  headOfDeptId: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  headOfDept: null | any;
  _count: {
    employees: number;
    children: number;
  };
  children?: Department[];
  employeeCount?: number;
  childCount?: number;
}

export function DepartmentsTab() {
  const [data, setData] = useState<Department[]>([]);
  const [treeData, setTreeData] = useState<Department[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");
  const [editingItem, setEditingItem] = useState<Department | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [formValues, setFormValues] = useState({
    code: "",
    name: "",
    level: 1,
    description: "",
    parentId: "none", // Use "none" instead of empty string
    headOfDeptId: "none", // Use "none" for optional selects too
    isActive: true,
  });
  const { toast } = useToast();

  const columns: ColumnDef<Department>[] = [
    {
      id: "code",
      header: "Code",
      accessorFn: (row) => row.code,
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.original.code}
        </Badge>
      ),
    },
    {
      id: "name",
      header: "Name",
      accessorFn: (row) => row.name,
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-2">
          {row.original.path && (
            <Badge variant="outline" className="text-xs">
              {row.original.path}
            </Badge>
          )}
          {row.original.name}
        </div>
      ),
    },
    {
      id: "level",
      header: "Level",
      accessorFn: (row) => row.level,
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.level ? `Level ${row.original.level}` : "-"}
        </Badge>
      ),
    },
    {
      id: "parent",
      header: "Parent",
      accessorFn: (row) => {
        if (!row.parentId) return "Root";
        const parent = data.find((d) => d.id === row.parentId);
        return parent?.name || "-";
      },
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.parentId ? (
            <Badge variant="outline">
              {data.find((d) => d.id === row.original.parentId)?.name ||
                "Unknown"}
            </Badge>
          ) : (
            <span className="text-muted-foreground">Root</span>
          )}
        </span>
      ),
    },
    {
      id: "head",
      header: "Head",
      accessorFn: (row) => row.headOfDept,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.headOfDept ? "Assigned" : "-"}
        </span>
      ),
    },
    {
      id: "description",
      header: "Description",
      accessorFn: (row) => row.description,
      cell: ({ row }) => row.original.description || "-",
    },
    {
      id: "usage",
      header: "Stats",
      accessorFn: (row) => row._count?.children || 0,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Badge variant="outline" className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />{" "}
            {row.original._count?.children || 0}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {row.original._count?.employees || 0}
          </Badge>
        </div>
      ),
    },
  ];

  const actions: Action<Department>[] = [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item) => {
        setEditingItem(item);
        setFormValues({
          code: item.code,
          name: item.name,
          level: item.level || 1,
          description: item.description || "",
          parentId: item.parentId || "none",
          headOfDeptId: item.headOfDeptId || "none",
          isActive: item.isActive,
        });
        setIsDialogOpen(true);
      },
    },
    {
      label: (item) => (item.isActive ? "Deactivate" : "Activate"),
      icon: (item) =>
        item.isActive ? (
          <PowerOff className="h-4 w-4" />
        ) : (
          <Power className="h-4 w-4" />
        ),
      onClick: async (item) => {
        try {
          await api.put(`/departments/${item.id}`, {
            isActive: !item.isActive,
          });
          toast({
            title: "Success",
            description: `Department ${item.isActive ? "deactivated" : "activated"} successfully`,
          });
          fetchData();
          fetchTreeData();
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to update status",
            variant: "destructive",
          });
        }
      },
      variant: (item) => (item.isActive ? "destructive" : "success"),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: async (item) => {
        if (!confirm("Are you sure you want to delete this department?"))
          return;
        try {
          await api.delete(`/departments/${item.id}`);
          toast({
            title: "Success",
            description: "Department deleted successfully",
          });
          fetchData();
          fetchTreeData();
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to delete",
            variant: "destructive",
          });
        }
      },
      variant: "destructive",
      show: (item) =>
        (item._count?.children || 0) === 0 &&
        (item._count?.employees || 0) === 0,
    },
  ];

  const formFields: FormField[] = [
    {
      name: "code",
      label: "Code",
      type: "text",
      placeholder: "e.g., ENG, HR, FIN",
      required: true,
      disabled: !!editingItem,
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "e.g., Engineering, Human Resources",
      required: true,
    },
    {
      name: "parentId",
      label: "Parent Department",
      type: "select",
      placeholder: "Select parent department",
      options: departments
        .filter((d) => d.id !== editingItem?.id)
        .map((d) => ({ value: d.id, label: `${d.name} (${d.code})` })),
      // Don't include "none" in options - we'll handle it in the dialog
    },
    {
      name: "level",
      label: "Level",
      type: "number",
      placeholder: "1-6",
      required: true,
    },
    {
      name: "headOfDeptId",
      label: "Department Head",
      type: "select",
      placeholder: "Select head (optional)",
      options: [], // You'd fetch employees here
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Optional description",
    },
    {
      name: "isActive",
      label: "Active",
      type: "switch",
    },
  ];

  useEffect(() => {
    fetchData();
    fetchTreeData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/departments");
      const deptsData =
        response.data.data?.departments || response.data.departments || [];
      setData(deptsData);
      setDepartments(deptsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTreeData = async () => {
    try {
      const response = await api.get("/departments/tree");
      setTreeData(response.data.data?.tree || response.data.tree || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch department tree",
        variant: "destructive",
      });
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTree = (nodes: Department[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.id} className="select-none">
        <div
          className="flex items-center gap-2 py-2 px-2 hover:bg-muted/50 rounded-md cursor-pointer"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => toggleNode(node.id)}
          >
            {node.children && node.children.length > 0 ? (
              expandedNodes.has(node.id) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <span className="w-4" />
            )}
          </Button>
          <Badge variant="outline" className="font-mono mr-2">
            {node.code}
          </Badge>
          <span className="font-medium flex-1">{node.name}</span>
          <Badge variant="secondary" className="mr-2">
            Level {node.level || "-"}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" /> {node._count?.children || 0}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {node._count?.employees || 0}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingItem(node);
              setFormValues({
                code: node.code,
                name: node.name,
                level: node.level || 1,
                description: node.description || "",
                parentId: node.parentId || "none",
                headOfDeptId: node.headOfDeptId || "none",
                isActive: node.isActive,
              });
              setIsDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        {node.children &&
          node.children.length > 0 &&
          expandedNodes.has(node.id) && (
            <div>{renderTree(node.children, level + 1)}</div>
          )}
      </div>
    ));
  };

  const handleSubmit = async () => {
    try {
      // Create a copy of formValues for submission
      const submitValues = { ...formValues };

      // Convert "none" back to empty string for API
      if (submitValues.parentId === "none") {
        submitValues.parentId = "";
      }
      if (submitValues.headOfDeptId === "none") {
        submitValues.headOfDeptId = "";
      }

      if (editingItem) {
        await api.put(`/departments/${editingItem.id}`, submitValues);
        toast({
          title: "Success",
          description: "Department updated successfully",
        });
      } else {
        await api.post("/departments", submitValues);
        toast({
          title: "Success",
          description: "Department created successfully",
        });
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormValues({
        code: "",
        name: "",
        level: 1,
        description: "",
        parentId: "none",
        headOfDeptId: "none",
        isActive: true,
      });
      fetchData();
      fetchTreeData();
    } catch (error) {
      toast({
        title: "Error",
        description: editingItem ? "Failed to update" : "Failed to create",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
          <p className="text-sm text-muted-foreground">
            Manage organizational departments and hierarchy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Table View
          </Button>
          <Button
            variant={viewMode === "tree" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("tree")}
          >
            Tree View
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setFormValues({
                code: "",
                name: "",
                level: 1,
                description: "",
                parentId: "none",
                headOfDeptId: "none",
                isActive: true,
              });
              setIsDialogOpen(true);
            }}
          >
            Add Department
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <DataTable
          data={data}
          columns={columns}
          loading={loading}
          onRefresh={() => {
            fetchData();
            fetchTreeData();
          }}
          actions={actions}
          searchPlaceholder="Search departments..."
        />
      ) : (
        <div className="rounded-md border p-4 bg-card">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : treeData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No departments found
            </div>
          ) : (
            renderTree(treeData)
          )}
        </div>
      )}

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? "Edit Department" : "Add Department"}
        description={
          editingItem
            ? "Update the department details below."
            : "Enter the details for the new department."
        }
        fields={formFields}
        values={formValues}
        onChange={(name, value) =>
          setFormValues((prev) => ({ ...prev, [name]: value }))
        }
        onSubmit={handleSubmit}
        isEditing={!!editingItem}
        size="lg"
      />
    </div>
  );
}
