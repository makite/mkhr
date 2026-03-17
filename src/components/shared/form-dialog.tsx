/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "switch"
    | "date"
    | "icon"
    | "multiselect"
    | "radio";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormField[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isEditing?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  loading?: boolean;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  values,
  onChange,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isEditing = false,
  size = "md",
  loading = false,
}: FormDialogProps) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl",
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "radio": {
        const v = String(values[field.name] || "");
        const options = field.options || [];
        return (
          <div className={cn("space-y-2", field.className)}>
            {options.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={o.value}
                  checked={v === o.value}
                  onChange={() => onChange(field.name, o.value)}
                  disabled={field.disabled || loading}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        );
      }

      case "select":
        return (
          <Select
            value={
              field.required
                ? String(values[field.name] || "")
                : String(values[field.name] || "none")
            }
            onValueChange={(value) => onChange(field.name, value)}
            disabled={field.disabled || loading}
          >
            <SelectTrigger className={cn("w-full", field.className)}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {/* Add a default "None" option for optional selects */}
              {!field.required && (
                <SelectItem value="none">
                  {field.name === "parentId" ? "None (Root Level)" : "None"}
                </SelectItem>
              )}
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      //   case "switch":
      //     return (
      //       <Switch
      //         checked={values[field.name] || false}
      //         onCheckedChange={(checked) => onChange(field.name, checked)}
      //         disabled={field.disabled || loading}
      //       />
      //     );

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            value={values[field.name] || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            disabled={field.disabled || loading}
            className={cn("min-h-[100px]", field.className)}
          />
        );

      case "icon": {
        const v = String(values[field.name] || "");
        const q = v.trim().toLowerCase();
        const options = field.options || [];
        const matches = q
          ? options.filter((o) => o.value.toLowerCase().includes(q)).slice(0, 30)
          : options.slice(0, 30);

        return (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder={field.placeholder}
              value={v}
              onChange={(e) => onChange(field.name, e.target.value)}
              disabled={field.disabled || loading}
              className={cn(field.className)}
              autoComplete="off"
              spellCheck={false}
            />
            {matches.length > 0 && (
              <div className="max-h-48 overflow-auto rounded-md border bg-background">
                {matches.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => onChange(field.name, o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }

      case "multiselect": {
        const selected: string[] = Array.isArray(values[field.name])
          ? values[field.name]
          : [];
        const options = field.options || [];
        const [q, setQ] = ((): [string, (v: string) => void] => {
          // local state without React.useState to keep FormDialog simple:
          // store in values under a hidden key
          const key = `__q__${field.name}`;
          const cur = String(values[key] || "");
          return [
            cur,
            (v) => {
              onChange(key, v);
            },
          ];
        })();

        const query = q.trim().toLowerCase();
        const filtered = query
          ? options.filter(
              (o) =>
                o.label.toLowerCase().includes(query) ||
                o.value.toLowerCase().includes(query),
            )
          : options;

        const toggle = (value: string) => {
          const set = new Set(selected);
          if (set.has(value)) set.delete(value);
          else set.add(value);
          onChange(field.name, Array.from(set));
        };

        return (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder={field.placeholder || "Search..."}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              disabled={field.disabled || loading}
              autoComplete="off"
            />
            <div className="max-h-56 overflow-auto rounded-md border bg-background">
              {filtered.slice(0, 200).map((o) => {
                const checked = selected.includes(o.value);
                return (
                  <label
                    key={o.value}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(o.value)}
                      disabled={field.disabled || loading}
                    />
                    <span className="font-mono text-xs text-muted-foreground">
                      {o.value}
                    </span>
                    <span>{o.label}</span>
                  </label>
                );
              })}
              {filtered.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No matches
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Selected: {selected.length}
            </div>
          </div>
        );
      }

      case "date":
        return (
          <Input
            type="date"
            placeholder={field.placeholder}
            value={values[field.name] || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            disabled={field.disabled || loading}
            className={cn(field.className)}
          />
        );

      default:
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={values[field.name] || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            disabled={field.disabled || loading}
            className={cn(field.className)}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("w-full", sizeClasses[size])}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
          {fields.map((field) => (
            <div key={field.name} className="grid gap-2">
              <Label htmlFor={field.name} className="font-medium">
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {renderField(field)}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : isEditing ? (
              "Update"
            ) : (
              submitLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
