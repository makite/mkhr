import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lazy } from "react";
const BranchesPage = lazy(() => import("./branches-page.tsx"));
const GradesPage = lazy(() => import("./grades-page.tsx"));
const PostionPage = lazy(() => import("./position-page.tsx"));
const ScalesPage = lazy(() => import("./scales-page.tsx"));
const EmpscalePage = lazy(() => import("./empscale-page.tsx"));

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
        <PostionPage />
        <GradesPage />
        <BranchesPage />
        <ScalesPage />
        <EmpscalePage />
      </Tabs>
    </div>
  );
}
