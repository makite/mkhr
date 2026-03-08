import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFieldContext } from "@/hooks/form-context";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../ui/field";

export default function SelectEl({
  selectItems,
  label,
  selectId,
  placeHolder,
  defaultValue,
  description,
  className,
}: {
  selectItems: string[];
  label: string;
  selectId: string;
  placeHolder: string;
  defaultValue?: string;
  className?: string;
  description?: string;
}) {
  const field = useFieldContext<any>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const rawValue = field.state.value;
  const displayValue =
    typeof rawValue === "object" && rawValue !== null
      ? rawValue.name // Assuming your objects always use 'name' for the label
      : rawValue;
  return (
    <Field
      // orientation="responsive"
      data-invalid={isInvalid}
      className={className}
    >
      <FieldLabel htmlFor={selectId}>{label}</FieldLabel>

      <FieldContent>
        <Select
          name={field.name}
          value={displayValue || undefined}
          onValueChange={field.handleChange}
          defaultValue={defaultValue}
        >
          <SelectTrigger
            id={selectId}
            aria-invalid={isInvalid}
            className="max-w-[120px]"
          >
            <SelectValue placeholder={placeHolder} />
          </SelectTrigger>
          <SelectContent
            position="item-aligned"
            // className="bg-blue-300 "
          >
            <SelectGroup>
              <SelectLabel>{label}</SelectLabel>
              {defaultValue && !selectItems.includes(defaultValue) ? (
                <SelectItem value={defaultValue}>{defaultValue}</SelectItem>
              ) : undefined}
              <SelectSeparator />
              {selectItems.map((item) => (
                <SelectItem value={item} key={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {description && <FieldDescription>{description}</FieldDescription>}
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </FieldContent>
    </Field>
  );
}
