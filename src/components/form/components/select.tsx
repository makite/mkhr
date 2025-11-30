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
} from "../../ui/field";

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
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
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
          value={field.state.value}
          onValueChange={field.handleChange}
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
              {defaultValue ? (
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
