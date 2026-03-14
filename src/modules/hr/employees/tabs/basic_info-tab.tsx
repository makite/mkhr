/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  User,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Clock,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

import type { UseFormReturn } from "react-hook-form";
import type { BasicInfoValues } from "@/modules/hr/employees/schema/employeeSchema";
import type { EmployeeLookupData } from "@/modules/hr/employees/types/employee.type";

interface BasicInfoTabProps {
  form: UseFormReturn<BasicInfoValues>;
  lookupData: EmployeeLookupData;
  filteredPositions: any[];
  filteredScales: any[];
  selectedGradeId?: string;
  onSubmit: (data: BasicInfoValues) => Promise<void>;
  isSaving: boolean;
  isEdit?: boolean;
  readOnly?: boolean;
}

const SectionHeader = ({ icon: Icon, title, color }: any) => (
  <div className={`px-4 py-3 bg-gradient-to-r ${color} border-b`}>
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-full flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
      <span className="font-semibold">{title}</span>
    </div>
  </div>
);

export const BasicInfoTab = ({
  form,
  lookupData,
  filteredPositions,
  selectedGradeId,
  onSubmit,
  isSaving,
  isEdit = false,
  readOnly = false,
}: BasicInfoTabProps) => {
  const handleSubmit = async (data: BasicInfoValues) => {
    await onSubmit(data);
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>
                {isEdit ? "Edit Basic Information" : "Basic Information"}
              </CardTitle>
              <CardDescription>
                Personal, contact and employment details
              </CardDescription>
            </div>
          </div>

          <Badge variant="outline">Required *</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* PERSONAL INFO */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader
                icon={User}
                title="Personal Information"
                color="from-blue-50 to-white"
              />

              <div className="p-4 space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="titleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>

                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={readOnly}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select title" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {lookupData.titles?.map((title: any) => (
                              <SelectItem key={title.id} value={title.id}>
                                {title.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* First Name */}
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={readOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Last Name */}
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={readOnly} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Amharic Name */}
                <FormField
                  control={form.control}
                  name="fullNameAm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ሙሉ ስም</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={readOnly} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* CONTACT */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader
                icon={MapPin}
                title="Contact Information"
                color="from-green-50 to-white"
              />

              <div className="p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Phone size={16} />
                            <Input {...field} disabled={readOnly} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Mail size={16} />
                            <Input {...field} disabled={readOnly} />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={readOnly} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* EMPLOYMENT */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader
                icon={Briefcase}
                title="Employment Details"
                color="from-purple-50 to-white"
              />

              <div className="p-4 grid md:grid-cols-3 gap-4">
                {/* Grade */}
                <FormField
                  control={form.control}
                  name="gradeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={readOnly}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {lookupData.grades?.map((grade: any) => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Position */}
                <FormField
                  control={form.control}
                  name="positionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={readOnly || !selectedGradeId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !selectedGradeId
                                  ? "Select grade first"
                                  : "Select position"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {filteredPositions?.map((pos: any) => (
                            <SelectItem key={pos.id} value={pos.id}>
                              {pos.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Salary */}
                <FormField
                  control={form.control}
                  name="basicSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Basic Salary</FormLabel>

                      <FormControl>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} />
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                              )
                            }
                            disabled={readOnly}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* EXPERIENCE */}
            <div className="border rounded-lg overflow-hidden">
              <SectionHeader
                icon={Clock}
                title="Experience"
                color="from-orange-50 to-white"
              />

              <div className="p-4 grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="yearsOfExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                          disabled={readOnly}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relevantExperience"
                  render={({ field }) => (
                    <FormItem className="flex gap-3 border p-4 rounded">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(val) => field.onChange(!!val)}
                          disabled={readOnly}
                        />
                      </FormControl>

                      <div>
                        <FormLabel>Relevant Experience</FormLabel>
                        <FormDescription>
                          Mark if experience is required
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {!readOnly && (
              <CardFooter className="flex justify-end border-t pt-4">
                <Button type="submit" disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving
                    ? "Saving..."
                    : isEdit
                      ? "Update Employee"
                      : "Create Employee"}
                </Button>
              </CardFooter>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
