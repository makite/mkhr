import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lazy } from "react";
const BranchesTab = lazy(
  () => import("../components/employee_settings/tabs/branches-tab.tsx")
);
const GradesTab = lazy(
  () => import("../components/employee_settings/tabs/grades-tab.tsx")
);
const PositionTab = lazy(
  () => import("../components/employee_settings/tabs/position-tab.tsx")
);
const ScalesTab = lazy(
  () => import("../components/employee_settings/tabs/scales-tab.tsx")
);
const EmpscaleTab = lazy(
  () => import("../components/employee_settings/tabs/empscale-tab.tsx")
);

export default function HRSettings() {
  return (
    <div className="flex w-full min-w-sm flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage all settings</p>
      </div>
      <Tabs defaultValue="positions" className="w-full">
        <TabsList>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="scales">Scales</TabsTrigger>
          <TabsTrigger value="empscales">Emp Scales</TabsTrigger>
        </TabsList>
        <PositionTab />
        <GradesTab />
        <BranchesTab />
        <ScalesTab />
        <EmpscaleTab />
      </Tabs>
    </div>
  );
}
