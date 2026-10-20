/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export interface ImportSchema {
  key: "EMPLOYEE_ONBOARDING" | "SALARY_INCREMENT" | "PROMOTION" | "TERMINATION";
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

class ImportService {
  async getImportTypes(): Promise<ImportSchema[]> {
    const res = await api.get("/import/types");
    return res.data?.data?.types || [];
  }

  async downloadTemplate(type: string, filename: string): Promise<void> {
    const res = await api.get(`/import/template/${type}`, {
      responseType: "blob",
    });
    const blob = new Blob([res.data], {
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
