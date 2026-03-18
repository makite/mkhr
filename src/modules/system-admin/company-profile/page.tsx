/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { UploadCloud, Save, RefreshCw } from "lucide-react";

type Company = {
  id: string;
  name: string;
  legalName: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  taxId?: string | null;
  registrationNo?: string | null;
  logo?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  branding?: any;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

export default function CompanyProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  const [form, setForm] = useState({
    name: "",
    legalName: "",
    email: "",
    phone: "",
    website: "",
    taxId: "",
    registrationNo: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    primaryColor: "#0f172a",
    secondaryColor: "#16a34a",
    accentColor: "#2563eb",
    tagline: "",
  });

  const logoUrl = company?.logo || "";

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>("/company");
      const c = res?.data?.company ?? res?.company ?? null;
      setCompany(c);
      const b = c?.branding || {};
      setForm({
        name: c?.name ?? "",
        legalName: c?.legalName ?? "",
        email: c?.email ?? "",
        phone: c?.phone ?? "",
        website: c?.website ?? "",
        taxId: c?.taxId ?? "",
        registrationNo: c?.registrationNo ?? "",
        address: c?.address ?? "",
        city: c?.city ?? "",
        state: c?.state ?? "",
        country: c?.country ?? "",
        postalCode: c?.postalCode ?? "",
        primaryColor: b?.colors?.primary ?? "#0f172a",
        secondaryColor: b?.colors?.secondary ?? "#16a34a",
        accentColor: b?.colors?.accent ?? "#2563eb",
        tagline: b?.tagline ?? "",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to load company",
        variant: "destructive",
      });
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const brandingPayload = useMemo(
    () => ({
      ...(company?.branding || {}),
      tagline: form.tagline,
      colors: {
        ...(company?.branding?.colors || {}),
        primary: form.primaryColor,
        secondary: form.secondaryColor,
        accent: form.accentColor,
      },
    }),
    [company?.branding, form.tagline, form.primaryColor, form.secondaryColor, form.accentColor],
  );

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put<any>("/company", {
        name: form.name,
        legalName: form.legalName,
        email: form.email,
        phone: form.phone || null,
        website: form.website || null,
        taxId: form.taxId || null,
        registrationNo: form.registrationNo || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        country: form.country || null,
        postalCode: form.postalCode || null,
        branding: brandingPayload,
      });
      const updated = res?.data?.company ?? res?.company ?? null;
      setCompany(updated);
      toast({ title: "Saved", description: "Company settings updated" });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to save company settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await api.post<any>("/company/logo", { dataUrl });
      const updated = res?.data?.company ?? res?.company ?? null;
      setCompany(updated);
      toast({ title: "Uploaded", description: "Company logo updated" });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to upload logo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
          <p className="text-muted-foreground">
            Manage company profile details and branding (logo & colors).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={save} disabled={saving || loading}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Legal name</Label>
                <Input value={form.legalName} onChange={(e) => setForm((p) => ({ ...p, legalName: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Tax ID</Label>
                <Input value={form.taxId} onChange={(e) => setForm((p) => ({ ...p, taxId: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Registration no.</Label>
                <Input value={form.registrationNo} onChange={(e) => setForm((p) => ({ ...p, registrationNo: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Postal code</Label>
                <Input value={form.postalCode} onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input value={form.tagline} onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))} />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <Label>Primary</Label>
                  <Input type="color" className="h-10 w-16 p-1" value={form.primaryColor} onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label>Secondary</Label>
                  <Input type="color" className="h-10 w-16 p-1" value={form.secondaryColor} onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label>Accent</Label>
                  <Input type="color" className="h-10 w-16 p-1" value={form.accentColor} onChange={(e) => setForm((p) => ({ ...p, accentColor: e.target.value }))} />
                </div>
              </div>

              <div className="rounded-md border p-3 space-y-2">
                <div className="text-sm font-medium">Preview</div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded" style={{ background: form.primaryColor }} />
                  <div className="h-4 w-4 rounded" style={{ background: form.secondaryColor }} />
                  <div className="h-4 w-4 rounded" style={{ background: form.accentColor }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Company logo"
                  className="w-full max-h-40 object-contain rounded border bg-white"
                />
              ) : (
                <div className="text-sm text-muted-foreground">No logo uploaded.</div>
              )}

              <label className="block">
                <span className="sr-only">Choose logo</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadLogo(f);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <UploadCloud className="h-4 w-4" />
                Upload PNG/JPG/WebP (stored under server `public/uploads/company/...`)
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

