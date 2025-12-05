import {
  BranchesDataTable,
  type Branch,
} from "@/components/employee_settings/tables/branches-table";
import TableToolbar from "@/components/table-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import AddBranchPage from "../modals/add-branch";
const initialBranches: Branch[] = [
  {
    id: "m5gr84i9",
    name: "MK Addis",
    address: "Addis Ababa, Ethiopia",
  },
  {
    id: "3u1reuv4",
    name: "MK BD",
    address: "Bahir Dar, Ethiopia",
  },
  {
    id: "derv1ws0",
    name: "MK GD",
    address: "Gondar, Ethiopia",
  },
];

export default function BranchesTab() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const [data, setData] = useState<Branch[]>(initialBranches);

  const selectedBranches = useMemo(() => {
    return data.filter((branch: Branch) => rowSelection[branch.id]);
  }, [rowSelection, data]);

  const handleDelete = () => {
    const idsToDelete = selectedBranches.map((g) => g.id);
    console.log(idsToDelete);
  };
  return (
    <TabsContent value="branches">
      <div className="flex flex-col gap-4">
        <TableToolbar
          table="branch"
          onDelete={handleDelete}
          selectedCount={selectedBranches.length}
        >
          {" "}
          <AddBranchPage />
        </TableToolbar>
        <Card>
          <CardContent className="grid gap-6">
            <BranchesDataTable
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
