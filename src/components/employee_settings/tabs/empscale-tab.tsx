import {
  EmpScalesDataTable,
  type Empscale,
} from "@/components/employee_settings/tables/empscales-table";
import TableToolbar from "@/components/table-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import AddEmpscalePage from "../modals/add-empscale";

const initialEmpScale: Empscale[] = [
  { id: "e1", grade: "I", scale: "1", salary: 15000 },
  { id: "e2", grade: "II", scale: "2", salary: 20000 },
  { id: "e3", grade: "III", scale: "3", salary: 25000 },
];

export default function EmpscaleTab() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const [data, setData] = useState<Empscale[]>(initialEmpScale);

  const selectedEmpScales = useMemo(() => {
    return data.filter((empScale: Empscale) => rowSelection[empScale.id]);
  }, [rowSelection, data]);

  const handleDelete = () => {
    const idsToDelete = selectedEmpScales.map((g) => g.id);
    console.log(idsToDelete);
  };
  return (
    <TabsContent value="empscales">
      <div className="flex flex-col gap-4">
        <TableToolbar
          table="employeeScale"
          onDelete={handleDelete}
          selectedCount={selectedEmpScales.length}
        >
          {" "}
          <AddEmpscalePage />{" "}
        </TableToolbar>
        <Card>
          <CardContent className="grid gap-6">
            <EmpScalesDataTable
              data={data}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
            />
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
