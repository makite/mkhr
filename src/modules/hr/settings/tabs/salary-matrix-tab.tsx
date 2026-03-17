/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Pencil, Save, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SalaryMatrixRow {
  gradeId: string;
  gradeCode: string;
  gradeName: string;
  [key: string]: any; // Dynamic scale columns
}

interface Scale {
  id: string;
  code: string;
  name: string;
  stepNumber: number;
}

interface Grade {
  id: string;
  code: string;
  name: string;
  level: number;
}

export function SalaryMatrixTab() {
  const [matrixData, setMatrixData] = useState<SalaryMatrixRow[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{
    gradeId: string;
    scaleId: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch scales and grades
      const [scalesRes, gradesRes, matrixRes] = await Promise.all([
        api.get("/scales"),
        api.get("/grades"),
        api.get("/salary-matrix/full"),
      ]);

      const scalesData =
        scalesRes.data.data?.scales || scalesRes.data.scales || [];
      const gradesData =
        gradesRes.data.data?.grades || gradesRes.data.grades || [];

      setScales(scalesData);
      setGrades(gradesData);

      // Transform matrix data into table rows
      const matrix = matrixRes.data.data?.matrix || matrixRes.data.matrix || {};
      const stepIds =
        matrixRes.data.data?.stepIds || matrixRes.data.stepIds || {};
      const rows = gradesData.map((grade: Grade) => {
        const row: SalaryMatrixRow = {
          gradeId: grade.id,
          gradeCode: grade.code,
          gradeName: grade.name,
        };

        scalesData.forEach((scale: Scale) => {
          row[scale.id] = matrix[grade.code]?.[scale.code];
          row[`${scale.id}__stepId`] = stepIds[grade.code]?.[scale.code];
        });

        return row;
      });

      setMatrixData(rows);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch salary matrix",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (
    gradeId: string,
    scaleId: string,
    currentValue: number,
  ) => {
    setEditingCell({ gradeId, scaleId });
    setEditValue(currentValue?.toString() || "");
  };

  const saveEdit = async (gradeId: string, scaleId: string) => {
    try {
      const amount = parseFloat(editValue);
      if (isNaN(amount)) {
        toast({
          title: "Error",
          description: "Please enter a valid number",
          variant: "destructive",
        });
        return;
      }

      const row = matrixData.find((r) => r.gradeId === gradeId);
      const stepId = row?.[`${scaleId}__stepId`];
      if (!stepId) {
        toast({
          title: "Error",
          description:
            "Salary step not found for this grade/scale. Please refresh.",
          variant: "destructive",
        });
        return;
      }

      await api.put(`/salary-matrix/step/${stepId}`, { amount });

      // Update local state
      setMatrixData((prev) =>
        prev.map((row) =>
          row.gradeId === gradeId ? { ...row, [scaleId]: amount } : row,
        ),
      );

      setEditingCell(null);
      toast({ title: "Success", description: "Salary updated successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update salary",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Salary Matrix</h2>
          <p className="text-sm text-muted-foreground">
            Manage salary amounts for each grade and scale combination
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          Refresh
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-4 text-left align-middle font-medium">
                Grade
              </th>
              {scales.map((scale) => (
                <th
                  key={scale.id}
                  className="h-10 px-4 text-center align-middle font-medium"
                >
                  {scale.name}
                  <div className="text-xs text-muted-foreground">
                    Step {scale.stepNumber}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={scales.length + 1} className="h-24 text-center">
                  Loading...
                </td>
              </tr>
            ) : matrixData.length === 0 ? (
              <tr>
                <td colSpan={scales.length + 1} className="h-24 text-center">
                  No data found
                </td>
              </tr>
            ) : (
              matrixData.map((row) => (
                <tr
                  key={row.gradeId}
                  className="border-b hover:bg-muted/50 group"
                >
                  <td className="p-2 px-4">
                    <Badge variant="outline" className="font-mono mr-2">
                      {row.gradeCode}
                    </Badge>
                    {row.gradeName}
                  </td>
                  {scales.map((scale) => {
                    const isEditing =
                      editingCell?.gradeId === row.gradeId &&
                      editingCell?.scaleId === scale.id;
                    const value = row[scale.id];

                    return (
                      <td key={scale.id} className="p-2 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 h-8"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => saveEdit(row.gradeId, scale.id)}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => setEditingCell(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-mono">
                              {value !== undefined
                                ? value.toLocaleString()
                                : "-"}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              onClick={() =>
                                startEdit(row.gradeId, scale.id, value)
                              }
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
