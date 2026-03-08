import { z } from "zod";

// Combined Basic Information Schema (Personal + Employment)
export const basicInfoSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  fullNameAm: z.string().optional().default(""),
  titleId: z.string().optional().default(""),
  genderId: z.string().optional().default(""),
  dateOfBirthGrg: z.date().optional(),
  dateOfBirthEth: z.string().optional().default(""),
  nationality: z.string().optional().default(""),
  maritalStatus: z.string().optional().default(""),

  // Contact Information
  phone: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")).default(""),
  address: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  country: z.string().optional().default(""),
  postalCode: z.string().optional().default(""),

  // Employment Details
  employmentTypeId: z.string().optional().default(""),
  hireDate: z.date().optional(),
  departmentId: z.string().optional().default(""),
  positionId: z.string().optional().default(""),
  gradeId: z.string().optional().default(""),
  scaleId: z.string().optional().default(""),
  branchId: z.string().optional().default(""),
  supervisorId: z.string().optional().default(""),

  // Compensation
  basicSalary: z.number().optional(),
  currency: z.string().default("ETB"),
  pfContRate: z.number().default(0),
  tin: z.string().optional().default(""),
  pensionPfNumber: z.string().optional().default(""),
  bankAccount: z.string().optional().default(""),

  // Experience Summary
  yearsOfExperience: z.number().optional(),
  relevantExperience: z.boolean().default(false),

  // Status
  isActive: z.boolean().default(true),
});

export type BasicInfoValues = z.infer<typeof basicInfoSchema>;
