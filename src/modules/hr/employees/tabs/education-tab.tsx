/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Plus, Trash2, GraduationCap, Save, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";

const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field of study is required"),
  startDate: z.date(),
  endDate: z.date().optional(),
  current: z.boolean().default(false),
  grade: z.string().optional(),
});

const educationsFormSchema = z.object({
  educations: z.array(educationSchema),
});

type EducationsFormValues = z.infer<typeof educationsFormSchema>;

interface EducationTabProps {
  employeeId: string | null;
  onSave?: (data: any) => Promise<void>;
  isSaving?: boolean;
}

export const EducationTab = ({
  employeeId,
  onSave,
  isSaving = false,
}: EducationTabProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<EducationsFormValues>({
    resolver: zodResolver(educationsFormSchema) as any,
    defaultValues: {
      educations: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "educations",
  });

  const handleRemove = async (index: number) => {
    const row = form.getValues(`educations.${index}` as any) as any;
    if (employeeId && row?.id) {
      try {
        await api.delete(`/employees/${employeeId}/educations/${row.id}`);
      } catch (error: any) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to delete education",
          variant: "destructive",
        });
        return;
      }
    }
    remove(index);
  };

  useEffect(() => {
    if (employeeId) {
      fetchEducations();
    }
  }, [employeeId]);

  const fetchEducations = async () => {
    if (!employeeId) return;

    setLoading(true);
    try {
      const response = await api.get(`/employees/${employeeId}/educations`);
      const educations =
        response.data.data?.educations || response.data.educations || [];

      if (educations.length > 0) {
        const formatted = educations.map((edu: any) => ({
          ...edu,
          startDate: edu.startDate ? new Date(edu.startDate) : undefined,
          endDate: edu.endDate ? new Date(edu.endDate) : undefined,
        }));
        form.reset({ educations: formatted });
      } else {
        append({
          institution: "",
          degree: "",
          field: "",
          startDate: new Date(),
          current: false,
        });
      }
    } catch (error) {
      append({
        institution: "",
        degree: "",
        field: "",
        startDate: new Date(),
        current: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEducation = () => {
    append({
      institution: "",
      degree: "",
      field: "",
      startDate: new Date(),
      current: false,
    });
  };

  const handleSubmit = async (data: EducationsFormValues) => {
    if (!employeeId) {
      toast({
        title: "Error",
        description: "Please save basic information first",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        educations: data.educations.map((edu) => ({
          ...edu,
          startDate: edu.startDate
            ? format(edu.startDate, "yyyy-MM-dd")
            : undefined,
          endDate:
            edu.endDate && !edu.current
              ? format(edu.endDate, "yyyy-MM-dd")
              : undefined,
        })),
      };

      await api.post(`/employees/${employeeId}/educations`, payload);
      await fetchEducations();

      toast({
        title: "Success",
        description: "Education saved successfully",
      });

      if (onSave) {
        await onSave(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save education",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!employeeId) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <GraduationCap className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Education Section</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please save basic information first to add education details.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Education</span>
          <Badge variant="outline">{fields.length} Records</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No education added. Click "Add Education" to get started.
              </div>
            ) : (
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-4 p-4 border rounded-lg relative"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 text-destructive"
                      onClick={() => handleRemove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`educations.${index}.institution`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="University/School name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`educations.${index}.degree`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Degree *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Bachelor's, Master's"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`educations.${index}.field`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field of Study *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Computer Science"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`educations.${index}.startDate`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    {field.value
                                      ? format(field.value, "PPP")
                                      : "Pick a date"}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`educations.${index}.endDate`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                    disabled={form.watch(
                                      `educations.${index}.current`,
                                    )}
                                  >
                                    {field.value
                                      ? format(field.value, "PPP")
                                      : "Pick a date"}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`educations.${index}.current`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (checked) {
                                  form.setValue(
                                    `educations.${index}.endDate`,
                                    undefined,
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I am currently studying here</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`educations.${index}.grade`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade/GPA (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 3.8 GPA" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {index < fields.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddEducation}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Education
            </Button>

            <CardFooter className="px-0 pb-0 pt-4 flex justify-end">
              <Button type="submit" disabled={saving || isSaving}>
                {saving || isSaving ? "Saving..." : "Save Education"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
