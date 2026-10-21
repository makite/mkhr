import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VariableInputsTab } from "../tabs/variable-inputs-tab";
import { StaffLoansTab } from "../tabs/staff-loans-tab";
import { CostSharingTab } from "../tabs/cost-sharing-tab";
import { useCompanyBranding } from "@/services/company-branding";
import { Receipt, CreditCard, GraduationCap } from "lucide-react";

export default function PayrollTransactionsPage() {
  const branding = useCompanyBranding();

  return (
    <div className="flex w-full min-w-sm flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
          Variable Transactions &amp; Deductions
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {branding?.companyName || "Meku"} monthly inputs: allowances, overtime, staff advances, and statutory higher education cost sharing.
        </p>
      </div>

      <Tabs defaultValue="variables" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-gray-100 p-1.5 rounded-xl border">
          <TabsTrigger value="variables" className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium">
            <Receipt className="w-4 h-4" /> Monthly Variable Entries
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium">
            <CreditCard className="w-4 h-4" /> Staff Loans &amp; Advances
          </TabsTrigger>
          <TabsTrigger value="cost-sharing" className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium">
            <GraduationCap className="w-4 h-4" /> Higher Ed Cost Sharing (10%)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="variables" className="pt-4">
          <VariableInputsTab />
        </TabsContent>

        <TabsContent value="loans" className="pt-4">
          <StaffLoansTab />
        </TabsContent>

        <TabsContent value="cost-sharing" className="pt-4">
          <CostSharingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
