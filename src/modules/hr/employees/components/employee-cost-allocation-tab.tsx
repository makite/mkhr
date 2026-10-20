/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Building,
  Plus,
  Trash2,
  RefreshCw,
  Edit3,
  Calendar,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { projectFundingService, type Project } from "@/services/project-funding-service";
import { toast } from "sonner";

interface EmployeeCostAllocationTabProps {
  employeeId: string;
  basicSalary?: number;
}

export default function EmployeeCostAllocationTab({
  employeeId,
  basicSalary = 0,
}: EmployeeCostAllocationTabProps) {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Form State for editing splits
  const [effFrom, setEffFrom] = useState(new Date().toISOString().split("T")[0]);
  const [effTo, setEffTo] = useState("");
  const [justification, setJustification] = useState("Staff Level of Effort Adjustment");
  const [splitRows, setSplitRows] = useState<{ budgetLineId: string; percentage: number }[]>([]);

  // 1. Fetch current employee allocations
  const { data: allocationData, isLoading: loadingAllocations } = useQuery({
    queryKey: ["employee-allocations", employeeId],
    queryFn: () => projectFundingService.getEmployeeAllocations(employeeId),
  });

  // 2. Fetch all projects & budget lines for selection
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects-active"],
    queryFn: () => projectFundingService.listProjects({ status: "ACTIVE" }),
  });

  // Flat list of all available budget lines across projects
  const availableBudgetLines = React.useMemo(() => {
    const lines: { id: string; label: string; projectCode: string }[] = [];
    projects.forEach((p) => {
      p.budgetLines?.forEach((b) => {
        lines.push({
          id: b.id,
          label: `[${p.code}] ${b.code} - ${b.description}`,
          projectCode: p.code,
        });
      });
    });
    return lines;
  }, [projects]);

  // Mutation to save splits
  const saveMutation = useMutation({
    mutationFn: (payload: {
      allocations: { budgetLineId: string; percentage: number }[];
      effectiveFrom: string;
      effectiveTo?: string;
      justification?: string;
    }) =>
      projectFundingService.setEmployeeAllocations(employeeId, payload.allocations, {
        effectiveFrom: payload.effectiveFrom,
        effectiveTo: payload.effectiveTo || undefined,
        justification: payload.justification,
      }),
    onSuccess: () => {
      toast.success("Cost allocations saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["employee-allocations", employeeId] });
      setEditDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to save allocations");
    },
  });

  const handleOpenEdit = () => {
    if (allocationData && allocationData.allocations.length > 0) {
      setSplitRows(
        allocationData.allocations.map((a) => ({
          budgetLineId: a.budgetLineId,
          percentage: Number(a.percentage),
        }))
      );
      if (allocationData.allocations[0].effectiveFrom) {
        setEffFrom(allocationData.allocations[0].effectiveFrom.split("T")[0]);
      }
      if (allocationData.allocations[0].effectiveTo) {
        setEffTo(allocationData.allocations[0].effectiveTo.split("T")[0]);
      }
    } else {
      setSplitRows([{ budgetLineId: availableBudgetLines[0]?.id || "", percentage: 100 }]);
    }
    setEditDialogOpen(true);
  };

  const handleAddSplitRow = () => {
    setSplitRows((prev) => [...prev, { budgetLineId: availableBudgetLines[0]?.id || "", percentage: 0 }]);
  };

  const handleRemoveSplitRow = (index: number) => {
    setSplitRows((prev) => prev.filter((_, i) => i !== index));
  };

  const currentTotalPercent = splitRows.reduce((acc, r) => acc + (Number(r.percentage) || 0), 0);
  const isFormValid = Math.abs(currentTotalPercent - 100.0) < 0.01 && splitRows.every((r) => r.budgetLineId);

  const totalPercentage = allocationData?.totalPercentage ?? 0;
  const isBalanced = allocationData?.isBalanced ?? false;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <FolderKanban className="h-5 w-5 text-indigo-600" />
              Project Level of Effort (LOE) & Funding Splits
            </CardTitle>
            {isBalanced ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> 100% Balanced
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {totalPercentage}% Unbalanced
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs mt-1">
            Percentage distribution of employee's compensation charged to active donor project budget lines.
          </CardDescription>
        </div>

        <Button size="sm" onClick={handleOpenEdit} className="gap-2 shrink-0">
          <Edit3 className="h-4 w-4" /> Edit Cost Allocations
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 pt-5">
        {loadingAllocations ? (
          <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" /> Loading cost allocations...
          </div>
        ) : !allocationData || allocationData.allocations.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-border/80 rounded-xl space-y-3">
            <FolderKanban className="h-10 w-10 text-muted-foreground/60 mx-auto" />
            <h4 className="font-semibold text-sm">No Project Cost Allocations Defined</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              This employee is currently funded 100% by Core Operations. For NGO and donor grant reporting, you can allocate their Level of Effort across project budget lines.
            </p>
            <Button size="sm" variant="outline" onClick={handleOpenEdit} className="gap-1.5 mt-2">
              <Plus className="h-4 w-4" /> Configure First Allocation
            </Button>
          </div>
        ) : (
          <>
            {/* Visual Allocation Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Effort Distribution</span>
                <span className={isBalanced ? "text-emerald-600 font-bold" : "text-destructive font-bold"}>
                  {totalPercentage.toFixed(1)}% of 100%
                </span>
              </div>
              <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex border border-border/70 shadow-2xs">
                {allocationData.allocations.map((a, idx) => {
                  const colors = [
                    "bg-indigo-600",
                    "bg-emerald-600",
                    "bg-blue-600",
                    "bg-amber-600",
                    "bg-purple-600",
                  ];
                  const color = colors[idx % colors.length];
                  return (
                    <div
                      key={idx}
                      style={{ width: `${a.percentage}%` }}
                      className={`${color} h-full transition-all flex items-center justify-center text-[10px] text-white font-bold select-none truncate px-1`}
                      title={`${a.budgetLine?.project?.code || "Project"}: ${a.percentage}%`}
                    >
                      {Number(a.percentage) >= 15 ? `${a.percentage}%` : ""}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Allocations Table */}
            <div className="border border-border/80 rounded-xl overflow-hidden shadow-2xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Project & Initiative</TableHead>
                    <TableHead className="text-xs font-semibold">Funder / Donor</TableHead>
                    <TableHead className="text-xs font-semibold">Budget Line</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Percentage</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Monthly Charge (ETB)</TableHead>
                    <TableHead className="text-xs font-semibold">Effective Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocationData.allocations.map((alloc, idx) => {
                    const pct = Number(alloc.percentage);
                    const monthlyBurden = (basicSalary * pct) / 100.0;
                    return (
                      <TableRow key={idx} className="hover:bg-muted/20">
                        <TableCell className="text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <Building className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                            <div>
                              <span className="font-semibold text-foreground">
                                {alloc.budgetLine?.project?.name || "Project"}
                              </span>
                              <p className="text-[11px] text-muted-foreground font-mono">
                                {alloc.budgetLine?.project?.code}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {alloc.budgetLine?.grant?.funder ? (
                            <Badge variant="outline" className="text-[11px] font-medium">
                              {alloc.budgetLine.grant.funder.code}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-mono font-medium text-foreground">
                            {alloc.budgetLine?.code}
                          </span>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                            {alloc.budgetLine?.description}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs text-right font-bold font-mono">
                          {pct.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono font-semibold text-foreground">
                          {monthlyBurden > 0 ? `${monthlyBurden.toLocaleString()} ETB` : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                            <span>
                              {alloc.effectiveFrom ? alloc.effectiveFrom.split("T")[0] : "—"}
                              {alloc.effectiveTo ? ` → ${alloc.effectiveTo.split("T")[0]}` : " → Ongoing"}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>

      {/* Edit Cost Allocation Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <Layers className="h-5 w-5 text-indigo-600" />
              Configure Project Cost Allocations (LOE)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 overflow-y-auto pr-1 flex-1 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Effective From Date *</Label>
                <Input
                  type="date"
                  value={effFrom}
                  onChange={(e) => setEffFrom(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Effective To Date (Optional)</Label>
                <Input
                  type="date"
                  value={effTo}
                  onChange={(e) => setEffTo(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Justification / Donor Approval Reference</Label>
              <Input
                placeholder="e.g. Approved Grant LOE allocation"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Split Rows */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Budget Line Allocations</Label>
                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    Math.abs(currentTotalPercent - 100.0) < 0.01
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                  }`}
                >
                  Total: {currentTotalPercent.toFixed(2)}% / 100.00%
                </span>
              </div>

              {availableBudgetLines.length === 0 ? (
                <div className="p-4 bg-muted/40 rounded-lg text-xs text-muted-foreground text-center">
                  No active project budget lines found in the system. Create a project and budget line first.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {splitRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 border border-border/80 rounded-lg bg-background shadow-2xs"
                    >
                      <div className="flex-1">
                        <select
                          value={row.budgetLineId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSplitRows((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, budgetLineId: val } : r))
                            );
                          }}
                          className="w-full text-xs bg-background border border-border rounded-md px-2.5 py-1.5 font-medium"
                        >
                          {availableBudgetLines.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-28 relative">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="%"
                          value={row.percentage}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setSplitRows((prev) =>
                              prev.map((r, i) => (i === idx ? { ...r, percentage: val } : r))
                            );
                          }}
                          className="text-xs font-mono pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                          %
                        </span>
                      </div>

                      {splitRows.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSplitRow(idx)}
                          className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddSplitRow}
                    className="w-full gap-1.5 text-xs border-dashed"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Project Allocation Line
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {Math.abs(currentTotalPercent - 100.0) < 0.01 ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Sum strictly equals 100%
                </span>
              ) : (
                <span className="text-rose-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Difference: {(100.0 - currentTotalPercent).toFixed(2)}%
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  saveMutation.mutate({
                    allocations: splitRows,
                    effectiveFrom: effFrom,
                    effectiveTo: effTo,
                    justification,
                  })
                }
                disabled={!isFormValid || saveMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs text-xs px-4"
              >
                {saveMutation.isPending ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" /> Saving...
                  </>
                ) : (
                  "Save Cost Allocations"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
