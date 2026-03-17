/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Pencil,
  Trash2,
  Power,
  PowerOff,
  GitBranch,
  MapPin,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { DataTable, type Action } from "@/components/shared/table-data";
import { type FormField, FormDialog } from "@/components/shared/form-dialog";
import { useToast } from "@/hooks/use-toast";

interface Branch {
  id: string;
  code: string;
  name: string;
  level: number | null;
  branchType: string | null;
  region: string | null;
  zone: string | null;
  district: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  isHeadOffice: boolean;
  isActive: boolean;
  parentId: string | null;
  path: string | null;
  _count: {
    children: number;
    employees: number;
  };
  children?: Branch[];
}

export function BranchesTab() {
  const [data, setData] = useState<Branch[]>([]);
  const [treeData, setTreeData] = useState<Branch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "tree">("table");
  const [editingItem, setEditingItem] = useState<Branch | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [formValues, setFormValues] = useState({
    code: "",
    name: "",
    level: "1",
    branchType: "",
    region: "",
    zone: "",
    district: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    parentId: "none",
    isHeadOffice: false,
    isActive: true,
  });
  const { toast } = useToast();

  const columns: ColumnDef<Branch>[] = [
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
        <div className="font-medium">
          {row.original.name}
          {row.original.isHeadOffice && (
            <Badge variant="default" className="ml-2 text-xs">
              HQ
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "level",
      header: "Level",
      accessorFn: (row) => row.level,
      cell: ({ row }) => {
        const level = row.original.level;
        const labels = ["", "National", "Region", "Zone", "District", "Local"];
        return (
          <Badge variant="secondary">
            {level ? labels[level] || `Level ${level}` : "-"}
          </Badge>
        );
      },
    },
    {
      id: "branchType",
      header: "Type",
      accessorFn: (row) => row.branchType,
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.branchType || "-"}</Badge>
      ),
    },
    {
      id: "location",
      header: "Location",
      accessorFn: (row) => `${row.region || ""} ${row.city || ""}`,
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.region && <div>{row.original.region}</div>}
          {row.original.city && (
            <div className="text-muted-foreground">{row.original.city}</div>
          )}
        </div>
      ),
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
            <MapPin className="h-3 w-3" /> {row.original._count?.employees || 0}
          </Badge>
        </div>
      ),
    },
  ];

  const actions: Action<Branch>[] = [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item) => {
        setEditingItem(item);
        setFormValues({
          code: item.code,
          name: item.name,
          level: item.level?.toString() || "1",
          branchType: item.branchType || "",
          region: item.region || "",
          zone: item.zone || "",
          district: item.district || "",
          city: item.city || "",
          address: item.address || "",
          phone: item.phone || "",
          email: item.email || "",
          parentId: item.parentId || "none",
          isHeadOffice: item.isHeadOffice || false,
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
          await api.put(`/branches/${item.id}`, { isActive: !item.isActive });
          toast({
            title: "Success",
            description: `Branch ${item.isActive ? "deactivated" : "activated"} successfully`,
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
        if (!confirm("Are you sure you want to delete this branch?")) return;
        try {
          await api.delete(`/branches/${item.id}`);
          toast({
            title: "Success",
            description: "Branch deleted successfully",
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
      placeholder: "e.g., HQ, ETH-AA-BOLE",
      required: true,
      disabled: !!editingItem,
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "e.g., Head Office, Bole Branch",
      required: true,
    },
    {
      name: "parentId",
      label: "Parent Branch",
      type: "select",
      placeholder: "Select parent branch",
      options: branches
        .filter((b) => b.id !== editingItem?.id)
        .map((b) => ({ value: b.id, label: `${b.name} (${b.code})` })),
    },
    {
      name: "level",
      label: "Level",
      type: "select",
      placeholder: "Select level",
      required: true,
      options: [
        { value: "1", label: "1 - National" },
        { value: "2", label: "2 - Region" },
        { value: "3", label: "3 - Zone" },
        { value: "4", label: "4 - District" },
        { value: "5", label: "5 - Local" },
      ],
    },
    {
      name: "branchType",
      label: "Branch Type",
      type: "select",
      placeholder: "Select type",
      options: [
        { value: "NATIONAL", label: "National" },
        { value: "REGIONAL", label: "Regional" },
        { value: "ZONE", label: "Zone" },
        { value: "DISTRICT", label: "District" },
        { value: "LOCAL", label: "Local" },
      ],
    },
    {
      name: "region",
      label: "Region",
      type: "text",
      placeholder: "e.g., Addis Ababa, Oromia",
    },
    {
      name: "zone",
      label: "Zone",
      type: "text",
      placeholder: "e.g., East Addis, North Zone",
    },
    {
      name: "district",
      label: "District",
      type: "text",
      placeholder: "e.g., Bole, Yeka",
    },
    {
      name: "city",
      label: "City",
      type: "text",
      placeholder: "e.g., Addis Ababa, Adama",
    },
    {
      name: "address",
      label: "Address",
      type: "textarea",
      placeholder: "Street address",
    },
    {
      name: "phone",
      label: "Phone",
      type: "text",
      placeholder: "e.g., +251-911-123456",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "branch@company.com",
    },
    {
      name: "isHeadOffice",
      label: "Head Office",
      type: "switch",
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
      const response = await api.get("/branches");
      const branchesData =
        response.data.data?.branches || response.data.branches || [];
      setData(branchesData);
      setBranches(branchesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch branches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTreeData = async () => {
    try {
      const response = await api.get("/branches/tree");
      setTreeData(response.data.data?.tree || response.data.tree || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch branch tree",
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

  const renderTree = (nodes: Branch[], level = 0) => {
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
          {node.isHeadOffice && (
            <Badge variant="default" className="mr-2 text-xs">
              HQ
            </Badge>
          )}
          <Badge variant="secondary" className="mr-2">
            {node.branchType || "Branch"}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" /> {node._count?.children || 0}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {node._count?.employees || 0}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingItem(node);
              setFormValues({
                code: node.code,
                name: node.name,
                level: node.level?.toString() || "1",
                branchType: node.branchType || "",
                region: node.region || "",
                zone: node.zone || "",
                district: node.district || "",
                city: node.city || "",
                address: node.address || "",
                phone: node.phone || "",
                email: node.email || "",
                parentId: node.parentId || "none",
                isHeadOffice: node.isHeadOffice || false,
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
      const submitValues: any = { ...formValues };

      // Convert "none" back to null for API (Prisma expects null, not empty string)
      if (submitValues.parentId === "none") submitValues.parentId = null;

      // Convert level back to number (FormDialog returns string for number inputs)
      submitValues.level = Number(submitValues.level || 1);

      if (editingItem) {
        await api.put(`/branches/${editingItem.id}`, submitValues);
        toast({ title: "Success", description: "Branch updated successfully" });
      } else {
        await api.post("/branches", submitValues);
        toast({ title: "Success", description: "Branch created successfully" });
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormValues({
        code: "",
        name: "",
        level: "1",
        branchType: "",
        region: "",
        zone: "",
        district: "",
        city: "",
        address: "",
        phone: "",
        email: "",
        parentId: "none",
        isHeadOffice: false,
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
          <h2 className="text-2xl font-bold tracking-tight">Branches</h2>
          <p className="text-sm text-muted-foreground">
            Manage geographical/regional branches and offices
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
                level: "1",
                branchType: "",
                region: "",
                zone: "",
                district: "",
                city: "",
                address: "",
                phone: "",
                email: "",
                parentId: "none",
                isHeadOffice: false,
                isActive: true,
              });
              setIsDialogOpen(true);
            }}
          >
            Add Branch
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
          searchPlaceholder="Search branches..."
        />
      ) : (
        <div className="rounded-md border p-4 bg-card">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : treeData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No branches found
            </div>
          ) : (
            renderTree(treeData)
          )}
        </div>
      )}

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? "Edit Branch" : "Add Branch"}
        description={
          editingItem
            ? "Update the branch details below."
            : "Enter the details for the new branch."
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
