/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Power, PowerOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { DataTable, type Action } from "@/components/shared/table-data";
import { type FormField, FormDialog } from "@/components/shared/form-dialog";
import { useToast } from "@/hooks/use-toast";

interface Scale {
  id: string;
  code: string;
  name: string;
  stepNumber: number;
  description: string | null;
  isActive: boolean;
  _count?: {
    salarySteps: number;
    employeeScales: number;
  };
}

export function ScalesTab() {
  const [data, setData] = useState<Scale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Scale | null>(null);
  const [formValues, setFormValues] = useState({
    code: "",
    name: "",
    stepNumber: 1,
    description: "",
    isActive: true,
  });
  const { toast } = useToast();

  // COLUMNS
  const columns: ColumnDef<Scale>[] = [
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
      cell: ({ row }) => row.original.name,
    },
    {
      id: "stepNumber",
      header: "Step",
      accessorFn: (row) => row.stepNumber,
      cell: ({ row }) => (
        <Badge variant="secondary">Step {row.original.stepNumber}</Badge>
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
      header: "Usage",
      accessorFn: (row) => row._count?.salarySteps ?? 0,
      cell: ({ row }) => {
        const salarySteps = row.original._count?.salarySteps ?? 0;
        const employeeScales = row.original._count?.employeeScales ?? 0;
        return (
          <div className="flex gap-1">
            <Badge variant="outline">💰 {salarySteps}</Badge>
            <Badge variant="outline">👥 {employeeScales}</Badge>
          </div>
        );
      },
    },
  ];

  // ACTIONS
  const actions: Action<Scale>[] = [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item) => {
        setEditingItem(item);
        setFormValues({
          code: item.code,
          name: item.name,
          stepNumber: item.stepNumber,
          description: item.description || "",
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
          await api.put(`/scales/${item.id}`, { isActive: !item.isActive });
          toast({
            title: "Success",
            description: `Scale ${item.isActive ? "deactivated" : "activated"} successfully`,
          });
          fetchData();
        } catch (error: any) {
          toast({
            title: "Error",
            description: String(
              error?.response?.data?.message || "Failed to update status",
            ),
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
        if (!confirm("Are you sure you want to delete this scale?")) return;
        try {
          await api.delete(`/scales/${item.id}`);
          toast({
            title: "Success",
            description: "Scale deleted successfully",
          });
          fetchData();
        } catch (error: any) {
          toast({
            title: "Error",
            description: String(
              error?.response?.data?.message || "Failed to delete scale",
            ),
            variant: "destructive",
          });
        }
      },
      variant: "destructive",
      show: (item) => (item._count?.salarySteps ?? 0) === 0,
    },
  ];

  // FORM FIELDS
  const formFields: FormField[] = [
    {
      name: "code",
      label: "Code",
      type: "text",
      placeholder: "e.g., SCALE1, SCALE2",
      required: true,
      disabled: !!editingItem,
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "e.g., Scale 1, Scale 2",
      required: true,
    },
    {
      name: "stepNumber",
      label: "Step Number",
      type: "number",
      placeholder: "1-10",
      required: true,
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

  // FETCH DATA
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/scales?includeInactive=true");
      const scales: Scale[] = (response.data.scales || []).map((s: any) => ({
        ...s,
        _count: s._count || { salarySteps: 0, employeeScales: 0 },
      }));
      setData(scales);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch scales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // SUBMIT FORM
  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await api.put(`/scales/${editingItem.id}`, formValues);
        toast({ title: "Success", description: "Scale updated successfully" });
      } else {
        await api.post("/scales", formValues);
        toast({ title: "Success", description: "Scale created successfully" });
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormValues({
        code: "",
        name: "",
        stepNumber: 1,
        description: "",
        isActive: true,
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: String(
          error?.response?.data?.message ||
            (editingItem ? "Failed to update" : "Failed to create"),
        ),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        title="Scales"
        description="Manage salary progression steps (1-10)"
        onAdd={() => {
          setEditingItem(null);
          setFormValues({
            code: "",
            name: "",
            stepNumber: 1,
            description: "",
            isActive: true,
          });
          setIsDialogOpen(true);
        }}
        onRefresh={fetchData}
        actions={actions}
        searchPlaceholder="Search scales..."
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? "Edit Scale" : "Add Scale"}
        description={
          editingItem
            ? "Update the scale details below."
            : "Enter the details for the new scale."
        }
        fields={formFields}
        values={formValues}
        onChange={(name, value) =>
          setFormValues((prev) => ({ ...prev, [name]: value }))
        }
        onSubmit={handleSubmit}
        isEditing={!!editingItem}
      />
    </>
  );
}
