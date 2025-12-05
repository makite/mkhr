import {
  PositionsDataTable,
  type Position,
} from "@/components/employee_settings/tables/positions-table";
import TableToolbar from "@/components/table-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import AddPositionPage from "../modals/add-position";

const initialPostions: Position[] = [
  {
    id: "p1",
    name: "Frontend Developer",
    grade: "III",
    rank: 10,
    salary: 15000,
    description: "Build and maintain UI components",
    category: "IT",
    is_active: true,
  },
  {
    id: "p2",
    name: "Backend Developer",
    grade: "III",
    rank: 9,
    salary: 16000,
    description: "API and service development",
    category: "IT",
    is_active: true,
  },
  {
    id: "p3",
    name: "Support Engineer",
    grade: "II",
    rank: 7,
    salary: 10000,
    description: "Customer support and troubleshooting",
    category: "LIMAT",
    is_active: false,
  },
];

export default function PositionTab() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const [data, setData] = useState<Position[]>(initialPostions);

  const selectedPositions = useMemo(() => {
    return data.filter((position: Position) => rowSelection[position.id]);
  }, [rowSelection, data]);

  const handleDelete = () => {
    const idsToDelete = selectedPositions.map((g) => g.id);
    console.log(idsToDelete);
  };
  return (
    <TabsContent value="positions">
      <div className="flex flex-col gap-4">
        <TableToolbar
          table="position"
          onDelete={handleDelete}
          selectedCount={selectedPositions.length}
        >
          <AddPositionPage />
        </TableToolbar>
        <Card>
          <CardContent className="grid gap-6">
            <PositionsDataTable
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
