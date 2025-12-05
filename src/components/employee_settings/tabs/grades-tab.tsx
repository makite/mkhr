import {
  GradesDataTable,
  type Grades,
} from "@/components/employee_settings/tables/grades-table";
import TableToolbar from "@/components/table-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import AddGradePage from "../modals/add-grade";

const initialData: Grades[] = [
  {
    id: "m5gr84i9",
    name: "I",
  },
  {
    id: "3u1reuv4",
    name: "II",
  },
  {
    id: "derv1ws0",
    name: "III",
  },
];

export default function GradesTab() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const [data, setData] = useState<Grades[]>(initialData);

  const selectedGrades = useMemo(() => {
    return data.filter((grade: Grades) => rowSelection[grade.id]);
  }, [rowSelection, data]);

  const handleDelete = () => {
    const idsToDelete = selectedGrades.map((g) => g.id);
    console.log(idsToDelete);
  };

  return (
    <TabsContent value="grades">
      <div className="flex flex-col gap-4">
        <TableToolbar
          table="grade"
          onDelete={handleDelete}
          selectedCount={selectedGrades.length}
        >
          <AddGradePage />
        </TableToolbar>
        <Card>
          <CardContent className="grid gap-6">
            <GradesDataTable
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
