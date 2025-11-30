import { Button } from "@/components/ui/button";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { useAppForm } from "@/hooks/form-context";

import { addEmpFormSchema, regEmpFormOpts } from "@/schema/reg-emp-form";

const grades = ["I", "II", "III", "IV"];

const scales = ["1", "2", "3"];

const employeeTypes = ["Permanent", "Temporary"];
export default function EmployeeForm({
  employee,
}: {
  employee: z.infer<typeof addEmpFormSchema>;
}) {
  const form = useAppForm({
    ...regEmpFormOpts,
    validators: {
      onSubmit: addEmpFormSchema,
    },
    onSubmit: (data) => {
      console.log(data);
      console.log("form submitted");
    },
  });
  return (
    <Card className="shadow-none">
      <CardHeader>
        <div>form for employement registration</div>
      </CardHeader>
      <CardContent>
        <form
          id="reg-emp-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="grid grid-cols-[1fr_1fr_1fr_auto] gap-x-8">
            {/* <form.AppField
              name="id"
              children={(field) => {
                return (
                  <field.TextInput
                    label="id"
                    placeholder="001"
                    type="text"
                    // className="w-48"
                  />
                );
              }}
            /> */}
            <form.AppField
              name="firstName"
              children={(field) => {
                return (
                  <field.TextInput
                    label="First Name"
                    placeholder="Abebech"
                    type="text"
                    // className="w-48"
                  />
                );
              }}
            />
            <form.AppField
              name="middleName"
              children={(field) => {
                return (
                  <field.TextInput
                    label="Middle name"
                    placeholder="Alemu"
                    type="text"
                    // className="w-48"
                  />
                );
              }}
            />
            <form.AppField
              name="lastName"
              children={(field) => {
                return (
                  <field.TextInput
                    label="Last name"
                    placeholder="Kebede"
                    type="text"
                    // className="w-48"
                  />
                );
              }}
            />
            <form.AppField
              name="phoneNo"
              children={(field) => {
                return (
                  <field.TextInput
                    label="Phone Number"
                    placeholder="251909090909"
                    type="text"
                    // className="w-48"
                  />
                );
              }}
            />

            <form.AppField
              name="dob"
              children={(field) => {
                return (
                  <field.DatePicker
                    placeHolder="Pick a Date"
                    fieldLabel="Birth date"
                    // className="bg-amber-300 w-96"
                  />
                );
              }}
            />

            <form.AppField
              name="email"
              children={(field) => {
                return (
                  <field.TextInput
                    label="Email"
                    placeholder="test@gmail.com"
                    type="text"
                    // className="w-48"
                  />
                );
              }}
            />
            <form.AppField
              name="telUserName"
              children={(field) => {
                return (
                  <field.TextInput
                    label="Telegram User Name"
                    placeholder="@userName"
                    type="text"
                    // className="w-48"
                  />
                );
              }}
            />
            <form.AppField
              name="position"
              children={(field) => {
                return (
                  <field.TextInput
                    label="Position"
                    placeholder="JCBS"
                    type="text"
                    // className="w-48"
                  />
                );
              }}
            />
            <form.AppField
              name="department"
              children={(field) => {
                return (
                  <field.TextInput
                    label="Department"
                    placeholder="Software Development"
                    type="text"
                    // className="w-48"
                  />
                );
              }}
            />
            <form.AppField
              name="levelOfEdu"
              children={(field) => {
                return (
                  <field.TextInput
                    label="Level Of Education"
                    placeholder="Bsc."
                    type="text"
                    // className="w-48"
                  />
                );
              }}
            />

            <form.AppField
              name="fieldOfStudy"
              children={(field) => {
                return (
                  <field.TextInput
                    label="Field Of Study"
                    placeholder="Computer Science"
                    type="text"
                    // className="w-48"
                  />
                );
              }}
            />

            <form.AppField
              name="employeeType"
              children={(field) => {
                return (
                  <field.SelectEl
                    selectItems={employeeTypes}
                    selectId="select-emp-types"
                    label="Employee Type"
                    placeHolder="Select"
                  />
                );
              }}
            />

            <form.AppField
              name="experience"
              children={(field) => {
                return (
                  <field.TextInput
                    label="Experience"
                    placeholder="2"
                    type="text"
                    // className="w-48"
                  />
                );
              }}
            />

            <form.AppField
              name="grade"
              children={(field) => {
                return (
                  <field.SelectEl
                    selectItems={grades}
                    selectId="select-grades"
                    label="Grade"
                    placeHolder="Select"
                  />
                );
              }}
            />
            <form.AppField
              name="scale"
              children={(field) => {
                return (
                  <field.SelectEl
                    selectItems={scales}
                    selectId="select-scales"
                    label="Scale"
                    placeHolder="Select"
                  />
                );
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="button"
            form="reg-emp-form"
            variant="outline"
            onClick={() => form.reset()}
          >
            reset
          </Button>
          <Button type="submit" form="reg-emp-form">
            submit
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
