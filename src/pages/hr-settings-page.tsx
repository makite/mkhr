import { BranchesTab } from "@/components/employee_settings/tabs/branches-tab";
import { DepartmentsTab } from "@/components/employee_settings/tabs/departments-tab";
import { GradesTab } from "@/components/employee_settings/tabs/grades-tab";
import { LookupTypesTab } from "@/components/employee_settings/tabs/lookup-types-tab.tsx";
import { LookupValuesTab } from "@/components/employee_settings/tabs/lookup-values-tab.tsx";
import { PositionsTab } from "@/components/employee_settings/tabs/positions-tab";
import { SalaryMatrixTab } from "@/components/employee_settings/tabs/salary-matrix-tab";
import { ScalesTab } from "@/components/employee_settings/tabs/scales-tab";
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
