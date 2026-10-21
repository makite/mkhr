import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type TaxBracket, payrollService } from "../services/payroll-service";
import { toast } from "sonner";

export const TaxBracketsTab: React.FC = () => {
  const [brackets, setBrackets] = useState<TaxBracket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    payrollService.getTaxBrackets()
      .then(setBrackets)
      .catch((err) => toast.error(err.message || "Failed to load tax brackets."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>Statutory Regulation:</strong> Ethiopian Employment Income Tax Proclamation No. 979/2016.
        All progressive brackets and deductible offsets are enforced automatically.
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-20">Bracket</TableHead>
              <TableHead className="text-right">Monthly Income From (ETB)</TableHead>
              <TableHead className="text-right">Monthly Income To (ETB)</TableHead>
              <TableHead className="text-right">Tax Rate (%)</TableHead>
              <TableHead className="text-right">Deductible Offset (ETB)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Loading statutory tax brackets...
                </TableCell>
              </TableRow>
            ) : brackets.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-semibold">Bracket {b.bracketNo}</TableCell>
                <TableCell className="text-right font-mono">
                  {b.minIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {b.maxIncome ? b.maxIncome.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "Over 10,900"}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-blue-700">
                  {(b.ratePercent * 100).toFixed(0)}%
                </TableCell>
                <TableCell className="text-right font-mono">
                  {b.deductible.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
