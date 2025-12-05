import React from "react";
import { Input } from "../ui/input";

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  filterVariant = "",
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
  filterVariant?: "range" | "";
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <Input
      {...props}
      value={value}
      className={
        filterVariant === "range" ? "w-12 text-xs px-0 pl-1 text-center" : ""
      }
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
