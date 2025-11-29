import { formOptions } from "@tanstack/react-form";
import * as z from "zod";

const eighteenYearsAgo = new Date();
eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

export const addEmpFormSchema = z.object({
  id: z.string(),
  firstName: z.string().min(3).max(50),
  middleName: z.string().min(3).max(50),
  lastName: z.string().min(3).max(50),
  dob: z.date().max(eighteenYearsAgo, {
    message: "You must be at least 18 years old",
  }),
  phoneNo: z.string().min(10),
  email: z.string(),
  telUserName: z.string(),
  position: z.string(),
  levelOfEdu: z.string(),
  fieldOfStudy: z.string(),
  department: z.string(),
  experience: z.string(),
  employeeType: z.string(),
  grade: z.string(),
  scale: z.string(),
});

export const defaultValues: z.infer<typeof addEmpFormSchema> = {
  id: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dob: undefined,
  phoneNo: "",
  email: "",
  telUserName: "",
  position: "",
  levelOfEdu: "",
  fieldOfStudy: "",
  department: "",
  experience: "",
  employeeType: "",
  grade: "",
  scale: "",
};

export const regEmpFormOpts = formOptions({
  defaultValues,
});
