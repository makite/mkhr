/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderKanban,
  Building,
  Users,
  Plus,
  RefreshCw,
  Calendar,
  ArrowRight,
  Search,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  projectFundingService,
  type Project,
  type Funder,
} from "@/services/project-funding-service";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function ProjectsGrantsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>("projects");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [createFunderModal, setCreateFunderModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Forms
  const [projectForm, setProjectForm] = useState({
    code: "",
    name: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
    totalBudget: 1000000,
    currency: "ETB",
  });

  const [funderForm, setFunderForm] = useState({
    code: "",
    name: "",
    type: "BILATERAL",
    contactPerson: "",
    email: "",
    phone: "",
    country: "Ethiopia",
  });

  // Queries
  const { data: projects = [], isLoading: loadingProjects } = useQuery<Project[]>({
    queryKey: ["projects", searchTerm],
    queryFn: () => projectFundingService.listProjects({ search: searchTerm || undefined }),
  });

  const { data: funders = [], isLoading: loadingFunders } = useQuery<Funder[]>({
    queryKey: ["funders", searchTerm],
    queryFn: () => projectFundingService.listFunders({ search: searchTerm || undefined }),
  });

  // Staff report for selected project
  const currentProjectId = selectedProjectId || (projects[0]?.id ?? null);
  const { data: staffReport, isLoading: loadingStaffReport } = useQuery({
    queryKey: ["project-staff-report", currentProjectId],
    queryFn: () => (currentProjectId ? projectFundingService.getProjectStaffReport(currentProjectId) : null),
    enabled: Boolean(currentProjectId),
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: (data: any) => projectFundingService.createProject(data),
    onSuccess: () => {
      toast.success("Project created successfully!");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setCreateProjectModal(false);
      setProjectForm({
        code: "",
        name: "",
        description: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
        totalBudget: 1000000,
        currency: "ETB",
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create project");
    },
  });

  const createFunderMutation = useMutation({
    mutationFn: (data: any) => projectFundingService.createFunder(data),
    onSuccess: () => {
      toast.success("Funder / Donor registered successfully!");
      queryClient.invalidateQueries({ queryKey: ["funders"] });
      setCreateFunderModal(false);
      setFunderForm({
        code: "",
        name: "",
        type: "BILATERAL",
        contactPerson: "",
        email: "",
        phone: "",
        country: "Ethiopia",
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to register funder");
    },
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <FolderKanban className="h-7 w-7 text-indigo-600" />
              Projects, Grants & Donor Funding
            </h1>
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-600 bg-indigo-50/50 text-xs px-2.5 py-0.5">
              NGO / Fund Accounting Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Manage donor-funded initiatives, multi-funder grant co-financing agreements, budget lines, and employee Level of Effort (LOE) percentage allocations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setCreateFunderModal(true)}
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
          >
            <Building className="h-4 w-4 text-emerald-600" />
            Register Donor / Funder
          </Button>

          <Button
            onClick={() => setCreateProjectModal(true)}
            size="sm"
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-lg h-auto p-1 bg-muted/60 rounded-xl">
          <TabsTrigger value="projects" className="flex items-center gap-2 py-2 text-xs md:text-sm">
            <FolderKanban className="h-4 w-4 text-indigo-600" />
            <span>Projects & Grants</span>
          </TabsTrigger>
          <TabsTrigger value="funders" className="flex items-center gap-2 py-2 text-xs md:text-sm">
            <Building className="h-4 w-4 text-emerald-600" />
            <span>Donors & Funders</span>
          </TabsTrigger>
          <TabsTrigger value="staffing" className="flex items-center gap-2 py-2 text-xs md:text-sm">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Staffing & LOE</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PROJECTS & GRANTS */}
        <TabsContent value="projects" className="mt-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects by code or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {projects.length} Projects Total
            </span>
          </div>

          {loadingProjects ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" /> Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <Card className="p-8 text-center border-2 border-dashed border-border/80 rounded-xl space-y-3">
              <FolderKanban className="h-10 w-10 text-muted-foreground/60 mx-auto" />
              <h4 className="font-semibold text-sm">No Projects Created Yet</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Create your first project to begin tracking donor grants, budget lines, and allocating employee Level of Effort.
              </p>
              <Button size="sm" onClick={() => setCreateProjectModal(true)} className="gap-1.5 mt-2 bg-indigo-600 text-white">
                <Plus className="h-4 w-4" /> Create First Project
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {projects.map((prj) => (
                <Card
                  key={prj.id}
                  className="border border-border/80 shadow-xs hover:border-indigo-500/50 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40">
                          {prj.code}
                        </Badge>
                        <CardTitle className="text-base font-bold mt-1.5 text-foreground leading-snug">
                          {prj.name}
                        </CardTitle>
                      </div>
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        {prj.status}
                      </Badge>
                    </div>
                    {prj.description && (
                      <CardDescription className="text-xs line-clamp-2 mt-1">
                        {prj.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4 pt-1">
                    <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-lg text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total Budget</span>
                        <p className="font-bold font-mono text-foreground mt-0.5">
                          {Number(prj.totalBudget).toLocaleString()} {prj.currency}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Grants Linked</span>
                        <p className="font-bold text-foreground mt-0.5">
                          {prj.grants?.length || 0} Donor Grants
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span>
                          {prj.startDate.split("T")[0]} → {prj.endDate.split("T")[0]}
                        </span>
                      </div>
                    </div>

                    {prj.grants && prj.grants.length > 0 && (
                      <div className="space-y-1.5 border-t border-border/60 pt-2.5">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                          Co-Financing Funders:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {prj.grants.map((g: any, gIdx: number) => (
                            <Badge key={gIdx} variant="secondary" className="text-[10px]">
                              {g.funder?.code}: {Number(g.fundedAmount).toLocaleString()} ETB
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProjectId(prj.id);
                        setActiveTab("staffing");
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5"
                    >
                      <Users className="h-3.5 w-3.5" /> View Staffing
                    </Button>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {prj.budgetLines?.length || 0} budget lines
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: DONORS & FUNDERS */}
        <TabsContent value="funders" className="mt-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-foreground">Registered Funding Agencies & Donors</h3>
            <span className="text-xs text-muted-foreground">{funders.length} Funders Registered</span>
          </div>

          <div className="border border-border/80 rounded-xl overflow-hidden shadow-2xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Donor Code</TableHead>
                  <TableHead className="text-xs font-semibold">Funder Name</TableHead>
                  <TableHead className="text-xs font-semibold">Type</TableHead>
                  <TableHead className="text-xs font-semibold">Contact Person</TableHead>
                  <TableHead className="text-xs font-semibold">Email / Phone</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingFunders ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      Loading funders...
                    </TableCell>
                  </TableRow>
                ) : funders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      No funding partners registered yet. Click "Register Donor / Funder" to add one.
                    </TableCell>
                  </TableRow>
                ) : (
                  funders.map((f) => (
                    <TableRow key={f.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono font-bold text-xs text-indigo-600">
                        {f.code}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">
                        {f.name}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px]">
                          {f.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{f.contactPerson || "—"}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {f.email || f.phone || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-600 text-white text-[10px]">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* TAB 3: STAFFING & LOE ALLOCATION SUMMARY */}
        <TabsContent value="staffing" className="mt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/40 rounded-xl border border-border/60">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Project Staffing & Level of Effort Allocation</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Displays real-time employee payroll allocations and monthly charges against donor budget lines.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Select Project:</Label>
              <select
                value={currentProjectId || ""}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 font-medium shadow-2xs"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingStaffReport ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" /> Computing staff allocation burden...
            </div>
          ) : !staffReport || staffReport.staff.length === 0 ? (
            <Card className="p-8 text-center border-2 border-dashed border-border/80 rounded-xl space-y-3">
              <Users className="h-10 w-10 text-muted-foreground/60 mx-auto" />
              <h4 className="font-semibold text-sm">No Staff Assigned to this Project Yet</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Open any Employee Profile and navigate to the "Funding & LOE" tab to assign their percentage effort to this project's budget lines.
              </p>
              <Button size="sm" onClick={() => navigate("/employees")} className="gap-1.5 mt-2">
                <Users className="h-4 w-4" /> Go to Employees List
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 border border-border/80 shadow-2xs">
                  <span className="text-xs text-muted-foreground">Assigned Personnel</span>
                  <p className="text-xl font-bold text-foreground mt-1">{staffReport.headcount} Staff Members</p>
                </Card>
                <Card className="p-4 border border-border/80 shadow-2xs">
                  <span className="text-xs text-muted-foreground">Monthly Payroll Burden</span>
                  <p className="text-xl font-bold font-mono text-emerald-600 mt-1">
                    {staffReport.totalMonthlyPayrollCharge.toLocaleString()} ETB
                  </p>
                </Card>
                <Card className="p-4 border border-border/80 shadow-2xs">
                  <span className="text-xs text-muted-foreground">Annualized Personnel Cost</span>
                  <p className="text-xl font-bold font-mono text-foreground mt-1">
                    {(staffReport.totalMonthlyPayrollCharge * 12).toLocaleString()} ETB
                  </p>
                </Card>
              </div>

              <div className="border border-border/80 rounded-xl overflow-hidden shadow-2xs">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs font-semibold">Employee ID & Name</TableHead>
                      <TableHead className="text-xs font-semibold">Department & Position</TableHead>
                      <TableHead className="text-xs font-semibold">Budget Line</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Effort Split (%)</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Basic Salary</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Monthly Project Charge</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffReport.staff.map((s: any, sIdx: number) => (
                      <TableRow key={sIdx} className="hover:bg-muted/20">
                        <TableCell className="text-xs font-medium">
                          <span className="font-semibold text-foreground">{s.name}</span>
                          <p className="text-[11px] text-muted-foreground font-mono">{s.employeeId}</p>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span>{s.department}</span>
                          <p className="text-[11px] text-muted-foreground">{s.position}</p>
                        </TableCell>
                        <TableCell className="text-xs font-mono font-medium">{s.budgetLineCode}</TableCell>
                        <TableCell className="text-xs text-right font-bold font-mono text-indigo-600">
                          {s.percentage.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono text-muted-foreground">
                          {s.basicSalary.toLocaleString()} ETB
                        </TableCell>
                        <TableCell className="text-xs text-right font-mono font-bold text-foreground">
                          {s.monthlyProjectCharge.toLocaleString()} ETB
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/employees/${s.employeeId}`)}
                            className="text-xs text-indigo-600 hover:text-indigo-700"
                          >
                            Profile <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* CREATE PROJECT MODAL */}
      <Dialog open={createProjectModal} onOpenChange={setCreateProjectModal}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <FolderKanban className="h-5 w-5 text-indigo-600" />
              Create New Project / Initiative
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Project Code *</Label>
                <Input
                  placeholder="e.g. PRJ-WASH-2026"
                  value={projectForm.code}
                  onChange={(e) => setProjectForm((p) => ({ ...p, code: e.target.value }))}
                  className="text-xs uppercase font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Total Budget (ETB) *</Label>
                <Input
                  type="number"
                  value={projectForm.totalBudget}
                  onChange={(e) => setProjectForm((p) => ({ ...p, totalBudget: parseFloat(e.target.value) || 0 }))}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Project Title / Name *</Label>
              <Input
                placeholder="e.g. Oromia Community Water & Sanitation Program"
                value={projectForm.name}
                onChange={(e) => setProjectForm((p) => ({ ...p, name: e.target.value }))}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                placeholder="Program objectives, target beneficiaries, and scope..."
                rows={3}
                value={projectForm.description}
                onChange={(e) => setProjectForm((p) => ({ ...p, description: e.target.value }))}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date *</Label>
                <Input
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm((p) => ({ ...p, startDate: e.target.value }))}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End Date *</Label>
                <Input
                  type="date"
                  value={projectForm.endDate}
                  onChange={(e) => setProjectForm((p) => ({ ...p, endDate: e.target.value }))}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreateProjectModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => createProjectMutation.mutate(projectForm)}
              disabled={!projectForm.code || !projectForm.name || createProjectMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4"
            >
              {createProjectMutation.isPending ? "Creating..." : "Save Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE FUNDER MODAL */}
      <Dialog open={createFunderModal} onOpenChange={setCreateFunderModal}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base md:text-lg">
              <Building className="h-5 w-5 text-emerald-600" />
              Register Funding Partner / Donor
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Funder Code *</Label>
                <Input
                  placeholder="e.g. USAID, UNICEF"
                  value={funderForm.code}
                  onChange={(e) => setFunderForm((p) => ({ ...p, code: e.target.value }))}
                  className="text-xs uppercase font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Funder Type</Label>
                <select
                  value={funderForm.type}
                  onChange={(e) => setFunderForm((p) => ({ ...p, type: e.target.value }))}
                  className="w-full text-xs bg-background border border-border rounded-md px-2.5 py-2 font-medium"
                >
                  <option value="BILATERAL">Bilateral (USAID, FCDO, GIZ)</option>
                  <option value="MULTILATERAL">Multilateral (UN, World Bank, EU)</option>
                  <option value="PRIVATE_DONOR">Private Foundation (Gates)</option>
                  <option value="CORPORATE_CSR">Corporate CSR Grant</option>
                  <option value="GOVERNMENT">Government Authority</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Full Name *</Label>
              <Input
                placeholder="e.g. United States Agency for International Development"
                value={funderForm.name}
                onChange={(e) => setFunderForm((p) => ({ ...p, name: e.target.value }))}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Contact Person</Label>
              <Input
                placeholder="e.g. Dr. Aster Bekele"
                value={funderForm.contactPerson}
                onChange={(e) => setFunderForm((p) => ({ ...p, contactPerson: e.target.value }))}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  placeholder="donor@grant.org"
                  value={funderForm.email}
                  onChange={(e) => setFunderForm((p) => ({ ...p, email: e.target.value }))}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone</Label>
                <Input
                  placeholder="+251..."
                  value={funderForm.phone}
                  onChange={(e) => setFunderForm((p) => ({ ...p, phone: e.target.value }))}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreateFunderModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => createFunderMutation.mutate(funderForm)}
              disabled={!funderForm.code || !funderForm.name || createFunderMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4"
            >
              {createFunderMutation.isPending ? "Registering..." : "Save Donor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
