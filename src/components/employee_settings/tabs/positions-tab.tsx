/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Power, PowerOff, Briefcase } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { DataTable, type Action } from "@/components/shared/table-data";
import { type FormField, FormDialog } from "@/components/shared/form-dialog";
import { useToast } from "@/hooks/use-toast";

interface Position {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  gradeId: string;
  grade?: {
    id: string;
    code: string;
    name: string;
    level: number;
  };
  _count?: {
    employees: number;
  };
}

interface Grade {
  id: string;
  code: string;
  name: string;
  level: number;
}

export function PositionsTab() {
  const [data, setData] = useState<Position[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Position | null>(null);
  const [formValues, setFormValues] = useState({
    code: "",
    name: "",
    description: "",
    gradeId: "",
    isActive: true,
  });
  const { toast } = useToast();

  const columns: ColumnDef<Position>[] = [
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
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      id: "grade",
      header: "Grade",
      accessorFn: (row) => row.grade?.name,
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.grade?.name || "-"}</Badge>
      ),
    },
    {
      id: "gradeLevel",
      header: "Level",
      accessorFn: (row) => row.grade?.level,
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.grade ? `Level ${row.original.grade.level}` : "-"}
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
      id: "employees",
      header: "Employees",
      accessorFn: (row) => row._count?.employees || 0,
      cell: ({ row }) => (
        <Badge variant="outline" className="flex items-center gap-1 w-fit">
          <Briefcase className="h-3 w-3" />{" "}
          {row.original._count?.employees || 0}
        </Badge>
      ),
    },
    // {
    //   id: "isActive",
    //   header: "Status",
    //   accessorFn: (row) => row.isActive,
    //   cell: ({ row }) => <StatusBadge status={row.original.isActive} />,
    // },
  ];

  const actions: Action<Position>[] = [
    {
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: (item) => {
        setEditingItem(item);
        setFormValues({
          code: item.code,
          name: item.name,
          description: item.description || "",
          gradeId: item.gradeId,
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
          await api.put(`/positions/${item.id}`, { isActive: !item.isActive });
          toast({
            title: "Success",
            description: `Position ${item.isActive ? "deactivated" : "activated"} successfully`,
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
        if (!confirm("Are you sure you want to delete this position?")) return;
        try {
          await api.delete(`/positions/${item.id}`);
          toast({
            title: "Success",
            description: "Position deleted successfully",
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
      show: (item) => (item._count?.employees || 0) === 0,
    },
  ];

  const formFields: FormField[] = [
    {
      name: "code",
      label: "Code",
      type: "text",
      placeholder: "e.g., SE, HRM, FIN_ANALYST",
      required: true,
      disabled: !!editingItem,
    },
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "e.g., Software Engineer, HR Manager",
      required: true,
    },
    {
      name: "gradeId",
      label: "Grade",
      type: "select",
      placeholder: "Select grade",
      required: true,
      options: grades.map((g) => ({
        value: g.id,
        label: `${g.name} (Level ${g.level})`,
      })),
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
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await api.get("/grades");
      setGrades(response.data.data?.grades || response.data.grades || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch grades",
        variant: "destructive",
      });
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/positions");
      setData(response.data.data?.positions || response.data.positions || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch positions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await api.put(`/positions/${editingItem.id}`, formValues);
        toast({
          title: "Success",
          description: "Position updated successfully",
        });
      } else {
        await api.post("/positions", formValues);
        toast({
          title: "Success",
          description: "Position created successfully",
        });
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormValues({
        code: "",
        name: "",
        description: "",
        gradeId: "",
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
        title="Positions"
        description="Manage job positions and their grade assignments"
        onAdd={() => {
          setEditingItem(null);
          setFormValues({
            code: "",
            name: "",
            description: "",
            gradeId: "",
            isActive: true,
          });
          setIsDialogOpen(true);
        }}
        onRefresh={fetchData}
        actions={actions}
        searchPlaceholder="Search positions..."
      />

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingItem ? "Edit Position" : "Add Position"}
        description={
          editingItem
            ? "Update the position details below."
            : "Enter the details for the new position."
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
