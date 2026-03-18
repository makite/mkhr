/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Plus, Trash2, Briefcase } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

const experienceSchema = z
  .object({
    id: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    current: z.boolean().default(false),
    description: z.string().nullable().optional(),
    achievements: z.string().nullable().optional(),
  })
  .superRefine((val, ctx) => {
    const company = (val.company || "").trim();
    const position = (val.position || "").trim();
    const hasAny =
      company.length > 0 ||
      position.length > 0 ||
      !!val.startDate ||
      !!val.endDate ||
      !!val.description ||
      !!val.achievements;
    if (!hasAny) return; // allow completely empty rows

    if (!company) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["company"],
        message: "Company name is required",
      });
    }
    if (!position) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["position"],
        message: "Position is required",
      });
    }
    if (!val.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Start date is required",
      });
    }
  });

const experiencesFormSchema = z.object({
  experiences: z.array(experienceSchema),
});

type ExperiencesFormValues = z.infer<typeof experiencesFormSchema>;

interface ExperienceTabProps {
  employeeId: string | null;
  onSave?: (data: any) => Promise<void>;
  isSaving?: boolean;
}

export const ExperienceTab = ({
  employeeId,
  onSave,
  isSaving = false,
}: ExperienceTabProps) => {
  const { toast } = useToast();
  const [, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const dateToInput = (d?: Date) => (d ? format(d, "yyyy-MM-dd") : "");
  const inputToDate = (v: string) => {
    if (!v) return undefined;
    const d = new Date(`${v}T00:00:00`);
    return Number.isNaN(d.getTime()) ? undefined : d;
  };

  const form = useForm<ExperiencesFormValues>({
    resolver: zodResolver(experiencesFormSchema) as any,
    defaultValues: {
      experiences: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experiences",
    keyName: "fieldId",
  });

  const handleRemove = async (index: number) => {
    const row = form.getValues(`experiences.${index}` as any) as any;
    // If it exists on server, delete it first (CRUD)
    if (employeeId && row?.id) {
      try {
        await api.delete(`/employees/${employeeId}/experiences/${row.id}`);
      } catch (error: any) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to delete experience",
          variant: "destructive",
        });
        return;
      }
    }
    remove(index);
  };

  useEffect(() => {
    if (employeeId) {
      fetchExperiences();
    }
  }, [employeeId]);

  const fetchExperiences = async () => {
    if (!employeeId) return;

    setLoading(true);
    try {
      const response = await api.get(`/employees/${employeeId}/experiences`);
      const experiences =
        response.data.data?.experiences || response.data.experiences || [];

      if (experiences.length > 0) {
        // Convert string dates to Date objects
        const formatted = experiences.map((exp: any) => ({
          ...exp,
          startDate: exp.startDate ? new Date(exp.startDate) : undefined,
          endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          description: exp.description ?? "",
          achievements: exp.achievements ?? "",
        }));
        form.reset({ experiences: formatted });
      } else {
        append({
          company: "",
          position: "",
          startDate: new Date(),
          current: false,
        });
      }
    } catch (error) {
      append({
        company: "",
        position: "",
        startDate: new Date(),
        current: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExperience = () => {
    append({
      company: "",
      position: "",
      startDate: new Date(),
      current: false,
    });
  };

  const handleSubmit = async (data: ExperiencesFormValues) => {
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
      toast({ title: "Saving…", description: "Please wait" });
      // Format dates for API
      const nonEmpty = data.experiences.filter((exp: any) => {
        const company = String(exp.company || "").trim();
        const position = String(exp.position || "").trim();
        return company.length > 0 || position.length > 0 || !!exp.startDate || !!exp.endDate;
      });
      if (nonEmpty.length === 0) {
        toast({
          title: "Nothing to save",
          description: "Add at least one experience record.",
          variant: "destructive",
        });
        return;
      }
      const payload = {
        experiences: nonEmpty.map((exp) => ({
          ...exp,
          startDate: exp.startDate
            ? format(exp.startDate, "yyyy-MM-dd")
            : undefined,
          endDate:
            exp.endDate && !exp.current
              ? format(exp.endDate, "yyyy-MM-dd")
              : undefined,
        })),
      };

      await api.post(`/employees/${employeeId}/experiences`, payload);
      // Refresh so newly created rows get ids
      await fetchExperiences();

      toast({
        title: "Success",
        description: "Experience saved successfully",
      });

      if (onSave) {
        await onSave(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save experience",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInvalid = () => {
    const errs: any = form.formState.errors;
    const rows = Array.isArray(errs?.experiences) ? errs.experiences : [];

    // Find the first concrete field error and show it with row index.
    let msg: string | null = null;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const m = r?.company?.message || r?.position?.message || r?.startDate?.message;
      if (m) {
        msg = `Row ${i + 1}: ${m}`;
        break;
      }
    }

    // Fallback: stringify error keys for debugging (short).
    if (!msg) {
      try {
        const compact = JSON.stringify(errs)?.slice(0, 500);
        msg =
          compact && compact.length > 0
            ? `Validation details: ${compact}`
            : "Please fill required fields (Company, Position, Start Date).";
      } catch {
        msg = "Please fill required fields (Company, Position, Start Date).";
      }
    }

    toast({
      title: "Missing/invalid fields",
      description: msg,
      variant: "destructive",
    });
  };

  if (!employeeId) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Experience Section</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please save basic information first to add work experience.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Work Experience</span>
          <Badge variant="outline">{fields.length} Records</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
            className="space-y-6"
          >
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No experience added. Click "Add Experience" to get started.
              </div>
            ) : (
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div
                    key={(field as any).fieldId}
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
                        name={`experiences.${index}.company`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company *</FormLabel>
                            <FormControl>
                              <Input placeholder="Company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`experiences.${index}.position`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position *</FormLabel>
                            <FormControl>
                              <Input placeholder="Job title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`experiences.${index}.startDate`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date *</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                name={field.name}
                                ref={field.ref}
                                onBlur={field.onBlur}
                                value={dateToInput(field.value)}
                                onChange={(e) =>
                                  field.onChange(inputToDate(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`experiences.${index}.endDate`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                name={field.name}
                                ref={field.ref}
                                onBlur={field.onBlur}
                                disabled={!!form.watch(`experiences.${index}.current`)}
                                value={dateToInput(field.value)}
                                onChange={(e) =>
                                  field.onChange(inputToDate(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`experiences.${index}.current`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                const v = checked === true;
                                field.onChange(v);
                                if (v) {
                                  form.setValue(
                                    `experiences.${index}.endDate`,
                                    undefined,
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I currently work here</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`experiences.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Job description..."
                              {...field}
                            />
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
              onClick={handleAddExperience}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Experience
            </Button>

            <CardFooter className="px-0 pb-0 pt-4 flex justify-end">
              <Button type="submit" disabled={saving || isSaving}>
                {saving || isSaving ? "Saving..." : "Save Experience"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
