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
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          Payroll Parameters &amp; Configuration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {branding?.companyName || "Meku"} statutory parameters, compensation calculation matrices, fiscal calendar, and commercial banking registry.
        </p>
      </div>

      <Tabs defaultValue="trans-types" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1 rounded-xl border border-border">
          <TabsTrigger
            value="trans-types"
            className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs rounded-lg transition-all"
          >
            <Settings2 className="w-4 h-4 text-primary" /> Transaction Rules
          </TabsTrigger>
          <TabsTrigger
            value="periods"
            className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs rounded-lg transition-all"
          >
            <Calendar className="w-4 h-4 text-primary" /> Fiscal Periods &amp; Rates
          </TabsTrigger>
          <TabsTrigger
            value="tax-brackets"
            className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs rounded-lg transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-primary" /> Income Tax (Proc 979/2016)
          </TabsTrigger>
          <TabsTrigger
            value="banks"
            className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs rounded-lg transition-all"
          >
            <Building2 className="w-4 h-4 text-primary" /> Commercial Banks
          </TabsTrigger>
          <TabsTrigger
            value="overtime"
            className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs rounded-lg transition-all"
          >
            <Clock className="w-4 h-4 text-primary" /> Overtime Multipliers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trans-types" className="pt-4 focus-visible:outline-hidden">
          <TransactionTypesTab />
        </TabsContent>

        <TabsContent value="periods" className="pt-4 focus-visible:outline-hidden">
          <PeriodsTab />
        </TabsContent>

        <TabsContent value="tax-brackets" className="pt-4 focus-visible:outline-hidden">
          <TaxBracketsTab />
        </TabsContent>

        <TabsContent value="banks" className="pt-4 focus-visible:outline-hidden">
          <BanksTab />
        </TabsContent>

        <TabsContent value="overtime" className="pt-4 focus-visible:outline-hidden">
          <OvertimeTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
