import { ScalesDataTable } from "@/components/scales-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  DownloadIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react";
import { Link } from "react-router";

export default function ScalesPage() {
  return (
    <TabsContent value="scales">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 justify-end">
          <Link to="/hr/settings/add_scale">
            <Button className="bg-[#3E9E6C] cursor-pointer hover:bg-[#4ec587]">
              {" "}
              <PlusIcon /> Add New
            </Button>
          </Link>
          <Button variant="destructive">
            {" "}
            <Trash2Icon /> Delete
          </Button>
          <Button variant="outline">
            <DownloadIcon />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCwIcon />
            Refresh
          </Button>
        </div>
        <Card>
          <CardContent className="grid gap-6">
            <ScalesDataTable />
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
