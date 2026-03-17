/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Languages } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

// Language schema
const languageSchema = z.object({
  id: z.string().optional(),
  language: z.string().min(1, "Language is required"),
  proficiency: z.enum([
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "NATIVE",
    "FLUENT",
  ]),
  read: z.boolean().default(false),
  write: z.boolean().default(false),
  speak: z.boolean().default(false),
  isPrimary: z.boolean().default(false),
});

const languagesFormSchema = z.object({
  languages: z.array(languageSchema),
});

type LanguagesFormValues = z.infer<typeof languagesFormSchema>;

interface LanguageTabProps {
  employeeId: string | null;
  onSave?: (data: any) => Promise<void>;
  isSaving?: boolean;
}

const proficiencyOptions = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "FLUENT", label: "Fluent" },
  { value: "NATIVE", label: "Native" },
];

export const LanguageTab = ({
  employeeId,
  onSave,
  isSaving = false,
}: LanguageTabProps) => {
  const { toast } = useToast();
  const [, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<LanguagesFormValues>({
    resolver: zodResolver(languagesFormSchema) as any,
    defaultValues: {
      languages: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  const handleRemove = async (index: number) => {
    const row = form.getValues(`languages.${index}` as any) as any;
    if (employeeId && row?.id) {
      try {
        await api.delete(`/employees/${employeeId}/languages/${row.id}`);
      } catch (error: any) {
        toast({
          title: "Error",
          description:
            error.response?.data?.message || "Failed to delete language",
          variant: "destructive",
        });
        return;
      }
    }
    remove(index);
  };

  // Fetch existing languages when employeeId is available
  useEffect(() => {
    if (employeeId) {
      fetchLanguages();
    }
  }, [employeeId]);

  const fetchLanguages = async () => {
    if (!employeeId) return;

    setLoading(true);
    try {
      const response = await api.get(`/employees/${employeeId}/languages`);
      const languages =
        response.data.data?.languages || response.data.languages || [];

      if (languages.length > 0) {
        form.reset({ languages });
      } else {
        // Add one empty row by default
        append({
          language: "",
          proficiency: "BEGINNER",
          read: false,
          write: false,
          speak: false,
          isPrimary: false,
        });
      }
    } catch (error) {
      // If endpoint doesn't exist yet, just add empty row
      append({
        language: "",
        proficiency: "BEGINNER",
        read: false,
        write: false,
        speak: false,
        isPrimary: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLanguage = () => {
    append({
      language: "",
      proficiency: "BEGINNER",
      read: false,
      write: false,
      speak: false,
      isPrimary: false,
    });
  };

  const handleSubmit = async (data: LanguagesFormValues) => {
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
      // Try to use dedicated endpoint if available
      await api.post(`/employees/${employeeId}/languages`, {
        languages: data.languages,
      });
      await fetchLanguages();

      toast({
        title: "Success",
        description: "Languages saved successfully",
      });

      if (onSave) {
        await onSave(data);
      }
    } catch (error: any) {
      // Fallback to general employee update
      try {
        await api.put(`/employees/${employeeId}`, {
          languages: data.languages,
        });
        toast({
          title: "Success",
          description: "Languages saved successfully",
        });
      } catch (fallbackError: any) {
        toast({
          title: "Error",
          description:
            fallbackError.response?.data?.message || "Failed to save languages",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (!employeeId) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-4">
            <Languages className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Language Section</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please save basic information first to add language details.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Languages</span>
          <Badge variant="outline">{fields.length} Languages</Badge>
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
                No languages added. Click "Add Language" to get started.
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
                        name={`languages.${index}.language`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., English, Amharic"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`languages.${index}.proficiency`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proficiency</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select proficiency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {proficiencyOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <FormField
                        control={form.control}
                        name={`languages.${index}.read`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Read</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`languages.${index}.write`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Write</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`languages.${index}.speak`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">Speak</FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`languages.${index}.isPrimary`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </FormControl>
                            <FormLabel className="!mt-0">
                              Primary Language
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

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
              onClick={handleAddLanguage}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Language
            </Button>

            <CardFooter className="px-0 pb-0 pt-4 flex justify-end">
              <Button type="submit" disabled={saving || isSaving}>
                {saving || isSaving ? "Saving..." : "Save Languages"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
