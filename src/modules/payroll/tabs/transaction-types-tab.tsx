import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { type TransactionType, payrollService } from "../services/payroll-service";
import { TransactionTypeDialog } from "../components/transaction-type-dialog";
import { toast } from "sonner";

export const TransactionTypesTab: React.FC = () => {
  const [types, setTypes] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType | null>(null);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const data = await payrollService.getTransactionTypes();
      setTypes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load transaction types.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const filtered = (Array.isArray(types) ? types : []).filter((t) => {
    const nameStr = (t?.name || (t as any)?.fullDescription || (t as any)?.fieldName || "").toLowerCase();
    const codeStr = (t?.code || "").toLowerCase();
    const s = search.toLowerCase();
    return nameStr.includes(s) || codeStr.includes(s);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Input
          placeholder="Search by code or transaction name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => { setSelectedType(null); setDialogOpen(true); }}>
          ➕ Add Transaction Type
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-16">Seq</TableHead>
              <TableHead className="w-24">Code</TableHead>
              <TableHead>Transaction Name</TableHead>
              <TableHead className="w-28">Type</TableHead>
              <TableHead>Rule Flags</TableHead>
              <TableHead className="w-32">GL Account</TableHead>
              <TableHead className="w-20 text-center">Status</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Loading transaction settings...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No transaction types found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id} className="hover:bg-gray-50/50">
                  <TableCell className="font-mono text-xs">{t.prioritySeq}</TableCell>
                  <TableCell className="font-mono font-semibold text-blue-600">{t.code}</TableCell>
                  <TableCell className="font-medium">
                    <div>{t.name}</div>
                    {t.shortName && <span className="text-xs text-gray-400">({t.shortName})</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.transType === "ADDITION" ? "default" : "destructive"}>
                      {t.transType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {t.isTaxed && <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">Tax</Badge>}
                      {t.applyPension && <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">Pension</Badge>}
                      {t.deductAbsence && <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Absence</Badge>}
                      {t.allowBackPayment && <Badge variant="outline" className="text-xs bg-green-50 text-green-700">BackPay</Badge>}
                      {t.clearOnMonthEnd && <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">OneOff</Badge>}
                      {t.isVariable && <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">Variable</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {t.accountCode || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${t.isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedType(t);
                        setDialogOpen(true);
                      }}
                    >
                      ✏️ Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TransactionTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transactionType={selectedType}
        onSuccess={fetchTypes}
      />
    </div>
  );
};
