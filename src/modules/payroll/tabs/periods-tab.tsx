import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { type PayrollPeriod, payrollService } from "../services/payroll-service";
import { useCompanyBranding } from "@/services/company-branding";
import { Fuel, DollarSign, Settings } from "lucide-react";
import { toast } from "sonner";

export const PeriodsTab: React.FC = () => {
  const branding = useCompanyBranding();
  const primaryColor = branding?.primaryColor || "#1e40af";

  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPeriod, setEditingPeriod] = useState<PayrollPeriod | null>(null);
  const [fuelRate, setFuelRate] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const data = await payrollService.getPeriods();
      setPeriods(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load periods.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleEditRates = (period: PayrollPeriod) => {
    setEditingPeriod(period);
    setFuelRate(period.fuelRate || 0);
    setExchangeRate(period.exchangeRateUSD || 0);
  };

  const handleSaveRates = async () => {
    if (!editingPeriod) return;
    setSaving(true);
    try {
      await payrollService.updatePeriodRates(editingPeriod.id, {
        fuelRate,
        exchangeRateUSD: exchangeRate,
      });
      toast.success("Period rates updated successfully.");
      setEditingPeriod(null);
      await fetchPeriods();
    } catch (err: any) {
      toast.error(err.message || "Failed to update rates.");
    } finally {
      setSaving(false);
    }
  };

  const currentPeriod = periods.find(p => p.isCurrent);

  return (
    <div className="space-y-6">
      {/* Current Active Period Overview */}
      {currentPeriod && (
        <Card className="border shadow-xs bg-linear-to-r from-blue-50/60 to-indigo-50/60">
          <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-600 text-white font-semibold">Active Current Period</Badge>
                <h3 className="text-lg font-bold text-gray-900">{currentPeriod.name}</h3>
              </div>
              <p className="text-xs text-gray-500">
                Window: {new Date(currentPeriod.startDate).toLocaleDateString()} – {new Date(currentPeriod.endDate).toLocaleDateString()} ({currentPeriod.workingDays} working days)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white px-3.5 py-2 rounded-lg border shadow-2xs flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Fuel Rate</div>
                  <div className="text-sm font-bold text-gray-900 font-mono">
                    {currentPeriod.fuelRate ? `ETB ${Number(currentPeriod.fuelRate).toFixed(2)}/L` : "Not Set"}
                  </div>
                </div>
              </div>

              <div className="bg-white px-3.5 py-2 rounded-lg border shadow-2xs flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">USD Exchange</div>
                  <div className="text-sm font-bold text-gray-900 font-mono">
                    {currentPeriod.exchangeRateUSD ? `1 USD = ${Number(currentPeriod.exchangeRateUSD).toFixed(2)} ETB` : "Not Set"}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleEditRates(currentPeriod)}
                style={{ backgroundColor: primaryColor }}
                className="text-white hover:opacity-90 gap-1.5"
                size="sm"
              >
                <Settings className="w-3.5 h-3.5" /> Adjust Period Rates
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table of Periods */}
      <div className="border rounded-lg overflow-x-auto bg-white shadow-xs">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Period Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-right">Fuel Rate (ETB/L)</TableHead>
              <TableHead className="text-right">USD Exchange Rate</TableHead>
              <TableHead className="w-28 text-center">Status</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <span className="animate-spin">â ³</span> Loading periods...
                  </div>
                </TableCell>
              </TableRow>
            ) : periods.map((p) => (
              <TableRow key={p.id} className={p.isCurrent ? "bg-blue-50/30 font-medium" : "hover:bg-gray-50/60"}>
                <TableCell className="font-mono text-gray-500">{p.periodNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{p.name}</span>
                    {p.isCurrent && (
                      <Badge className="text-[10px] bg-emerald-600 text-white font-semibold">
                        Active
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-gray-600">{new Date(p.startDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-xs text-gray-600">{new Date(p.endDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right font-mono font-medium text-gray-900">
                  {p.fuelRate ? `ETB ${Number(p.fuelRate).toFixed(2)}` : <span className="text-gray-300">-</span>}
                </TableCell>
                <TableCell className="text-right font-mono font-medium text-gray-900">
                  {p.exchangeRateUSD ? `ETB ${Number(p.exchangeRateUSD).toFixed(2)}` : <span className="text-gray-300">-</span>}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={p.status === "OPEN" ? "default" : p.status === "CLOSED" ? "secondary" : "outline"} className={p.status === "OPEN" ? "bg-emerald-600" : ""}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEditRates(p)} className="text-xs gap-1">
                    <Settings className="w-3 h-3 text-gray-500" /> Rates
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Rates Modal */}
      {editingPeriod && (
        <Dialog open={!!editingPeriod} onOpenChange={(open) => !open && setEditingPeriod(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                Adjust Period Rates: {editingPeriod.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="fuelRate">Fuel Price (ETB / Liter)</Label>
                <Input
                  id="fuelRate"
                  type="number"
                  step="0.01"
                  value={fuelRate}
                  onChange={(e) => setFuelRate(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 112.50"
                  className="font-mono mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Used to compute taxable benefit portions on assigned liters.</p>
              </div>

              <div>
                <Label htmlFor="exchangeRate">Currency Exchange Rate (1 USD = ETB)</Label>
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 135.50"
                  className="font-mono mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Used for multi-currency disbursements and donor reporting.</p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setEditingPeriod(null)}>Cancel</Button>
              <Button onClick={handleSaveRates} disabled={saving} style={{ backgroundColor: primaryColor }} className="text-white">
                {saving ? "Saving..." : "Save Rates"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
