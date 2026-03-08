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

interface Grade {
  id: string;
  code: string;
  name: string;
  level: number;
  description: string | null;
  isActive: boolean;
  _count?: {
    salarySteps: number;
    positions: number;
    employees: number;
  };
}

export function GradesTab() {
  const [data, setData] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Grade | null>(null);
  const [formValues, setFormValues] = useState({
    code: "",
    name: "",
    level: 1,
    description: "",
    isActive: true,
  });
  const { toast } = useToast();

  const columns: ColumnDef<Grade>[] = [
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
      id: "level",
      header: "Level",
      accessorFn: (row) => row.level,
      cell: ({ row }) => (
        <Badge variant="secondary">Level {row.original.level}</Badge>
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
      accessorFn: (row) => row._count?.positions || 0,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Badge variant="outline">
            📊 {row.original._count?.salarySteps || 0}
          </Badge>
          <Badge variant="outline">
            👔 {row.original._count?.positions || 0}
          </Badge>
          <Badge variant="outline">
            👥 {row.original._count?.employees || 0}
          </Badge>
        </div>
      ),
    },
    // {
    //   id: "isActive",
    //   header: "Status",
    //   accessorFn: (row) => row.isActive,
    //   cell: ({ row }) => <StatusBadge status={row.original.isActive} />,
    // },
  ];

  const actions: Action<Grade>[] = [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item) => {
        setEditingItem(item);
        setFormValues({
          code: item.code,
          name: item.name,
          level: item.level,
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
          await api.put(`/grades/${item.id}`, { isActive: !item.isActive });
          toast({
            title: "Success",
            description: `Grade ${item.isActive ? "deactivated" : "activated"} successfully`,
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
        if (!confirm("Are you sure you want to delete this grade?")) return;
        try {
          await api.delete(`/grades/${item.id}`);
          toast({
            title: "Success",
            description: "Grade deleted successfully",
          });
          fetchData();
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
        (item._count?.positions || 0) === 0 &&
        (item._count?.employees || 0) === 0,
    },
  ];

  const formFields: FormField[] = [
    {
      name: "code",
      label: "Code",
      type: "text",
      placeholder: "e.g., GRADE1, GRADE2",
      required: true,
      disabled: !!editingItem,
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "e.g., Grade 1, Grade 2",
      required: true,
    },
    {
      name: "level",
      label: "Level",
      type: "number",
      placeholder: "1-16",
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
      const response = await api.get("/grades");
      setData(response.data.data?.grades || response.data.grades || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch grades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await api.put(`/grades/${editingItem.id}`, formValues);
        toast({ title: "Success", description: "Grade updated successfully" });
      } else {
        await api.post("/grades", formValues);
        toast({ title: "Success", description: "Grade created successfully" });
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormValues({
        code: "",
        name: "",
        level: 1,
        description: "",
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
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        title="Grades"
        description="Manage grade levels (1-16)"
        onAdd={() => {
          setEditingItem(null);
          setFormValues({
            code: "",
            name: "",
            level: 1,
            description: "",
            isActive: true,
          });
          setIsDialogOpen(true);
        }}
        onRefresh={fetchData}
        actions={actions}
        searchPlaceholder="Search grades..."
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? "Edit Grade" : "Add Grade"}
        description={
          editingItem
            ? "Update the grade details below."
            : "Enter the details for the new grade."
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
