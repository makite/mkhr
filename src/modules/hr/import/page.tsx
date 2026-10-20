/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router";
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
  Shield,
  Info,
  Eye,
  Download,
  TableProperties,
  Building,
  Briefcase,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  importService,
  type ValidationResult,
  type ImportSchema,
  type TemplatePreviewData,
} from "@/services/import-service";
import { toast } from "sonner";

interface TemplateColumnDef {
  col: string;
  key: string;
  header: string;
  required: boolean;
  type: string;
  sample: string | number;
  note: string;
  options?: string[];
  dropdownKey?: string;
}

interface TemplateSchemaDef {
  key: string;
  title: string;
  description: string;
  filename: string;
  sheetName: string;
  columns: TemplateColumnDef[];
  dropdowns: Record<string, string[]>;
}

// Master Baseline Template Schemas
const BASELINE_SCHEMAS: Record<string, TemplateSchemaDef> = {
  EMPLOYEE_ONBOARDING: {
    key: "EMPLOYEE_ONBOARDING",
    title: "Employee Master Roster Onboarding",
    description: "Import your complete workforce roster with departments, branches, positions, and starting salaries in a single spreadsheet.",
    filename: "employee_onboarding_template.xlsx",
    sheetName: "Employee Onboarding",
    columns: [
      { col: "A", key: "firstName", header: "First Name *", required: true, type: "Text", sample: "Selamawit", note: "Employee legal first name" },
      { col: "B", key: "lastName", header: "Last Name *", required: true, type: "Text", sample: "Kebede", note: "Employee father's / family name" },
      { col: "C", key: "fullNameAm", header: "Full Name (Amharic)", required: false, type: "Amharic Text", sample: "ሰላማዊት ከበደ", note: "Optional Amharic script name" },
      { col: "D", key: "title", header: "Title", required: false, type: "Dropdown", sample: "Ms.", note: "Honorific prefix", dropdownKey: "titles", options: ["Ato", "W/ro", "W/rt", "Dr.", "Eng.", "Mr.", "Ms.", "Mrs."] },
      { col: "E", key: "gender", header: "Gender *", required: true, type: "Dropdown", sample: "Female", note: "Gender identity", dropdownKey: "genders", options: ["Female", "Male"] },
      { col: "F", key: "dobGrg", header: "Date of Birth (YYYY-MM-DD)", required: false, type: "Date", sample: "1995-04-12", note: "Gregorian birth date" },
      { col: "G", key: "dobEth", header: "Date of Birth (Eth YYYY/MM/DD)", required: false, type: "Date", sample: "1987/08/04", note: "Ethiopian calendar birth date" },
      { col: "H", key: "empDateGrg", header: "Employment Date (YYYY-MM-DD) *", required: true, type: "Date", sample: "2024-02-01", note: "Official hire / start date" },
      { col: "I", key: "employmentType", header: "Employment Type *", required: true, type: "Dropdown", sample: "Full Time", note: "Contract type", dropdownKey: "employmentTypes", options: ["Full Time", "Contract", "Probation", "Internship", "Part Time"] },
      { col: "J", key: "department", header: "Department *", required: true, type: "Dropdown", sample: "Finance", note: "Assigned department (will auto-create if new)", dropdownKey: "departments", options: ["Finance", "Human Resources", "Information Technology", "Operations", "Legal & Compliance", "Supply Chain"] },
      { col: "K", key: "branch", header: "Branch *", required: true, type: "Dropdown", sample: "Head Office - Bole", note: "Assigned work location", dropdownKey: "branches", options: ["Head Office - Bole", "Kazanchis Branch", "Hawassa Branch", "Dire Dawa Branch", "Mekelle Branch"] },
      { col: "L", key: "position", header: "Position / Job Title *", required: true, type: "Dropdown", sample: "Senior Accountant", note: "Official job title", dropdownKey: "positions", options: ["Senior Accountant", "HR Specialist", "Software Engineer", "Operations Officer", "Internal Auditor"] },
      { col: "M", key: "grade", header: "Salary Grade", required: false, type: "Dropdown", sample: "Grade IV", note: "Compensation grade", dropdownKey: "grades", options: ["Grade I", "Grade II", "Grade III", "Grade IV", "Grade V", "Grade VI"] },
      { col: "N", key: "scale", header: "Salary Scale / Step", required: false, type: "Dropdown", sample: "Step 1", note: "Salary step within grade", dropdownKey: "scales", options: ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"] },
      { col: "O", key: "basicSalary", header: "Basic Salary (ETB) *", required: true, type: "Currency (ETB)", sample: "18,500", note: "Monthly gross salary in Ethiopian Birr" },
      { col: "P", key: "tin", header: "TIN Number", required: false, type: "Numeric Text", sample: "0098765432", note: "Tax identification number (10 digits)" },
      { col: "Q", key: "pensionPfNumber", header: "Pension / PF Number", required: false, type: "Text", sample: "PF-10023", note: "Provident fund or pension registration number" },
      { col: "R", key: "pfContRate", header: "PF Contribution Rate (%)", required: false, type: "Percentage", sample: "7", note: "Default is standard 7%" },
    ],
    dropdowns: {
      "Departments": ["Finance", "Human Resources", "Information Technology", "Operations", "Legal & Compliance"],
      "Branches": ["Head Office - Bole", "Kazanchis Branch", "Hawassa Branch", "Dire Dawa Branch"],
      "Job Positions": ["Senior Accountant", "HR Specialist", "Software Engineer", "Operations Officer"],
      "Genders": ["Female", "Male"],
      "Employment Types": ["Full Time", "Contract", "Probation", "Internship"],
      "Salary Grades": ["Grade I", "Grade II", "Grade III", "Grade IV", "Grade V", "Grade VI"],
      "Salary Steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
    },
  },

  SALARY_INCREMENT: {
    key: "SALARY_INCREMENT",
    title: "Bulk Salary Increments",
    description: "Apply company-wide or department salary raises by fixed Birr amount or percentage.",
    filename: "salary_increment_template.xlsx",
    sheetName: "Salary Increments",
    columns: [
      { col: "A", key: "employee", header: "Employee (ID - Name) *", required: true, type: "Dropdown", sample: "MK00001 - Biruk Tesfaye", note: "Choose active employee from list", dropdownKey: "activeEmployees", options: ["MK00001 - Biruk Tesfaye"] },
      { col: "B", key: "effectiveDate", header: "Effective Date (YYYY-MM-DD) *", required: true, type: "Date", sample: "2026-11-01", note: "Date new pay takes effect" },
      { col: "C", key: "incrementMode", header: "Increment Mode *", required: true, type: "Dropdown", sample: "Fixed Amount (ETB)", note: "Fixed Amount or Percentage", dropdownKey: "incrementModes", options: ["Fixed Amount (ETB)", "Percentage (%)"] },
      { col: "D", key: "amount", header: "Amount (ETB)", required: false, type: "Currency (ETB)", sample: "2,500", note: "Enter Birr amount if using fixed mode" },
      { col: "E", key: "percentage", header: "Percentage (%)", required: false, type: "Percentage", sample: "10", note: "Enter percentage (e.g. 10) if percentage mode" },
      { col: "F", key: "toScale", header: "To Scale / Step", required: false, type: "Dropdown", sample: "Step 2", note: "Optional target step", dropdownKey: "scales", options: ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"] },
      { col: "G", key: "reason", header: "Reason / Memo", required: false, type: "Text", sample: "Annual appraisal adjustment", note: "Management justification" },
    ],
    dropdowns: {
      "Active Employees": ["MK00001 - Biruk Tesfaye"],
      "Increment Modes": ["Fixed Amount (ETB)", "Percentage (%)"],
      "Salary Steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
    },
  },

  PROMOTION: {
    key: "PROMOTION",
    title: "Promotions & Lateral Transfers",
    description: "Promote employees to higher grades/positions or transfer between branches and departments.",
    filename: "promotion_transfer_template.xlsx",
    sheetName: "Promotions & Transfers",
    columns: [
      { col: "A", key: "employee", header: "Employee (ID - Name) *", required: true, type: "Dropdown", sample: "MK00001 - Biruk Tesfaye", note: "Choose active employee from list", dropdownKey: "activeEmployees", options: ["MK00001 - Biruk Tesfaye"] },
      { col: "B", key: "effectiveDate", header: "Effective Date (YYYY-MM-DD) *", required: true, type: "Date", sample: "2026-11-01", note: "Effective date of appointment" },
      { col: "C", key: "reason", header: "Action Reason *", required: true, type: "Dropdown", sample: "Promotion", note: "Promotion, Transfer, or Re-grade", dropdownKey: "promotionReasons", options: ["Promotion", "Lateral Transfer", "Re-grade", "Department Transfer"] },
      { col: "D", key: "toPosition", header: "Target Position *", required: true, type: "Dropdown", sample: "Lead Analyst", note: "New job position", dropdownKey: "positions", options: ["Lead Analyst", "Senior Accountant", "Operations Manager", "Finance Director"] },
      { col: "E", key: "toGrade", header: "Target Grade *", required: true, type: "Dropdown", sample: "Grade V", note: "New salary grade", dropdownKey: "grades", options: ["Grade I", "Grade II", "Grade III", "Grade IV", "Grade V", "Grade VI"] },
      { col: "F", key: "toScale", header: "Target Scale *", required: true, type: "Dropdown", sample: "Step 2", note: "New scale step", dropdownKey: "scales", options: ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"] },
      { col: "G", key: "toDepartment", header: "Target Department", required: false, type: "Dropdown", sample: "Finance", note: "Leave blank if unchanged", dropdownKey: "departments", options: ["Finance", "Human Resources", "Information Technology", "Operations"] },
      { col: "H", key: "toBranch", header: "Target Branch", required: false, type: "Dropdown", sample: "Head Office - Bole", note: "Leave blank if unchanged", dropdownKey: "branches", options: ["Head Office - Bole", "Kazanchis Branch", "Hawassa Branch"] },
      { col: "I", key: "basicSalary", header: "New Basic Salary (ETB) *", required: true, type: "Currency (ETB)", sample: "24,000", note: "Updated monthly gross pay" },
      { col: "J", key: "note", header: "Remarks / Justification", required: false, type: "Text", sample: "Promoted based on performance review", note: "Committee notes" },
    ],
    dropdowns: {
      "Active Employees": ["MK00001 - Biruk Tesfaye"],
      "Job Positions": ["Lead Analyst", "Senior Accountant", "Operations Manager"],
      "Salary Grades": ["Grade I", "Grade II", "Grade III", "Grade IV", "Grade V", "Grade VI"],
      "Salary Steps": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
      "Departments": ["Finance", "Human Resources", "Information Technology", "Operations"],
      "Branches": ["Head Office - Bole", "Kazanchis Branch", "Hawassa Branch"],
      "Promotion Reasons": ["Promotion", "Lateral Transfer", "Re-grade", "Department Transfer"],
    },
  },

  TERMINATION: {
    key: "TERMINATION",
    title: "Employee Terminations & Offboarding",
    description: "Record employee exits, resignations, contract expirations, or retirements with notice periods.",
    filename: "termination_template.xlsx",
    sheetName: "Terminations",
    columns: [
      { col: "A", key: "employee", header: "Employee (ID - Name) *", required: true, type: "Dropdown", sample: "MK00001 - Biruk Tesfaye", note: "Select departing employee", dropdownKey: "activeEmployees", options: ["MK00001 - Biruk Tesfaye"] },
      { col: "B", key: "applicationDate", header: "Notice Date (YYYY-MM-DD) *", required: true, type: "Date", sample: "2026-10-15", note: "Date notice was handed in" },
      { col: "C", key: "resignationDate", header: "Exit Date (YYYY-MM-DD) *", required: true, type: "Date", sample: "2026-11-15", note: "Last working day" },
      { col: "D", key: "reason", header: "Termination Reason *", required: true, type: "Dropdown", sample: "Voluntary Resignation", note: "Official reason", dropdownKey: "terminationReasons", options: ["Voluntary Resignation", "Contract Expiry", "Retirement", "Termination for Cause"] },
      { col: "E", key: "noticeDays", header: "Notice Period (Days)", required: false, type: "Number", sample: "30", note: "Standard 30 days notice" },
      { col: "F", key: "remark", header: "Exit Notes / Handover", required: false, type: "Text", sample: "Completed clearance and handover", note: "Exit clearance remarks" },
    ],
    dropdowns: {
      "Active Employees": ["MK00001 - Biruk Tesfaye"],
      "Termination Reasons": ["Voluntary Resignation", "Contract Expiry", "Retirement", "Termination for Cause"],
    },
  },

  USER_IMPORT: {
    key: "USER_IMPORT",
    title: "System User Accounts Import",
    description: "Bulk create login credentials, email addresses, and roles for staff members and system users.",
    filename: "user_accounts_template.xlsx",
    sheetName: "User Accounts",
    columns: [
      { col: "A", key: "firstName", header: "First Name *", required: true, type: "Text", sample: "Biruk", note: "Account owner's first name" },
      { col: "B", key: "lastName", header: "Last Name *", required: true, type: "Text", sample: "Tesfaye", note: "Account owner's last name" },
      { col: "C", key: "email", header: "Email Address *", required: true, type: "Email", sample: "biruk.tesfaye@mekuhr.et", note: "Unique company login email" },
      { col: "D", key: "username", header: "Username", required: false, type: "Text", sample: "biruk.tesfaye", note: "Defaults to email prefix if omitted" },
      { col: "E", key: "phone", header: "Phone Number", required: false, type: "Phone", sample: "+251911223344", note: "Mobile number" },
      { col: "F", key: "role", header: "Role *", required: true, type: "Dropdown", sample: "EMPLOYEE", note: "System security role", dropdownKey: "roles", options: ["EMPLOYEE", "HR", "HR_MANAGER", "ADMIN", "SUPER_ADMIN"] },
      { col: "G", key: "department", header: "Department", required: false, type: "Dropdown", sample: "Finance", note: "Assigned department link", dropdownKey: "departments", options: ["Finance", "Human Resources", "Information Technology", "Operations"] },
      { col: "H", key: "branch", header: "Branch", required: false, type: "Dropdown", sample: "Head Office - Bole", note: "Assigned branch link", dropdownKey: "branches", options: ["Head Office - Bole", "Kazanchis Branch", "Hawassa Branch"] },
      { col: "I", key: "password", header: "Initial Password", required: false, type: "Text", sample: "User@123456", note: "Default temporary password: User@123456" },
    ],
    dropdowns: {
      "System Roles": ["EMPLOYEE", "HR", "HR_MANAGER", "ADMIN", "SUPER_ADMIN"],
      "Departments": ["Finance", "Human Resources", "Information Technology", "Operations"],
      "Branches": ["Head Office - Bole", "Kazanchis Branch", "Hawassa Branch"],
    },
  },

  ROLE_IMPORT: {
    key: "ROLE_IMPORT",
    title: "Security Roles Import",
    description: "Import new access control roles into the system security model.",
    filename: "security_roles_template.xlsx",
    sheetName: "Security Roles",
    columns: [
      { col: "A", key: "name", header: "Role Name *", required: true, type: "Text", sample: "COMPLIANCE_OFFICER", note: "Unique uppercase role code (e.g. AUDITOR, PAYROLL_OFFICER)" },
      { col: "B", key: "description", header: "Description", required: false, type: "Text", sample: "Ensures compliance with company policies", note: "Functional description of role" },
    ],
    dropdowns: {
      "Existing System Roles": ["EMPLOYEE", "HR", "HR_MANAGER", "ADMIN", "SUPER_ADMIN"],
    },
  },
};

interface ImportPageProps {
  mode?: "hr" | "system-admin" | "all";
}

export default function UniversalImportPage({ mode }: ImportPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentMode = useMemo(() => {
    if (mode) return mode;
    if (location.pathname.includes("system-admin")) return "system-admin";
    if (location.pathname.includes("hr")) return "hr";
    return "all";
  }, [mode, location.pathname]);

  const defaultTab = currentMode === "system-admin" ? "USER_IMPORT" : "EMPLOYEE_ONBOARDING";
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validating, setValidating] = useState<boolean>(false);
  const [committing, setCommitting] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [commitSuccess, setCommitSuccess] = useState<{ count: number; message: string } | null>(null);

  // Template Visualization State
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<{ col: string; row: number; val: string; header: string } | null>(null);
  const [userSelectedDropdowns, setUserSelectedDropdowns] = useState<Record<string, string>>({});

  // Sync activeTab if currentMode changes
  useEffect(() => {
    if (currentMode === "system-admin" && activeTab !== "USER_IMPORT" && activeTab !== "ROLE_IMPORT") {
      setActiveTab("USER_IMPORT");
      resetAll();
    } else if (currentMode === "hr" && (activeTab === "USER_IMPORT" || activeTab === "ROLE_IMPORT")) {
      setActiveTab("EMPLOYEE_ONBOARDING");
      resetAll();
    }
  }, [currentMode]);

  // Load import schemas directly from backend with TanStack Query caching
  const { data: _importTypes } = useQuery<ImportSchema[]>({
    queryKey: ["import-types", currentMode],
    queryFn: () => importService.getImportTypes(currentMode === "all" ? undefined : currentMode),
    staleTime: 10 * 60 * 1000,
  });

  // Query live DB lookups & template preview dynamically from PostgreSQL
  const { data: liveTemplateData } = useQuery<TemplatePreviewData>({
    queryKey: ["template-preview-live", activeTab],
    queryFn: () => importService.getTemplatePreview(activeTab),
    staleTime: 5 * 60 * 1000,
  });

  // Merge baseline schema with live PostgreSQL database lookups
  const activeSchema: TemplateSchemaDef = useMemo(() => {
    const base = BASELINE_SCHEMAS[activeTab] || BASELINE_SCHEMAS.EMPLOYEE_ONBOARDING;
    if (!liveTemplateData) return base;

    // Build comprehensive dropdowns dictionary directly from database lookups
    const liveDropdowns: Record<string, string[]> = { ...base.dropdowns };

    if (liveTemplateData.dropdowns?.departments?.length) {
      liveDropdowns["Departments (DB)"] = liveTemplateData.dropdowns.departments;
    }
    if (liveTemplateData.dropdowns?.branches?.length) {
      liveDropdowns["Branches (DB)"] = liveTemplateData.dropdowns.branches;
    }
    if (liveTemplateData.dropdowns?.positions?.length) {
      liveDropdowns["Job Positions (DB)"] = liveTemplateData.dropdowns.positions;
    }
    if (liveTemplateData.dropdowns?.grades?.length) {
      liveDropdowns["Salary Grades (DB)"] = liveTemplateData.dropdowns.grades;
    }
    if (liveTemplateData.dropdowns?.scales?.length) {
      liveDropdowns["Salary Steps (DB)"] = liveTemplateData.dropdowns.scales;
    }
    if (liveTemplateData.dropdowns?.activeEmployees?.length) {
      liveDropdowns["Active Employees (DB)"] = liveTemplateData.dropdowns.activeEmployees;
    }
    if (liveTemplateData.dropdowns?.roles?.length) {
      liveDropdowns["System Roles (DB)"] = liveTemplateData.dropdowns.roles;
    }
    if (liveTemplateData.dropdowns?.titles?.length) {
      liveDropdowns["Honorific Titles (DB)"] = liveTemplateData.dropdowns.titles;
    }
    if (liveTemplateData.dropdowns?.genders?.length) {
      liveDropdowns["Genders (DB)"] = liveTemplateData.dropdowns.genders;
    }
    if (liveTemplateData.dropdowns?.employmentTypes?.length) {
      liveDropdowns["Employment Types (DB)"] = liveTemplateData.dropdowns.employmentTypes;
    }
    if (liveTemplateData.dropdowns?.terminationReasons?.length) {
      liveDropdowns["Termination Reasons (DB)"] = liveTemplateData.dropdowns.terminationReasons;
    }
    if (liveTemplateData.dropdowns?.promotionReasons?.length) {
      liveDropdowns["Promotion Reasons (DB)"] = liveTemplateData.dropdowns.promotionReasons;
    }
    if (liveTemplateData.dropdowns?.incrementModes?.length) {
      liveDropdowns["Increment Modes (DB)"] = liveTemplateData.dropdowns.incrementModes;
    }

    // Merge options into column definitions
    const mergedCols = base.columns.map((c) => {
      // Priority 1: Backend explicit column options
      const backendCol = liveTemplateData.columns?.find((bc) => bc.key === c.key);
      let liveOptions = backendCol?.options && backendCol.options.length > 0 ? backendCol.options : c.options;

      // Priority 2: Fallback to dropdown map
      if (!liveOptions || liveOptions.length === 0) {
        if (c.key === "department" || c.key === "toDepartment") liveOptions = liveTemplateData.dropdowns?.departments;
        else if (c.key === "branch" || c.key === "toBranch") liveOptions = liveTemplateData.dropdowns?.branches;
        else if (c.key === "position" || c.key === "toPosition") liveOptions = liveTemplateData.dropdowns?.positions;
        else if (c.key === "employee") liveOptions = liveTemplateData.dropdowns?.activeEmployees;
        else if (c.key === "grade" || c.key === "toGrade") liveOptions = liveTemplateData.dropdowns?.grades;
        else if (c.key === "scale" || c.key === "toScale") liveOptions = liveTemplateData.dropdowns?.scales;
        else if (c.key === "role") liveOptions = liveTemplateData.dropdowns?.roles;
        else if (c.key === "title") liveOptions = liveTemplateData.dropdowns?.titles;
        else if (c.key === "gender") liveOptions = liveTemplateData.dropdowns?.genders;
        else if (c.key === "employmentType") liveOptions = liveTemplateData.dropdowns?.employmentTypes;
        else if (c.key === "reason" && activeTab === "TERMINATION") liveOptions = liveTemplateData.dropdowns?.terminationReasons;
        else if (c.key === "reason" && activeTab === "PROMOTION") liveOptions = liveTemplateData.dropdowns?.promotionReasons;
        else if (c.key === "incrementMode") liveOptions = liveTemplateData.dropdowns?.incrementModes;
      }

      return {
        ...c,
        options: liveOptions && liveOptions.length > 0 ? liveOptions : c.options,
        sample: liveOptions && liveOptions.length > 0 && c.type === "Dropdown" ? liveOptions[0] : (backendCol?.sample ?? c.sample),
      };
    });

    return {
      ...base,
      sheetName: liveTemplateData.sheetName || base.sheetName,
      columns: mergedCols,
      dropdowns: liveDropdowns,
    };
  }, [activeTab, liveTemplateData]);

  // Set default selected cell when schema changes
  useEffect(() => {
    if (activeSchema.columns.length > 0) {
      setSelectedCell({
        col: activeSchema.columns[0].col,
        row: 1,
        val: activeSchema.columns[0].header,
        header: activeSchema.columns[0].header,
      });
      setUserSelectedDropdowns({});
    }
  }, [activeTab]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSelectedFile(null);
    setValidationResult(null);
    setCommitSuccess(null);
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      toast.info(`Preparing ${activeSchema.title} Excel template with live dropdowns...`);
      await importService.downloadTemplate(activeTab, activeSchema.filename);
      toast.success("Excel template downloaded with pre-filled dropdowns.");
    } catch {
      toast.error("Failed to download Excel template. Please try again.");
    } finally {
      setDownloading(false);
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
        toast.success(`Validated ${res.validCount} records successfully! Ready to import.`);
      } else if (res.validCount > 0) {
        toast.warning(
          `Check complete: ${res.validCount} valid records, ${res.invalidCount} rows require attention.`
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
      toast.error("No valid rows available to import.");
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
      toast.error(err.response?.data?.message || "Failed to import records.");
    } finally {
      setCommitting(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setCommitSuccess(null);
  };

  const isAdminMode = currentMode === "system-admin";
  const requiredCount = activeSchema.columns.filter((c) => c.required).length;
  const optionalCount = activeSchema.columns.filter((c) => !c.required).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              {isAdminMode ? (
                <>
                  <Shield className="h-7 w-7 text-blue-600" />
                  System Admin Data Import
                </>
              ) : (
                <>
                  <Database className="h-7 w-7 text-emerald-600" />
                  HR Data Import Hub
                </>
              )}
            </h1>
            <Badge
              variant="outline"
              className={
                isAdminMode
                  ? "border-blue-500/40 text-blue-600 bg-blue-50/50 text-xs px-2.5 py-0.5"
                  : "border-emerald-500/40 text-emerald-600 bg-emerald-50/50 text-xs px-2.5 py-0.5"
              }
            >
              Excel Ready
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            {isAdminMode
              ? "Bulk import user accounts and system security roles from standard Excel files."
              : "Bulk import new employees, salary adjustments, promotions, and terminations in seconds."}
          </p>
        </div>

        {/* Quick Navigation Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {isAdminMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/users")}
                className="gap-2 text-xs md:text-sm"
              >
                <Users className="h-4 w-4" />
                View Users
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/roles")}
                className="gap-2 text-xs md:text-sm"
              >
                <Shield className="h-4 w-4" />
                View Roles
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/hr/employees")}
                className="gap-2 text-xs md:text-sm"
              >
                <Users className="h-4 w-4" />
                View Employees
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/hr/actions-approval")}
                className="gap-2 text-xs md:text-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                HR Approvals
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Clean 3-Step Process Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/40 border border-border/60">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            1
          </div>
          <div>
            <h4 className="font-semibold text-xs text-foreground">1. Download Template</h4>
            <p className="text-[11px] text-muted-foreground">Pre-filled with company dropdowns</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            2
          </div>
          <div>
            <h4 className="font-semibold text-xs text-foreground">2. Upload Filled File</h4>
            <p className="text-[11px] text-muted-foreground">Automated verification before saving</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            3
          </div>
          <div>
            <h4 className="font-semibold text-xs text-foreground">3. Confirm & Import</h4>
            <p className="text-[11px] text-muted-foreground">1-click direct database save</p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {isAdminMode ? (
          <TabsList className="grid grid-cols-2 w-full max-w-md h-auto p-1 bg-muted/60 rounded-xl">
            <TabsTrigger
              value="USER_IMPORT"
              className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-xs md:text-sm">User Accounts</span>
            </TabsTrigger>
            <TabsTrigger
              value="ROLE_IMPORT"
              className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-xs md:text-sm">Security Roles</span>
            </TabsTrigger>
          </TabsList>
        ) : currentMode === "hr" ? (
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/60 rounded-xl">
            <TabsTrigger
              value="EMPLOYEE_ONBOARDING"
              className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4 text-emerald-600" />
              <span className="font-medium text-xs md:text-sm">New Employees</span>
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
              <span className="font-medium text-xs md:text-sm">Terminations</span>
            </TabsTrigger>
          </TabsList>
        ) : (
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full h-auto p-1 bg-muted/60 rounded-xl">
            <TabsTrigger value="EMPLOYEE_ONBOARDING" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="h-4 w-4 text-emerald-600" />
              <span className="font-medium text-xs">New Employees</span>
            </TabsTrigger>
            <TabsTrigger value="SALARY_INCREMENT" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-xs">Increments</span>
            </TabsTrigger>
            <TabsTrigger value="PROMOTION" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <UserCheck className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-xs">Promotions</span>
            </TabsTrigger>
            <TabsTrigger value="TERMINATION" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <UserX className="h-4 w-4 text-rose-600" />
              <span className="font-medium text-xs">Terminations</span>
            </TabsTrigger>
            <TabsTrigger value="USER_IMPORT" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-xs">Users</span>
            </TabsTrigger>
            <TabsTrigger value="ROLE_IMPORT" className="flex items-center gap-2 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Shield className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-xs">Roles</span>
            </TabsTrigger>
          </TabsList>
        )}

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
                      if (activeTab === "USER_IMPORT") navigate("/users");
                      else if (activeTab === "ROLE_IMPORT") navigate("/roles");
                      else if (activeTab === "EMPLOYEE_ONBOARDING") navigate("/hr/employees");
                      else navigate("/hr/actions-approval");
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

          {/* Clean 2-Column Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* Step 1: Download Template Card - Clean & Business Friendly */}
            <Card className="border border-border/80 shadow-xs flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-semibold bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                    Step 1: Download
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <Database className="h-3.5 w-3.5 text-emerald-600" /> Database Dropdowns Included
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                    Download Excel Template
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeSchema.description}
                  </p>
                </div>

                <div className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground space-y-1.5 border border-border/60">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-blue-500" /> How It Works for You:
                  </span>
                  <p>
                    Open the file in Microsoft Excel or Google Sheets. Your company's departments, branches, and positions are already pre-loaded as dropdown selections. No technical codes or IDs are needed.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-border/50 mt-5">
                <Button
                  onClick={() => setPreviewModalOpen(true)}
                  variant="outline"
                  className="w-full text-xs sm:text-sm font-medium gap-2 py-2.5"
                >
                  <Eye className="h-4 w-4 text-blue-600" />
                  Preview Template
                </Button>

                <Button
                  onClick={handleDownloadTemplate}
                  disabled={downloading}
                  className="w-full bg-[#107c41] hover:bg-[#0c5c30] text-white text-xs sm:text-sm font-semibold gap-2 py-2.5 shadow-xs"
                >
                  {downloading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> Download Template (.xlsx)
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Step 2: Upload File Card - Clean & Business Friendly */}
            <Card className="border border-border/80 shadow-xs flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-semibold bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300">
                    Step 2: Upload
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <FileCheck className="h-3.5 w-3.5 text-blue-600" /> Safe Verification
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-600" />
                    Upload Completed File
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload your filled spreadsheet. Our system will check every row and show you a preview before saving.
                  </p>
                </div>

                <label className="border-2 border-dashed border-border/80 hover:border-emerald-500/60 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40">
                  <Upload className="h-7 w-7 text-muted-foreground" />
                  <div className="text-center">
                    <span className="text-xs font-semibold text-foreground">
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
                  <div className="flex items-center justify-between text-xs bg-muted/60 px-3.5 py-2 rounded-lg border border-border/60">
                    <span className="truncate max-w-[280px] font-medium flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      {selectedFile.name}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-5 border-t border-border/50 mt-5">
                <Button
                  onClick={handleValidate}
                  disabled={!selectedFile || validating}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 shadow-xs text-xs sm:text-sm"
                >
                  {validating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Checking Rows...
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-4 w-4 mr-2" /> Check Spreadsheet & Preview
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Step 3: Interactive Validation Preview Table */}
          {validationResult && (
            <Card className="border border-border/80 shadow-xs w-full">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-600" />
                      Spreadsheet Verification Summary
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Review parsed records below before saving them to the database.
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
                <div className="overflow-x-auto max-h-[460px] custom-scrollbar">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="w-12 text-center text-xs">#</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        {activeTab === "USER_IMPORT" && (
                          <>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs">Email</TableHead>
                            <TableHead className="text-xs">Role</TableHead>
                            <TableHead className="text-xs">Department</TableHead>
                            <TableHead className="text-xs">Branch</TableHead>
                          </>
                        )}
                        {activeTab === "ROLE_IMPORT" && (
                          <>
                            <TableHead className="text-xs">Role Name</TableHead>
                            <TableHead className="text-xs">Description</TableHead>
                          </>
                        )}
                        {activeTab === "EMPLOYEE_ONBOARDING" && (
                          <>
                            <TableHead className="text-xs">Employee Name</TableHead>
                            <TableHead className="text-xs">Amharic Name</TableHead>
                            <TableHead className="text-xs">Department</TableHead>
                            <TableHead className="text-xs">Branch</TableHead>
                            <TableHead className="text-xs">Position</TableHead>
                            <TableHead className="text-xs">Basic Salary</TableHead>
                            <TableHead className="text-xs">TIN</TableHead>
                          </>
                        )}
                        {activeTab === "SALARY_INCREMENT" && (
                          <>
                            <TableHead className="text-xs">Employee</TableHead>
                            <TableHead className="text-xs">Effective Date</TableHead>
                            <TableHead className="text-xs">Mode</TableHead>
                            <TableHead className="text-xs">Increase</TableHead>
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
                            <TableHead className="text-xs">Basic Salary</TableHead>
                          </>
                        )}
                        {activeTab === "TERMINATION" && (
                          <>
                            <TableHead className="text-xs">Employee</TableHead>
                            <TableHead className="text-xs">Exit Date</TableHead>
                            <TableHead className="text-xs">Reason</TableHead>
                            <TableHead className="text-xs">Notice Days</TableHead>
                          </>
                        )}
                        <TableHead className="text-xs">Notes / Errors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.errors?.map((errRow, idx) => (
                        <TableRow key={`err-${idx}`} className="bg-rose-50/40 dark:bg-rose-950/20">
                          <TableCell className="text-center font-mono text-xs text-muted-foreground">
                            {errRow.row}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                              Error
                            </Badge>
                          </TableCell>
                          <TableCell colSpan={6} className="text-xs text-rose-600 font-medium">
                            <div className="space-y-0.5">
                              {errRow.errors?.map((e: any, eIdx: number) => (
                                <div key={eIdx} className="flex items-center gap-1.5">
                                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                  <span>{e.field ? `[${e.field}]: ` : ""}{e.message}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {validationResult.validRows?.map((row, idx) => {
                        const isInvalid = !row.isValid;
                        return (
                          <TableRow
                            key={`valid-${idx}`}
                            className={isInvalid ? "bg-rose-50/30 dark:bg-rose-950/10" : "hover:bg-muted/30"}
                          >
                            <TableCell className="text-center font-mono text-xs text-muted-foreground">
                              {row._rowNumber || idx + 2}
                            </TableCell>
                            <TableCell>
                              {isInvalid ? (
                                <Badge variant="destructive" className="text-[10px]">
                                  Invalid
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px]">
                                  Valid
                                </Badge>
                              )}
                            </TableCell>

                            {activeTab === "USER_IMPORT" && (
                              <>
                                <TableCell className="font-medium text-xs">
                                  {row.firstName} {row.lastName}
                                </TableCell>
                                <TableCell className="text-xs font-mono text-muted-foreground">
                                  {row.email}
                                </TableCell>
                                <TableCell className="text-xs">
                                  <Badge variant="outline" className="text-[10px]">
                                    {row.role}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs">{row.displayDept || "—"}</TableCell>
                                <TableCell className="text-xs">{row.displayBranch || "—"}</TableCell>
                              </>
                            )}

                            {activeTab === "ROLE_IMPORT" && (
                              <>
                                <TableCell className="font-medium text-xs">
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {row.name}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {row.description || "—"}
                                </TableCell>
                              </>
                            )}

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
                        Ready to import <strong>{validationResult.validCount} records</strong> directly into the database.
                      </span>
                    ) : (
                      <span className="text-rose-600">
                        Please update the rows marked with errors in Excel and upload again.
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
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Import {validationResult.validCount} Records Now
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

      {/* FULL-WIDTH RESPONSIVE DESKTOP EXCEL VISUALIZER MODAL */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-none w-[98vw] max-w-[98vw] !max-w-[98vw] h-[92vh] max-h-[95vh] flex flex-col p-0 overflow-hidden border border-border shadow-2xl bg-background rounded-2xl"
        >
          {/* Authentic Excel Application Header Bar */}
          <div className="bg-[#107c41] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 select-none">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0 shadow-xs">
                <FileSpreadsheet className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base md:text-lg tracking-tight text-white">
                    {activeSchema.filename}
                  </span>
                  <Badge className="bg-emerald-950/60 hover:bg-emerald-950/80 text-emerald-200 border-0 text-[10px] font-mono">
                    Microsoft Excel Compatible
                  </Badge>
                </div>
                <p className="text-xs text-emerald-100/90 font-normal">
                  Worksheet: <span className="font-semibold text-white">[{activeSchema.sheetName}]</span> • Live Database Dropdowns Embedded
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs px-2.5 py-1">
                {activeSchema.columns.length} Columns
              </Badge>
              <Badge className="bg-emerald-900/80 text-emerald-200 border-0 text-xs px-2.5 py-1">
                {requiredCount} Required
              </Badge>
              <Badge className="bg-white/10 text-white/90 border-0 text-xs px-2.5 py-1">
                {optionalCount} Optional
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewModalOpen(false)}
                className="text-white hover:bg-white/20 ml-2 text-xs"
              >
                ✕ Close
              </Button>
            </div>
          </div>

          {/* Excel Formula Bar (fx) & Cell Inspector */}
          <div className="bg-muted/40 border-b border-border/80 px-4 py-2 flex items-center gap-3 text-xs shrink-0 font-mono">
            <div className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-md shadow-2xs">
              <span className="text-[10px] text-muted-foreground font-sans">Cell:</span>
              <span className="font-bold text-foreground">
                {selectedCell ? `${selectedCell.col}${selectedCell.row}` : "A1"}
              </span>
            </div>
            <div className="text-muted-foreground font-serif italic text-base select-none">fx</div>
            <div className="flex-1 bg-background border border-border px-3 py-1 rounded-md text-foreground font-sans text-xs truncate shadow-2xs">
              {selectedCell ? selectedCell.val : activeSchema.columns[0]?.header || ""}
            </div>
            <div className="text-xs text-muted-foreground font-sans hidden md:flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-blue-500" />
              <span>Click any cell to inspect or test dropdowns in Row 3</span>
            </div>
          </div>

          {/* Main Visualizer Body - Full Width Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {/* The Actual Simulated Excel Spreadsheet Grid */}
            <div className="border-2 border-[#107c41]/40 rounded-xl overflow-hidden bg-background shadow-sm w-full">
              <div className="bg-[#107c41]/10 px-4 py-2.5 border-b border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#107c41] dark:text-emerald-400 flex items-center gap-2">
                  <TableProperties className="h-4 w-4" />
                  Exact Spreadsheet Layout Preview
                </span>
                <span className="text-muted-foreground text-[11px] font-medium">
                  Row 1 = Headers • Row 2 = Sample Guidance • Row 3 = Live Dropdowns from Database
                </span>
              </div>

              <div className="overflow-x-auto max-h-[460px] custom-scrollbar w-full">
                <table className="w-full border-collapse text-xs select-none min-w-[1300px]">
                  {/* Excel Column Letters Bar (A, B, C, D, ...) */}
                  <thead>
                    <tr className="bg-muted/80 text-muted-foreground border-b border-border">
                      <th className="w-[50px] min-w-[50px] text-center font-mono py-1.5 px-2 bg-muted border-r border-border text-xs font-semibold">
                        #
                      </th>
                      {activeSchema.columns.map((c, idx) => (
                        <th
                          key={idx}
                          className="font-mono text-center py-1.5 px-3 border-r border-border/70 text-xs font-semibold text-foreground bg-muted/60 min-w-[170px]"
                        >
                          {c.col}
                        </th>
                      ))}
                    </tr>

                    {/* Row 1: Header Row (Dark Solid Header like Microsoft Excel) */}
                    <tr className="bg-slate-900 text-white font-medium border-b border-slate-700">
                      <td className="text-center font-mono py-2.5 px-2 bg-slate-950 border-r border-slate-800 text-xs text-slate-400 font-bold">
                        1
                      </td>
                      {activeSchema.columns.map((c, idx) => {
                        const isCurrent = selectedCell?.col === c.col && selectedCell?.row === 1;
                        return (
                          <td
                            key={idx}
                            onClick={() => setSelectedCell({ col: c.col, row: 1, val: c.header, header: c.header })}
                            className={`px-3 py-2.5 border-r border-slate-800 whitespace-nowrap cursor-pointer transition-all ${
                              isCurrent ? "ring-2 ring-emerald-400 bg-slate-800" : "hover:bg-slate-800/80"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-xs tracking-tight text-slate-100">
                                {c.header}
                              </span>
                              {c.required ? (
                                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                                  REQUIRED
                                </span>
                              ) : (
                                <span className="text-[10px] bg-slate-700/80 text-slate-300 px-1.5 py-0.5 rounded">
                                  OPTIONAL
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody>
                    {/* Row 2: Example Guidance Row (Italic, soft green fill) */}
                    <tr className="bg-emerald-50/50 dark:bg-emerald-950/25 border-b border-border/80 text-foreground italic">
                      <td className="text-center font-mono py-2.5 px-2 bg-muted/70 border-r border-border text-xs font-medium text-muted-foreground">
                        2 (Sample)
                      </td>
                      {activeSchema.columns.map((c, idx) => {
                        const isCurrent = selectedCell?.col === c.col && selectedCell?.row === 2;
                        return (
                          <td
                            key={idx}
                            onClick={() => setSelectedCell({ col: c.col, row: 2, val: String(c.sample), header: c.header })}
                            className={`px-3 py-2.5 border-r border-border/60 whitespace-nowrap cursor-pointer font-normal ${
                              isCurrent ? "ring-2 ring-emerald-500 bg-emerald-100/70 dark:bg-emerald-900/50 font-semibold" : "hover:bg-muted/40"
                            }`}
                          >
                            <span>{c.sample}</span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Row 3: Live Interactive Data Entry Row with Real Dropdowns */}
                    <tr className="border-b border-border bg-background hover:bg-muted/10">
                      <td className="text-center font-mono py-2.5 px-2 bg-muted/70 border-r border-border text-xs font-medium text-muted-foreground">
                        3 (Entry)
                      </td>
                      {activeSchema.columns.map((c, idx) => {
                        const isCurrent = selectedCell?.col === c.col && selectedCell?.row === 3;
                        const hasDropdown = c.type === "Dropdown" && c.options && c.options.length > 0;
                        const currentValue = userSelectedDropdowns[c.key] || (hasDropdown ? c.options![0] : "");

                        return (
                          <td
                            key={idx}
                            onClick={() =>
                              setSelectedCell({
                                col: c.col,
                                row: 3,
                                val: hasDropdown ? currentValue : `[Enter ${c.type} value]`,
                                header: c.header,
                              })
                            }
                            className={`px-2.5 py-2 border-r border-border/60 whitespace-nowrap cursor-pointer ${
                              isCurrent ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/40" : "hover:bg-muted/20"
                            }`}
                          >
                            {hasDropdown ? (
                              <div className="relative">
                                <select
                                  value={currentValue}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setUserSelectedDropdowns((prev) => ({ ...prev, [c.key]: val }));
                                    setSelectedCell({ col: c.col, row: 3, val, header: c.header });
                                  }}
                                  className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-200 rounded px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs appearance-none pr-6"
                                >
                                  {c.options!.map((opt, oIdx) => (
                                    <option key={oIdx} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none text-[10px] font-bold">
                                  ▼
                                </span>
                              </div>
                            ) : (
                              <div className="px-2 py-1 text-muted-foreground/60 italic text-xs">
                                Enter {c.type}...
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Rows 4 & 5: Empty Grid Lines */}
                    {[4, 5].map((rowNum) => (
                      <tr key={rowNum} className="border-b border-border/40 bg-background hover:bg-muted/5">
                        <td className="text-center font-mono py-2 px-2 bg-muted/30 border-r border-border text-xs text-muted-foreground/50">
                          {rowNum}
                        </td>
                        {activeSchema.columns.map((_, idx) => (
                          <td key={idx} className="px-3 py-2 border-r border-border/20 text-muted-foreground/30">
                            &nbsp;
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Excel Bottom Worksheet Tabs Bar */}
              <div className="bg-muted/80 px-4 py-2 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs select-none">
                <div className="flex items-center gap-1.5">
                  <div className="bg-background text-foreground font-semibold px-3 py-1 rounded-t border-t-2 border-t-[#107c41] border-x border-border shadow-2xs flex items-center gap-2 text-xs">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-[#107c41]" />
                    {activeSchema.sheetName}
                  </div>
                  <div className="text-muted-foreground px-2.5 py-1 text-xs italic flex items-center gap-1.5 opacity-80">
                    <Database className="h-3.5 w-3.5 text-blue-500" />
                    Lookups (Embedded Database Sheet)
                  </div>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-3">
                  <span>💡 Tip: Click the dropdown menus in Row 3 to test live selections</span>
                </div>
              </div>
            </div>

            {/* Live Database Dropdown Values Explorer */}
            <Card className="border border-border/80 shadow-xs w-full">
              <CardHeader className="py-3 px-5 bg-muted/30 border-b border-border/60">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-600" />
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Live Options Loaded from Database (Available in Excel Dropdowns)
                    </CardTitle>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    Automatically populated from your ERP PostgreSQL database
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {Object.entries(activeSchema.dropdowns).map(([category, items], idx) => (
                    <div key={idx} className="rounded-xl border border-border/70 p-3.5 bg-background shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          {category.includes("Department") ? (
                            <Building className="h-3.5 w-3.5 text-blue-600" />
                          ) : category.includes("Branch") ? (
                            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          ) : category.includes("Position") ? (
                            <Briefcase className="h-3.5 w-3.5 text-purple-600" />
                          ) : category.includes("Employee") ? (
                            <Users className="h-3.5 w-3.5 text-indigo-600" />
                          ) : (
                            <Database className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                          {category}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                          {items.length} options
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto custom-scrollbar">
                        {items.map((it, iIdx) => (
                          <Badge key={iIdx} variant="secondary" className="text-[11px] font-normal py-0.5">
                            {it}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modal Footer with Direct Download Button */}
          <DialogFooter className="bg-muted/40 px-5 py-3.5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                Downloaded template will have all these database dropdowns pre-embedded in Excel.
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewModalOpen(false)}
                className="text-xs sm:text-sm"
              >
                Close Preview
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setPreviewModalOpen(false);
                  handleDownloadTemplate();
                }}
                disabled={downloading}
                className="bg-[#107c41] hover:bg-[#0c5c30] text-white font-semibold shadow-xs gap-2 text-xs sm:text-sm px-4 py-2"
              >
                {downloading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" /> Download Template (.xlsx)
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
