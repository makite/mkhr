/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { applyCompanyBranding } from "@/services/company-branding";
import {
  UploadCloud,
  Save,
  RefreshCw,
  Trash2,
  Building2,
  ImageIcon,
  Palette,
  Copy,
  Check,
} from "lucide-react";

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
  branding?: {
    tagline?: string | null;
    colors?: {
      primary?: string | null;
      secondary?: string | null;
      accent?: string | null;
    } | null;
  } | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

function HexColorInput({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (color: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.trim();
    if (raw && !raw.startsWith("#") && /^[0-9a-fA-F]/i.test(raw)) {
      raw = "#" + raw;
    }
    onChange(raw);
  };

  const copyToClipboard = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  // Safe 6-character hex for the native color picker
  const pickerValue = /^#[0-9a-fA-F]{6}$/i.test(value)
    ? value
    : /^#[0-9a-fA-F]{3}$/i.test(value)
    ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
    : "#000000";

  return (
    <div className="space-y-1.5 p-3 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={copyToClipboard}
          title="Copy hex code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative h-9 w-10 shrink-0 rounded border overflow-hidden shadow-xs cursor-pointer">
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-2 -left-2 h-14 w-14 cursor-pointer border-0 p-0"
            title="Open color picker"
          />
        </div>
        <Input
          value={value}
          onChange={handleTextChange}
          placeholder="#000000"
          className="font-mono text-sm tracking-wide h-9 uppercase"
        />
      </div>
    </div>
  );
}

export default function CompanyProfilePage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
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
    tagline: "",
    primaryColor: "#0f172a",
    secondaryColor: "#16a34a",
    accentColor: "#2563eb",
  });

  const apiBase = useMemo(() => {
    return String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/api\/?$/i, "");
  }, []);

  const logoUrl = useMemo(() => {
    if (!company?.logo) return "";
    if (company.logo.startsWith("http://") || company.logo.startsWith("https://")) {
      return company.logo;
    }
    const cleanPath = company.logo.startsWith("/") ? company.logo : `/${company.logo}`;
    return `${apiBase}${cleanPath}`;
  }, [company?.logo, apiBase]);

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
        tagline: b?.tagline ?? "",
        primaryColor: b?.colors?.primary ?? "#0f172a",
        secondaryColor: b?.colors?.secondary ?? "#16a34a",
        accentColor: b?.colors?.accent ?? "#2563eb",
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
      tagline: form.tagline.trim(),
      colors: {
        primary: form.primaryColor.trim(),
        secondary: form.secondaryColor.trim(),
        accent: form.accentColor.trim(),
      },
    }),
    [form.tagline, form.primaryColor, form.secondaryColor, form.accentColor],
  );

  const save = async () => {
    if (!form.name.trim()) {
      toast({
        title: "Validation error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    if (!form.legalName.trim()) {
      toast({
        title: "Validation error",
        description: "Legal name is required",
        variant: "destructive",
      });
      return;
    }

    if (!form.email.trim()) {
      toast({
        title: "Validation error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await api.put<any>("/company", {
        name: form.name.trim(),
        legalName: form.legalName.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || null,
        website: form.website?.trim() || null,
        taxId: form.taxId?.trim() || null,
        registrationNo: form.registrationNo?.trim() || null,
        address: form.address?.trim() || null,
        city: form.city?.trim() || null,
        state: form.state?.trim() || null,
        country: form.country?.trim() || null,
        postalCode: form.postalCode?.trim() || null,
        branding: brandingPayload,
      });

      const updated = res?.data?.company ?? res?.company ?? null;
      if (updated) {
        setCompany(updated);
      }

      await applyCompanyBranding();
      window.dispatchEvent(new Event("company-branding-updated"));

      toast({
        title: "Saved",
        description: "Company settings and branding updated successfully",
        variant: "success",
      });
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e?.message || "Failed to save company settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoSelect = async (file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file",
        description: "Please select a valid image file (PNG, JPG, or WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size must not exceed 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await api.post<any>("/company/logo", { dataUrl });
      const updated = res?.data?.company ?? res?.company ?? null;
      if (updated) {
        setCompany(updated);
        await applyCompanyBranding();
        window.dispatchEvent(new Event("company-branding-updated"));
      }
      toast({
        title: "Uploaded",
        description: "Company logo updated successfully",
        variant: "success",
      });
    } catch (e: any) {
      toast({
        title: "Upload failed",
        description: e?.message || "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const res = await api.put<any>("/company", { logo: null });
      const updated = res?.data?.company ?? res?.company ?? null;
      if (updated) {
        setCompany(updated);
        try {
          localStorage.removeItem("company.logo.url");
          window.dispatchEvent(new Event("company-branding-updated"));
        } catch {
          // ignore
        }
      }
      toast({
        title: "Removed",
        description: "Company logo removed",
        variant: "default",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to remove logo",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Company Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your organization profile, contact information, branding colors, and logo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={save} disabled={saving || loading}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>
              General information about your business entity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-name">
                  Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company-name"
                  value={form.name}
                  placeholder="e.g. Meku Trading PLC"
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legal-name">
                  Legal Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="legal-name"
                  value={form.legalName}
                  placeholder="e.g. Meku Trading Private Limited Company"
                  onChange={(e) => setForm((p) => ({ ...p, legalName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company-email"
                  type="email"
                  value={form.email}
                  placeholder="info@mekutrading.et"
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Phone Number</Label>
                <Input
                  id="company-phone"
                  value={form.phone}
                  placeholder="+251 91 123 4567"
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-website">Website</Label>
                <Input
                  id="company-website"
                  value={form.website}
                  placeholder="https://mekutrading.et"
                  onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-tax-id">Tax ID / TIN</Label>
                <Input
                  id="company-tax-id"
                  value={form.taxId}
                  placeholder="TIN-0012345678"
                  onChange={(e) => setForm((p) => ({ ...p, taxId: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company-reg-no">Registration Number</Label>
                <Input
                  id="company-reg-no"
                  value={form.registrationNo}
                  placeholder="REG-ETH-2026-001"
                  onChange={(e) => setForm((p) => ({ ...p, registrationNo: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-postal-code">Postal Code / P.O. Box</Label>
                <Input
                  id="company-postal-code"
                  value={form.postalCode}
                  placeholder="1000"
                  onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-address">Physical Address</Label>
              <Textarea
                id="company-address"
                rows={3}
                value={form.address}
                placeholder="Bole Sub-City, Kebele 03, House No. 456"
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="company-city">City</Label>
                <Input
                  id="company-city"
                  value={form.city}
                  placeholder="Addis Ababa"
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-state">Region / State</Label>
                <Input
                  id="company-state"
                  value={form.state}
                  placeholder="Addis Ababa"
                  onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-country">Country</Label>
                <Input
                  id="company-country"
                  value={form.country}
                  placeholder="Ethiopia"
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Branding & Colors
              </CardTitle>
              <CardDescription>
                Customize brand colors and promotional tagline. You can paste HEX codes directly or use the color picker.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-tagline">Tagline / Motto</Label>
                <Input
                  id="company-tagline"
                  value={form.tagline}
                  placeholder="e.g. Empowering Human Capital"
                  onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
                />
              </div>

              <div className="space-y-3">
                <HexColorInput
                  label="Primary Color"
                  description="Main theme color for headers and active states"
                  value={form.primaryColor}
                  onChange={(color) => setForm((p) => ({ ...p, primaryColor: color }))}
                />

                <HexColorInput
                  label="Secondary Color"
                  description="Secondary accent for badges and secondary elements"
                  value={form.secondaryColor}
                  onChange={(color) => setForm((p) => ({ ...p, secondaryColor: color }))}
                />

                <HexColorInput
                  label="Accent Color"
                  description="Highlight color for buttons, links, and indicators"
                  value={form.accentColor}
                  onChange={(color) => setForm((p) => ({ ...p, accentColor: color }))}
                />
              </div>

              <div className="rounded-md border p-3 bg-muted/30 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Color Preview
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-md border shadow-xs" style={{ background: form.primaryColor }} />
                    <span className="text-xs font-mono text-muted-foreground">{form.primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-md border shadow-xs" style={{ background: form.secondaryColor }} />
                    <span className="text-xs font-mono text-muted-foreground">{form.secondaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-md border shadow-xs" style={{ background: form.accentColor }} />
                    <span className="text-xs font-mono text-muted-foreground">{form.accentColor}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Company Logo
              </CardTitle>
              <CardDescription>
                Upload and display your official organization logo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg bg-muted/20 min-h-[160px]">
                {logoUrl ? (
                  <div className="relative group w-full flex flex-col items-center justify-center">
                    <img
                      src={logoUrl}
                      alt="Company logo"
                      className="max-h-32 max-w-full object-contain rounded p-2 bg-background border shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-2 py-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted text-muted-foreground">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <div className="text-sm font-medium">No logo uploaded</div>
                    <p className="text-xs text-muted-foreground">
                      Upload your organization logo to appear on invoices, reports, and navbar.
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleLogoSelect(f);
                  e.currentTarget.value = "";
                }}
              />

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 cursor-pointer"
                  disabled={uploadingLogo}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingLogo ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Uploading Logo...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      {company?.logo ? "Change Logo" : "Upload Logo"}
                    </>
                  )}
                </Button>

                {company?.logo && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                    disabled={uploadingLogo}
                    onClick={handleRemoveLogo}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Logo
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t">
                <p>• Supported formats: PNG, JPG, WebP</p>
                <p>• Maximum file size: 5 MB</p>
                <p>• Automatically synced across dashboard & sidebar</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
