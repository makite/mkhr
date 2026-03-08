import { BranchesTab } from "@/modules/hr/settings/tabs/branches-tab";
import { DepartmentsTab } from "@/modules/hr/settings/tabs/departments-tab";
import { GradesTab } from "@/modules/hr/settings/tabs/grades-tab";
import { LookupTypesTab } from "@/modules/hr/settings/tabs/lookup-types-tab";
import { LookupValuesTab } from "@/modules/hr/settings/tabs/lookup-values-tab";
import { PositionsTab } from "@/modules/hr/settings/tabs/positions-tab";
import { SalaryMatrixTab } from "@/modules/hr/settings/tabs/salary-matrix-tab";
import { ScalesTab } from "@/modules/hr/settings/tabs/scales-tab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function HRSettings() {
  return (
    <div className="flex w-full min-w-sm flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">HR Settings</h1>
        <p className="text-gray-600">
          Manage employee structure, salary scales, and organizational hierarchy
        </p>
      </div>

      <Tabs defaultValue="lookup" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          {/* Lookup Section */}
          <TabsTrigger value="lookup">📋 Lookups</TabsTrigger>
          <TabsTrigger value="lookup-values">🔤 Lookup Values</TabsTrigger>

          {/* Organization Structure */}
          <TabsTrigger value="departments">🏢 Departments</TabsTrigger>
          <TabsTrigger value="branches">📍 Branches</TabsTrigger>

          {/* Salary Structure */}
          <TabsTrigger value="scales">📊 Scales</TabsTrigger>
          <TabsTrigger value="grades">📈 Grades</TabsTrigger>
          <TabsTrigger value="salary-matrix">💰 Salary Matrix</TabsTrigger>
          <TabsTrigger value="positions">👔 Positions</TabsTrigger>
        </TabsList>

        {/* Lookup Section */}
        <TabsContent value="lookup">
          <LookupTypesTab />
        </TabsContent>

        <TabsContent value="lookup-values">
          <LookupValuesTab />
        </TabsContent>

        {/* Organization Structure */}
        <TabsContent value="departments">
          <DepartmentsTab />
        </TabsContent>

        <TabsContent value="branches">
          <BranchesTab />
        </TabsContent>

        {/* Salary Structure */}
        <TabsContent value="scales">
          <ScalesTab />
        </TabsContent>

        <TabsContent value="grades">
          <GradesTab />
        </TabsContent>

        <TabsContent value="salary-matrix">
          <SalaryMatrixTab />
        </TabsContent>

        <TabsContent value="positions">
          <PositionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
