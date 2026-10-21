import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VariableInputsTab } from "../tabs/variable-inputs-tab";
import { StaffLoansTab } from "../tabs/staff-loans-tab";
import { CostSharingTab } from "../tabs/cost-sharing-tab";
import { useCompanyBranding } from "@/services/company-branding";
import { useCurrentPayrollPeriod } from "../services/use-payroll-queries";
import { Receipt, CreditCard, GraduationCap, Calendar } from "lucide-react";

export default function PayrollTransactionsPage() {
  const branding = useCompanyBranding();
  const { data: currentPeriod } = useCurrentPayrollPeriod();

  return (
    <div className="flex w-full min-w-sm flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Variable Transactions &amp; Deductions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {branding?.companyName || "Meku"} monthly operational inputs: allowances, overtime, staff advances, and statutory higher education cost sharing.
          </p>
        </div>

        {currentPeriod && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-xl">
            <Calendar className="w-4 h-4 text-primary" />
            <div className="text-xs">
              <span className="text-muted-foreground">Current Cycle: </span>
              <strong className="text-primary font-semibold">{currentPeriod.name}</strong>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="variables" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1 rounded-xl border border-border">
          <TabsTrigger
            value="variables"
            className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs rounded-lg transition-all"
          >
            <Receipt className="w-4 h-4 text-primary" /> Monthly Variable Entries
          </TabsTrigger>
          <TabsTrigger
            value="loans"
            className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs rounded-lg transition-all"
          >
            <CreditCard className="w-4 h-4 text-primary" /> Staff Loans &amp; Advances
          </TabsTrigger>
          <TabsTrigger
            value="cost-sharing"
            className="flex items-center gap-1.5 py-2 px-3 text-xs md:text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-2xs rounded-lg transition-all"
          >
            <GraduationCap className="w-4 h-4 text-primary" /> Higher Ed Cost Sharing (10%)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="variables" className="pt-4 focus-visible:outline-hidden">
          <VariableInputsTab />
        </TabsContent>

        <TabsContent value="loans" className="pt-4 focus-visible:outline-hidden">
          <StaffLoansTab />
        </TabsContent>

        <TabsContent value="cost-sharing" className="pt-4 focus-visible:outline-hidden">
          <CostSharingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
