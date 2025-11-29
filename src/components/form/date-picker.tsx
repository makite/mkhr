import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFieldContext } from "@/hooks/form-context";
import { CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../ui/field";

export default function DatePicker({
  placeHolder,
  fieldLabel,
  description,
  className,
}: {
  placeHolder: string;
  description?: string;
  className?: string;
  fieldLabel: string;
}) {
  const field = useFieldContext<Date>();
  console.log(field);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid} className={className}>
      <FieldLabel htmlFor={field.name}>{fieldLabel}</FieldLabel>
      <FieldContent>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="size-3.5" />
              {field.state.value
                ? field.state.value.toLocaleDateString()
                : `${placeHolder}`}
            </Button>
          </PopoverTrigger>

          <PopoverContent>
            <Calendar
              mode="single"
              selected={field.state.value}
              defaultMonth={field.state.value ?? new Date()}
              captionLayout="dropdown"
              onSelect={(date) => {
                field.handleChange(date);
              }}
            />
          </PopoverContent>
        </Popover>
      </FieldContent>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
