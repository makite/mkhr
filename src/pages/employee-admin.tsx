import { EmployeesTable } from "@/components/employee_admin/employees-table";
import TableToolbar from "@/components/table-toolbar";

export default function EmployeeAdmin() {
  return (
    <div>
      <TableToolbar />
      <EmployeesTable />;
    </div>
  );
}
