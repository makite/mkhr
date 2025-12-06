import {
  EmployeesTable,
  type Employee,
} from "@/components/employee_admin/employees-table";
import EmployeeForm from "@/components/form/employee-form";
import TableToolbar from "@/components/table-toolbar";
import { useMemo, useState } from "react";
const initialEmployees: Employee[] = [
  {
    id: "Emp001",
    firstName: "Selomon",
    middleName: "Abebe",
    lastName: "Haile",
    dob: new Date("1999-08-12"),
    phoneNo: "251909090909",
    email: "text@gmail.com",
    tgHandle: "@sola_19",
    position: "JCBS",
    department: "App and Sw Dev",
    levelOfEdu: "BSc",
    fieldOfStudy: "CS",
    grade: {
      id: "3u1reuv4",
      name: "II",
    },
    scale: {
      id: "m5gr84i9",
      name: "1",
    },
    experience: "1",
    empType: "Permanent",
    annualLeave: 16,
    temporaryLeave: 0,
  },
  {
    id: "Emp002",
    firstName: "Berekt",
    middleName: "Weldegiorgis",
    lastName: "Tasew",
    dob: new Date("1995-01-12"),
    phoneNo: "251909090909",
    email: "text@gmail.com",
    tgHandle: "@bekie21",
    position: "JCBS",
    department: "App and Sw Dev",
    levelOfEdu: "BSc",
    fieldOfStudy: "SWE",
    grade: {
      id: "derv1ws0",
      name: "III",
    },
    scale: {
      id: "3u1reuv4",
      name: "2",
    },
    experience: "2",
    empType: "Permanent",
    annualLeave: 10,
    temporaryLeave: 2,
  },
  {
    id: "Emp003",
    firstName: "Bezawit",
    middleName: "Tibebu",
    lastName: "Alemu",
    dob: new Date("1992-02-12"),
    phoneNo: "251909090909",
    email: "text@gmail.com",
    tgHandle: "@bezbeza",
    position: "JCBS",
    department: "App and Sw Dev",
    levelOfEdu: "MSc",
    fieldOfStudy: "CS",
    grade: { id: "m5gr84i9", name: "I" },
    scale: {
      id: "derv1ws0",
      name: "3",
    },
    experience: "5",
    empType: "Temporary",
    annualLeave: 0,
    temporaryLeave: 0,
  },
];

export default function EmployeeAdmin() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const [data, setData] = useState<Employee[]>(initialEmployees);

  const selectedEmployees = useMemo(() => {
    return data.filter((employee: Employee) => rowSelection[employee.id]);
  }, [rowSelection, data]);

  const handleDelete = () => {
    const idsToDelete = selectedEmployees.map((g) => g.id);
    console.log(idsToDelete);
  };
  return (
    <div className="flex flex-col gap-6 pt-12">
      <TableToolbar
        table="employee"
        onDelete={handleDelete}
        selectedCount={selectedEmployees.length}
      >
        <EmployeeForm />
      </TableToolbar>
      <EmployeesTable
        data={data}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />
    </div>
  );
}
