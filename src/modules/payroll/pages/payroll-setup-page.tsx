import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TransactionTypesTab } from "../tabs/transaction-types-tab";
import { PeriodsTab } from "../tabs/periods-tab";
import { TaxBracketsTab } from "../tabs/tax-brackets-tab";
import { BanksTab } from "../tabs/banks-tab";
import { OvertimeTab } from "../tabs/overtime-tab";
import { useCompanyBranding } from "@/services/company-branding";
import { Settings2, Calendar, ShieldCheck, Building2, Clock } from "lucide-react";

export default function PayrollSetupPage() {
  const branding = useCompanyBranding();

  return (
    <div className="flex w-full min-w-sm flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
          Payroll Parameters &amp; Configuration
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {branding?.companyName || "Meku"} statutory parameters, transaction types &amp; calculation rules, fiscal periods, and banking details.
        </p>
      </div>

      <Tabs defaultValue="trans-types" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-gray-100 p-1.5 rounded-xl border">
          <TabsTrigger value="trans-types" className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium">
            <Settings2 className="w-4 h-4" /> Transaction Rules
          </TabsTrigger>
          <TabsTrigger value="periods" className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium">
            <Calendar className="w-4 h-4" /> Fiscal Periods &amp; Rates
          </TabsTrigger>
          <TabsTrigger value="tax-brackets" className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium">
            <ShieldCheck className="w-4 h-4" /> Income Tax (Proc 979/2016)
          </TabsTrigger>
          <TabsTrigger value="banks" className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium">
            <Building2 className="w-4 h-4" /> Commercial Banks
          </TabsTrigger>
          <TabsTrigger value="overtime" className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium">
            <Clock className="w-4 h-4" /> Overtime Multipliers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trans-types" className="pt-4">
          <TransactionTypesTab />
        </TabsContent>

        <TabsContent value="periods" className="pt-4">
          <PeriodsTab />
        </TabsContent>

        <TabsContent value="tax-brackets" className="pt-4">
          <TaxBracketsTab />
        </TabsContent>

        <TabsContent value="banks" className="pt-4">
          <BanksTab />
        </TabsContent>

        <TabsContent value="overtime" className="pt-4">
          <OvertimeTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
