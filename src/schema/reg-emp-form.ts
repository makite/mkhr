import { formOptions } from "@tanstack/react-form";
import * as z from "zod";

const eighteenYearsAgo = new Date();
eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

export const GradesSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export const scaleSchema = z.object({
  id: z.string(),
  name: z.string(),
});

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
  tgHandle: z.string(),
  position: z.string(),
  levelOfEdu: z.string(),
  fieldOfStudy: z.string(),
  department: z.string(),
  experience: z.string(),
  empType: z.string(),
  grade: GradesSchema,
  scale: scaleSchema,
});

export const defaultValues: z.infer<typeof addEmpFormSchema> = {
  id: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dob: undefined,
  phoneNo: "",
  email: "",
  tgHandle: "",
  position: "",
  levelOfEdu: "",
  fieldOfStudy: "",
  department: "",
  experience: "",
  empType: "",
  grade: { id: "", name: "" },
  scale: { id: "", name: "" },
};

export const regEmpFormOpts = formOptions({
  defaultValues,
});

/*
{"id":"select","firstName":"Selomon","middleName":"Abebe","lastName":"Haile","phoneNo":"251909090909","email":"text@gmail.com","tgHandle":"@sola_19","position":"JCBS","department":"App and Sw Dev","levelOfEdu":"BSc","fieldOfStudy":"CS","experience":"1","empType":"permanent","annualLeave":16,"temporaryLeave":0}
*/
