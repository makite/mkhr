/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Power, PowerOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { DataTable, type Action } from "@/components/shared/table-data";
import { type FormField, FormDialog } from "@/components/shared/form-dialog";
import { useToast } from "@/hooks/use-toast";
interface LookupType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  valuesCount?: number;
  createdAt: string;
}

export function LookupTypesTab() {
  const [data, setData] = useState<LookupType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LookupType | null>(null);
  const [formValues, setFormValues] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
  });
  const { toast } = useToast();

  const columns: ColumnDef<LookupType>[] = [
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
      id: "description",
      header: "Description",
      accessorFn: (row) => row.description,
      cell: ({ row }) => row.original.description || "-",
    },
    {
      id: "valuesCount",
      header: "Values",
      accessorFn: (row) => row.valuesCount || 0,
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.valuesCount || 0}</Badge>
      ),
    },
    // {
    //   id: "isActive",
    //   header: "Status",
    //   accessorFn: (row) => row.isActive,
    //   cell: ({ row }) => <StatusBadge status={row.original.isActive} />,
    // },
  ];

  const actions: Action<LookupType>[] = [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item) => {
        setEditingItem(item);
        setFormValues({
          code: item.code,
          name: item.name,
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
          await api.put(`/lookups/types/${item.id}`, {
            isActive: !item.isActive,
          });
          toast({
            title: "Success",
            description: `Lookup type ${item.isActive ? "deactivated" : "activated"} successfully`,
          });
          fetchData();
        } catch (error) {
          toast({
            title: "Error",
            description:
              (error as { message?: string })?.message || "Failed to update status",
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
        if (!confirm("Are you sure you want to delete this lookup type?"))
          return;
        try {
          await api.delete(`/lookups/types/${item.id}`);
          toast({
            title: "Success",
            description: "Lookup type deleted successfully",
          });
          fetchData();
        } catch (error) {
          toast({
            title: "Error",
            description:
              (error as { message?: string })?.message ||
              "Failed to delete lookup type",
            variant: "destructive",
          });
        }
      },
      variant: "destructive",
    },
  ];

  const formFields: FormField[] = [
    {
      name: "code",
      label: "Code",
      type: "text",
      placeholder: "e.g., GENDER, EMPLOYMENT_TYPE",
      required: true,
      disabled: !!editingItem,
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "e.g., Gender, Employment Type",
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        "/lookups/types?includeInactive=true&includeCounts=true",
      );
      setData(response.data.types);
    } catch (error) {
      toast({
        title: "Error",
        description:
          (error as { message?: string })?.message ||
          "Failed to fetch lookup types",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await api.put(`/lookups/types/${editingItem.id}`, {
          name: formValues.name,
          description: formValues.description,
          isActive: formValues.isActive,
        });
        toast({
          title: "Success",
          description: "Lookup type updated successfully",
        });
      } else {
        await api.post("/lookups/types", {
          code: formValues.code,
          name: formValues.name,
          description: formValues.description,
        });
        toast({
          title: "Success",
          description: "Lookup type created successfully",
        });
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormValues({ code: "", name: "", description: "", isActive: true });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description:
          (error as { message?: string })?.message ||
          (editingItem ? "Failed to update" : "Failed to create"),
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
        title="Lookup Types"
        description="Manage system lookup types for dropdowns and selections"
        onAdd={() => {
          setEditingItem(null);
          setFormValues({
            code: "",
            name: "",
            description: "",
            isActive: true,
          });
          setIsDialogOpen(true);
        }}
        onRefresh={fetchData}
        actions={actions}
        searchPlaceholder="Search lookup types..."
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? "Edit Lookup Type" : "Add Lookup Type"}
        description={
          editingItem
            ? "Update the lookup type details below."
            : "Enter the details for the new lookup type."
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
