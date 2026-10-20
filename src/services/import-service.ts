/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export type ImportKey =
  | "EMPLOYEE_ONBOARDING"
  | "SALARY_INCREMENT"
  | "PROMOTION"
  | "TERMINATION"
  | "USER_IMPORT"
  | "ROLE_IMPORT"
  | string;

export interface ImportSchema {
  key: ImportKey;
  module?: "hr" | "system-admin" | string;
  title: string;
  description: string;
  templateFilename: string;
  requiredFields: string[];
}

export interface ValidationErrorItem {
  row: number;
  errors: { field: string; message: string }[];
}

export interface ValidationResult {
  type: string;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  errors: ValidationErrorItem[];
  preview: any[];
  validRows: any[];
}

export interface CommitResult {
  count: number;
  message: string;
}

export interface TemplateColumn {
  col: string;
  key: string;
  header: string;
  required: boolean;
  type: string;
  sample: string | number;
  note: string;
  options?: string[];
}

export interface TemplatePreviewData {
  type: string;
  title: string;
  description: string;
  filename: string;
  sheetName: string;
  columns: TemplateColumn[];
  totalColumns: number;
  requiredCount: number;
  optionalCount: number;
  dropdowns: Record<string, string[]>;
}

class ImportService {
  async getImportTypes(module?: string): Promise<ImportSchema[]> {
    const res = await api.get("/import/types", {
      params: module ? { module } : undefined,
    });
    return res.data?.data?.types || [];
  }

  async getTemplatePreview(type: string): Promise<TemplatePreviewData> {
    const res = await api.get(`/import/preview/${type}`);
    return res.data?.data;
  }

  async downloadTemplate(type: string, filename: string): Promise<void> {
    const res: any = await api.get(`/import/template/${type}`, {
      responseType: "blob",
    });
    
    // In Axios, res is already the Blob when using response.data interceptor
    const blob =
      res instanceof Blob
        ? res
        : new Blob([res?.data ?? res], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || `${type.toLowerCase()}_template.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async validateUpload(type: string, file: File): Promise<ValidationResult> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/import/validate/${type}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data;
  }

  async commitBatch(type: string, validRows: any[]): Promise<CommitResult> {
    const res = await api.post(`/import/commit/${type}`, { validRows });
    return res.data?.data;
  }
}

export const importService = new ImportService();
