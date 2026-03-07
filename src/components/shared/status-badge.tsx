/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: boolean | string;
  trueLabel?: string;
  falseLabel?: string;
  trueVariant?: "default" | "destructive" | "outline" | "secondary";
  falseVariant?: "default" | "destructive" | "outline" | "secondary";
  customMap?: Record<string, { label: string; variant: string }>;
  className?: string;
}

export function StatusBadge({
  status,
  trueLabel = "Active",
  falseLabel = "Inactive",
  trueVariant = "default",
  falseVariant = "destructive",
  customMap,
  className,
}: StatusBadgeProps) {
  if (customMap && typeof status === "string") {
    const config = customMap[status];
    if (config) {
      return (
        <Badge
          variant={config.variant as any}
          className={cn("capitalize", className)}
        >
          {config.label}
        </Badge>
      );
    }
  }

  const isActive = typeof status === "boolean" ? status : status === "true";
  const label = isActive ? trueLabel : falseLabel;
  const variant = isActive ? trueVariant : falseVariant;

  return (
    <Badge variant={variant} className={cn("capitalize", className)}>
      {label}
    </Badge>
  );
}
