import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type OvertimeRate, payrollService } from "../services/payroll-service";
import { toast } from "sonner";

export const OvertimeTab: React.FC = () => {
  const [rates, setRates] = useState<OvertimeRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    payrollService.getOvertimeRates()
      .then(setRates)
      .catch((err) => toast.error(err.message || "Failed to load overtime rates."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg text-sm text-blue-900">
        <strong>Statutory Regulation:</strong> Ethiopian Labour Proclamation No. 1156/2019.
        Multipliers apply to the hourly base rate (Basic Salary / 200 regular working hours).
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-24">OT Code</TableHead>
              <TableHead>Category / Period Description</TableHead>
              <TableHead className="text-right">Multiplier Rate</TableHead>
              <TableHead className="w-28 text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  Loading overtime rates...
                </TableCell>
              </TableRow>
            ) : rates.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono font-bold text-blue-600">{r.code}</TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-right font-mono font-bold text-emerald-700">
                  {r.rateMultiplier}x
                </TableCell>
                <TableCell className="text-center">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${r.isActive ? "bg-emerald-500" : "bg-gray-300"}`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
