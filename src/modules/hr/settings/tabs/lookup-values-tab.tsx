/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Power, PowerOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { type FormField, FormDialog } from "@/components/shared/form-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { type Action, DataTable } from "@/components/shared/table-data";
import { useToast } from "@/hooks/use-toast";
interface LookupValue {
  id: string;
  code: string;
  value: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  type: {
    id: string;
    name: string;
    code: string;
  };
}

interface LookupType {
  id: string;
  code: string;
  name: string;
}

export function LookupValuesTab() {
  const [data, setData] = useState<LookupValue[]>([]);
  const [lookupTypes, setLookupTypes] = useState<LookupType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LookupValue | null>(null);
  const [formValues, setFormValues] = useState({
    typeId: "",
    code: "",
    value: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });
  const { toast } = useToast();

  const columns: ColumnDef<LookupValue>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.original.code}
        </Badge>
      ),
    },
    {
      accessorKey: "value",
      header: "Display Value",
    },
    {
      accessorKey: "type.name",
      id: "typeName",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.type?.name}</Badge>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || "-",
    },
    {
      accessorKey: "sortOrder",
      header: "Order",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.isActive} />,
    },
  ];

  const actions: Action<LookupValue>[] = [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item) => {
        setEditingItem(item);
        setFormValues({
          typeId: item.type.id,
          code: item.code,
          value: item.value,
          description: item.description || "",
          sortOrder: item.sortOrder,
          isActive: item.isActive,
        });
        setIsDialogOpen(true);
      },
    } as Action<LookupValue>,
    {
      label: (item: LookupValue) => (item.isActive ? "Deactivate" : "Activate"),
      icon: (item: LookupValue) =>
        item.isActive ? (
          <PowerOff className="h-4 w-4" />
        ) : (
          <Power className="h-4 w-4" />
        ),
      onClick: async (item: LookupValue) => {
        try {
          await api.put(`/lookups/values/${item.id}`, {
            isActive: !item.isActive,
          });
          toast({
            title: "Success",
            description: `Lookup value ${item.isActive ? "deactivated" : "activated"} successfully`,
          });
          fetchData();
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
        if (!confirm("Are you sure you want to delete this lookup value?"))
          return;
        try {
          await api.delete(`/lookups/values/${item.id}`);
          toast({
            title: "Success",
            description: "Lookup value deleted successfully",
          });
          fetchData();
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete lookup value",
            variant: "destructive",
          });
        }
      },
      variant: "destructive",
    },
  ];

  const formFields: FormField[] = [
    {
      name: "typeId",
      label: "Lookup Type",
      type: "select",
      required: true,
      disabled: !!editingItem,
      options: lookupTypes.map((t) => ({ value: t.id, label: t.name })),
    },
    {
      name: "code",
      label: "Code",
      type: "text",
      placeholder: "e.g., MALE, FULL_TIME",
      required: true,
      disabled: !!editingItem,
    },
    {
      name: "value",
      label: "Display Value",
      type: "text",
      placeholder: "e.g., Male, Full Time",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Optional description",
    },
    {
      name: "sortOrder",
      label: "Sort Order",
      type: "number",
      placeholder: "0",
    },
  ];

  useEffect(() => {
    fetchLookupTypes();
  }, []);

  useEffect(() => {
    if (selectedType) {
      fetchData();
    }
  }, [selectedType]);

  const fetchLookupTypes = async () => {
    try {
      const response = await api.get("/lookups/types");
      setLookupTypes(response.data.types);
      if (response.data.types.length > 0) {
        setSelectedType(response.data.types[0].code);
        setFormValues((prev) => ({
          ...prev,
          typeId: response.data.types[0].id,
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch lookup types",
        variant: "destructive",
      });
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/lookups/${selectedType}`);
      setData(response.data.values);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch lookup values",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await api.put(`/lookups/values/${editingItem.id}`, formValues);
        toast({
          title: "Success",
          description: "Lookup value updated successfully",
        });
      } else {
        await api.post(`/lookups/${selectedType}/values`, formValues);
        toast({
          title: "Success",
          description: "Lookup value created successfully",
        });
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormValues({
        typeId: lookupTypes.find((t) => t.code === selectedType)?.id || "",
        code: "",
        value: "",
        description: "",
        sortOrder: 0,
        isActive: true,
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: editingItem ? "Failed to update" : "Failed to create",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="mb-4">
        <select
          className="w-[200px] p-2 border rounded-md"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {lookupTypes.map((type) => (
            <option key={type.id} value={type.code}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        title="Lookup Values"
        description="Manage values for each lookup type"
        onAdd={() => {
          setEditingItem(null);
          setFormValues({
            typeId: lookupTypes.find((t) => t.code === selectedType)?.id || "",
            code: "",
            value: "",
            description: "",
            sortOrder: 0,
            isActive: true,
          });
          setIsDialogOpen(true);
        }}
        onRefresh={fetchData}
        actions={actions}
        searchPlaceholder="Search lookup values..."
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? "Edit Lookup Value" : "Add Lookup Value"}
        description={
          editingItem
            ? "Update the lookup value details."
            : "Add a new value to the selected lookup type."
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
    </>
  );
}
