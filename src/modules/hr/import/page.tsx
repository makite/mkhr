/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  ArrowRight,
  Database,
  Users,
  TrendingUp,
  UserCheck,
  UserX,
  HelpCircle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { importService, type ValidationResult, type ImportSchema } from "@/services/import-service";
import { toast } from "sonner";

export default function UniversalImportPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("EMPLOYEE_ONBOARDING");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validating, setValidating] = useState<boolean>(false);
  const [committing, setCommitting] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [commitSuccess, setCommitSuccess] = useState<{ count: number; message: string } | null>(null);

  // Load import schemas directly from backend with TanStack Query caching
  const { data: importTypes, isLoading: loadingTypes } = useQuery<ImportSchema[]>({
    queryKey: ["import-types"],
    queryFn: () => importService.getImportTypes(),
    staleTime: 10 * 60 * 1000,
  });

  const currentSchema = importTypes?.find((s) => s.key === activeTab) || {
    key: activeTab as any,
    title:
      activeTab === "EMPLOYEE_ONBOARDING"
        ? "Employee Master Roster Onboarding"
        : activeTab === "SALARY_INCREMENT"
          ? "Bulk Salary Increments"
          : activeTab === "PROMOTION"
            ? "Promotions & Lateral Transfers"
            : "Bulk Terminations & Separations",
    description: "Upload and batch process spreadsheet records into the ERP system.",
    templateFilename: `${activeTab.toLowerCase()}_template.xlsx`,
    requiredFields: ["Required fields defined in system template"],
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSelectedFile(null);
    setValidationResult(null);
    setCommitSuccess(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      toast.info(`Preparing ${currentSchema.title} Excel template with live DB lookups...`);
      await importService.downloadTemplate(activeTab, currentSchema.templateFilename);
      toast.success("Excel template downloaded with embedded database dropdowns.");
    } catch {
      toast.error("Failed to download Excel template. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setValidationResult(null);
      setCommitSuccess(null);
    }
  };

  const handleValidate = async () => {
    if (!selectedFile) {
      toast.error("Please select an Excel file to validate.");
      return;
    }

    setValidating(true);
    setValidationResult(null);
    try {
      const res = await importService.validateUpload(activeTab, selectedFile);
      setValidationResult(res);
      if (res.invalidCount === 0 && res.validCount > 0) {
        toast.success(`Validated ${res.validCount} records successfully! Ready to commit.`);
      } else if (res.validCount > 0) {
        toast.warning(
          `Validation complete: ${res.validCount} valid records, ${res.invalidCount} rows require attention.`,
        );
      } else {
        toast.error("No valid records found in the uploaded file.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to validate spreadsheet.");
    } finally {
      setValidating(false);
    }
  };

  const handleCommit = async () => {
    if (!validationResult || validationResult.validRows.length === 0) {
      toast.error("No valid rows available to commit.");
      return;
    }

    setCommitting(true);
    try {
      const res = await importService.commitBatch(activeTab, validationResult.validRows);
      setCommitSuccess(res);
      toast.success(res.message || "Import completed successfully!");
      setValidationResult(null);
      setSelectedFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to commit import batch.");
    } finally {
      setCommitting(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setCommitSuccess(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Database className="h-6 w-6 text-emerald-600" />
              Universal Data Import Hub
            </h1>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 bg-emerald-50/50">
              Excel 2026 Ready
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Single-page bulk import for employee onboarding and mass HR lifecycle operations with database-backed dropdowns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/hr/employees")}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            View Employees
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/hr-actions/approval")}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            HR Approvals
          </Button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/60 rounded-xl">
          <TabsTrigger
            value="EMPLOYEE_ONBOARDING"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-xs md:text-sm">Employee Roster</span>
          </TabsTrigger>
          <TabsTrigger
            value="SALARY_INCREMENT"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-xs md:text-sm">Salary Increments</span>
          </TabsTrigger>
          <TabsTrigger
            value="PROMOTION"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <UserCheck className="h-4 w-4 text-purple-600" />
            <span className="font-medium text-xs md:text-sm">Promotions & Transfers</span>
          </TabsTrigger>
          <TabsTrigger
            value="TERMINATION"
            className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <UserX className="h-4 w-4 text-rose-600" />
            <span className="font-medium text-xs md:text-sm">Terminations & Exits</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 flex flex-col gap-6">
          {/* Success Banner */}
          {commitSuccess && (
            <Card className="border-emerald-500/50 bg-emerald-500/10">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-base">
                      Import Completed Successfully!
                    </h4>
                    <p className="text-sm text-muted-foreground">{commitSuccess.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (activeTab === "EMPLOYEE_ONBOARDING") navigate("/hr/employees");
                      else navigate("/hr-actions/approval");
                    }}
                  >
                    View Updated Records <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                  <Button size="sm" onClick={resetAll}>
                    Import Another Batch
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 2-Column Action Grid: Step 1 & Step 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1: Download Dynamic Template */}
            <Card className="border border-border/80 shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-mono uppercase bg-muted">
                    Step 1
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Database className="h-3 w-3 text-emerald-600" /> DB-Synced Lookups
                  </span>
                </div>
                <CardTitle className="text-lg mt-2 flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  Download Dynamic Template
                </CardTitle>
                <CardDescription className="text-xs">
                  Populates all active departments, branches, job positions, and salary scales directly from the database into native Excel dropdown menus.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1.5 border border-border/50">
                  <div className="font-medium text-foreground flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-blue-500" /> Dropdown-Assisted Data Entry:
                  </div>
                  <p className="text-muted-foreground">
                    Simply click cells to select from live system dropdowns. If a value is missing from the list, type it manually and the system will automatically register it upon import.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground mr-1 self-center">
                    Columns:
                  </span>
                  {currentSchema.requiredFields.map((field, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[11px] font-normal">
                      {field}
                    </Badge>
                  ))}
                </div>

                <Button
                  onClick={handleDownloadTemplate}
                  variant="outline"
                  className="w-full border-emerald-600/30 hover:border-emerald-600 hover:bg-emerald-50/50 text-foreground font-medium"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
                  Download {currentSchema.templateFilename}
                </Button>
              </CardContent>
            </Card>

            {/* Step 2: Upload & Dry-Run Preview */}
            <Card className="border border-border/80 shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-mono uppercase bg-muted">
                    Step 2
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileCheck className="h-3 w-3 text-blue-500" /> Dry-Run Validator
                  </span>
                </div>
                <CardTitle className="text-lg mt-2 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload & Dry-Run Validate
                </CardTitle>
                <CardDescription className="text-xs">
                  Upload your completed spreadsheet. The engine checks every row against PostgreSQL lookups before saving anything.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="border-2 border-dashed border-border/80 hover:border-emerald-500/60 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40">
                  <Upload className="h-7 w-7 text-muted-foreground" />
                  <div className="text-center">
                    <span className="text-xs font-medium text-foreground">
                      {selectedFile ? selectedFile.name : "Click to select or drag and drop Excel file"}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Supports .xlsx, .xls, .csv (Max 15MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {selectedFile && (
                  <div className="flex items-center justify-between text-xs bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
                    <span className="truncate max-w-[240px] font-medium">{selectedFile.name}</span>
                    <span className="text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                )}

                <Button
                  onClick={handleValidate}
                  disabled={!selectedFile || validating}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium"
                >
                  {validating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Validating Rows...
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-4 w-4 mr-2" /> Validate Spreadsheet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Step 3: Interactive Validation Preview Table */}
          {validationResult && (
            <Card className="border border-border/80 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-600" />
                      Spreadsheet Validation Summary
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Review parsed records below before executing the database commit.
                    </CardDescription>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      Total: {validationResult.totalRows} rows
                    </Badge>
                    <Badge variant="outline" className="text-xs font-medium border-emerald-500/50 text-emerald-600 bg-emerald-50/50">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Valid: {validationResult.validCount}
                    </Badge>
                    {validationResult.invalidCount > 0 && (
                      <Badge variant="outline" className="text-xs font-medium border-rose-500/50 text-rose-600 bg-rose-50/50">
                        <AlertCircle className="h-3 w-3 mr-1" /> Invalid: {validationResult.invalidCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Preview Grid */}
                <div className="overflow-x-auto max-h-[380px]">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="w-[60px] text-center text-xs">Row</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        {activeTab === "EMPLOYEE_ONBOARDING" && (
                          <>
                            <TableHead className="text-xs">Full Name</TableHead>
                            <TableHead className="text-xs">Amharic Name</TableHead>
                            <TableHead className="text-xs">Department</TableHead>
                            <TableHead className="text-xs">Branch</TableHead>
                            <TableHead className="text-xs">Position</TableHead>
                            <TableHead className="text-xs">Salary</TableHead>
                            <TableHead className="text-xs">TIN</TableHead>
                          </>
                        )}
                        {activeTab === "SALARY_INCREMENT" && (
                          <>
                            <TableHead className="text-xs">Employee</TableHead>
                            <TableHead className="text-xs">Effective Date</TableHead>
                            <TableHead className="text-xs">Mode</TableHead>
                            <TableHead className="text-xs">Amount / %</TableHead>
                            <TableHead className="text-xs">Current Salary</TableHead>
                            <TableHead className="text-xs">Reason</TableHead>
                          </>
                        )}
                        {activeTab === "PROMOTION" && (
                          <>
                            <TableHead className="text-xs">Employee</TableHead>
                            <TableHead className="text-xs">Target Position</TableHead>
                            <TableHead className="text-xs">Target Grade</TableHead>
                            <TableHead className="text-xs">Target Branch</TableHead>
                            <TableHead className="text-xs">New Salary</TableHead>
                          </>
                        )}
                        {activeTab === "TERMINATION" && (
                          <>
                            <TableHead className="text-xs">Employee</TableHead>
                            <TableHead className="text-xs">Resignation Date</TableHead>
                            <TableHead className="text-xs">Reason</TableHead>
                            <TableHead className="text-xs">Notice Days</TableHead>
                          </>
                        )}
                        <TableHead className="text-xs">Notices / Auto-Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.preview.map((row: any, idx: number) => {
                        const isInvalid = row.status === "INVALID";
                        return (
                          <TableRow
                            key={idx}
                            className={isInvalid ? "bg-rose-50/40 hover:bg-rose-50/60" : "hover:bg-muted/30"}
                          >
                            <TableCell className="text-center font-mono text-xs text-muted-foreground">
                              {row.rowNumber}
                            </TableCell>
                            <TableCell>
                              {isInvalid ? (
                                <Badge variant="destructive" className="text-[10px] uppercase">
                                  Invalid
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] uppercase border-emerald-500/50 text-emerald-600 bg-emerald-50/50"
                                >
                                  Ready
                                </Badge>
                              )}
                            </TableCell>

                            {activeTab === "EMPLOYEE_ONBOARDING" && (
                              <>
                                <TableCell className="font-medium text-xs">
                                  {row.firstName} {row.lastName}
                                </TableCell>
                                <TableCell className="text-xs font-serif text-muted-foreground">
                                  {row.fullNameAm || "—"}
                                </TableCell>
                                <TableCell className="text-xs">{row.displayDept || "—"}</TableCell>
                                <TableCell className="text-xs">{row.displayBranch || "—"}</TableCell>
                                <TableCell className="text-xs">{row.displayPos || "—"}</TableCell>
                                <TableCell className="text-xs font-mono">
                                  {row.basicSalary?.toLocaleString()} ETB
                                </TableCell>
                                <TableCell className="text-xs font-mono">{row.tin || "—"}</TableCell>
                              </>
                            )}

                            {activeTab === "SALARY_INCREMENT" && (
                              <>
                                <TableCell className="font-medium text-xs">
                                  {row.employeeCode} - {row.employeeName}
                                </TableCell>
                                <TableCell className="text-xs">{row.effectiveDate}</TableCell>
                                <TableCell className="text-xs">
                                  <Badge variant="outline" className="text-[10px]">
                                    {row.incrementMode}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs font-mono">
                                  {row.incrementMode === "PERCENTAGE"
                                    ? `+${row.percentage}%`
                                    : `+${row.amount?.toLocaleString()} ETB`}
                                </TableCell>
                                <TableCell className="text-xs font-mono text-muted-foreground">
                                  {row.currentSalary?.toLocaleString()} ETB
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">
                                  {row.reason}
                                </TableCell>
                              </>
                            )}

                            {activeTab === "PROMOTION" && (
                              <>
                                <TableCell className="font-medium text-xs">
                                  {row.employeeCode} - {row.employeeName}
                                </TableCell>
                                <TableCell className="text-xs">{row.toPositionId || "—"}</TableCell>
                                <TableCell className="text-xs">{row.toGradeId || "—"}</TableCell>
                                <TableCell className="text-xs">{row.toBranchId || "—"}</TableCell>
                                <TableCell className="text-xs font-mono">
                                  {row.basicSalary?.toLocaleString()} ETB
                                </TableCell>
                              </>
                            )}

                            {activeTab === "TERMINATION" && (
                              <>
                                <TableCell className="font-medium text-xs">
                                  {row.employeeCode} - {row.employeeName}
                                </TableCell>
                                <TableCell className="text-xs">{row.resignationDate}</TableCell>
                                <TableCell className="text-xs">{row.reasonId || "—"}</TableCell>
                                <TableCell className="text-xs">{row.noticeDays} days</TableCell>
                              </>
                            )}

                            <TableCell className="text-xs">
                              {isInvalid ? (
                                <div className="space-y-0.5 text-rose-600">
                                  {row.errors?.map((err: any, eIdx: number) => (
                                    <div key={eIdx} className="text-[11px] flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3 shrink-0" />
                                      {err.message}
                                    </div>
                                  ))}
                                </div>
                              ) : row.notices && row.notices.length > 0 ? (
                                <div className="space-y-0.5 text-blue-600">
                                  {row.notices.map((note: string, nIdx: number) => (
                                    <div key={nIdx} className="text-[11px] flex items-center gap-1">
                                      <Info className="h-3 w-3 shrink-0" />
                                      {note}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-[11px]">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-3 bg-muted/20">
                  <div className="text-xs text-muted-foreground">
                    {validationResult.validCount > 0 ? (
                      <span>
                        Ready to write <strong>{validationResult.validCount} records</strong> directly to the database in an atomic transaction.
                      </span>
                    ) : (
                      <span className="text-rose-600">
                        Please resolve the invalid fields above in your Excel spreadsheet and re-upload.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={resetAll}>
                      Clear & Upload New File
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCommit}
                      disabled={committing || validationResult.validCount === 0}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                    >
                      {committing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Committing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Commit {validationResult.validCount} Valid Records
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
