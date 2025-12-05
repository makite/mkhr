import {
  ScalesDataTable,
  type Scale,
} from "@/components/employee_settings/tables/scales-table";
import TableToolbar from "@/components/table-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import AddScalePage from "../modals/add-scale";

const initialScales: Scale[] = [
  {
    id: "m5gr84i9",
    name: "1",
  },
  {
    id: "3u1reuv4",
    name: "2",
  },
  {
    id: "derv1ws0",
    name: "3",
  },
];

export default function ScalesTab() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const [data, setData] = useState<Scale[]>(initialScales);

  const selectedScales = useMemo(() => {
    return data.filter((scale: Scale) => rowSelection[scale.id]);
  }, [rowSelection, data]);

  const handleDelete = () => {
    const idsToDelete = selectedScales.map((g) => g.id);
    console.log(idsToDelete);
  };
  return (
    <TabsContent value="scales">
      <div className="flex flex-col gap-4">
        <TableToolbar
          table="scale"
          onDelete={handleDelete}
          selectedCount={selectedScales.length}
        >
          {" "}
          <AddScalePage />{" "}
        </TableToolbar>
        <Card>
          <CardContent className="grid gap-6">
            <ScalesDataTable
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
