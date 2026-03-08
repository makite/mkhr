import { Badge } from "@/components/ui/badge";

// eslint-disable-next-line react-refresh/only-export-components
export const getRoleBadge = (role: string) => {
  const roleMap: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    SUPER_ADMIN: { label: "Super Admin", variant: "destructive" },
    ADMIN: { label: "Admin", variant: "default" },
    MANAGER: { label: "Manager", variant: "secondary" },
    HR: { label: "HR", variant: "secondary" },
    ACCOUNTANT: { label: "Accountant", variant: "secondary" },
    EMPLOYEE: { label: "Employee", variant: "outline" },
  };
  return roleMap[role] || { label: role, variant: "outline" };
};

export const RoleBadge = ({ role }: { role: string }) => {
  const { label, variant } = getRoleBadge(role);
  return (
    <Badge variant={variant} className="capitalize">
      {label}
    </Badge>
  );
};
