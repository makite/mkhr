/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { CACHE_POLICIES } from "@/lib/query-client";

export type CompanyBranding = {
  colors?: {
    primary?: string | null;
    secondary?: string | null;
    accent?: string | null;
  } | null;
  tagline?: string | null;
} | null;

export type PublicCompany = {
  id?: string;
  name?: string;
  legalName?: string;
  logo?: string | null;
  branding?: CompanyBranding;
};

export interface CompanyBrandingData {
  companyName: string;
  legalName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
}

export const DEFAULT_BRANDING: CompanyBrandingData = {
  companyName: "MEKU TRADING PLC",
  legalName: "መኩ ትሬዲንግ ኃ/የተ/የግ/ማ",
  tagline: "Human Resource & Enterprise Management",
  primaryColor: "#015896",
  secondaryColor: "#ecf0f2",
  accentColor: "#0284c7",
  logoUrl: "/mk_logo.png",
};

export function stripTrailingApi(base: string): string {
  return base.replace(/\/api\/?$/i, "");
}

export function buildAssetUrl(apiBase: string, input: string | null): string | null {
  const v = safeString(input);
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const assetBase = stripTrailingApi(apiBase);
  if (v.startsWith("/")) return `${assetBase}${v}`;
  return `${assetBase}/${v}`;
}

function safeHex(value: unknown): string | null {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) return null;
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) return v;
  return null;
}

function safeString(value: unknown): string | null {
  const v = typeof value === "string" ? value.trim() : "";
  return v ? v : null;
}

export function applyCssVar(name: string, value: string | null) {
  if (typeof document === "undefined") return;
  if (!value) return;
  document.documentElement.style.setProperty(name, value);
}

export function getCompanyLogoUrl(fallback: string = "/mk_logo.png"): string {
  try {
    const stored = localStorage.getItem("company.logo.url");
    if (stored) return stored;
    const cssVar = getComputedStyle(document.documentElement)
      .getPropertyValue("--company-logo-url")
      .trim();
    if (cssVar) return cssVar;
  } catch {
    // ignore
  }
  return fallback;
}

export function getSavedBrandingPreferences() {
  if (typeof localStorage === "undefined") {
    return {
      companyName: DEFAULT_BRANDING.companyName,
      legalName: DEFAULT_BRANDING.legalName,
      colors: {
        primary: DEFAULT_BRANDING.primaryColor,
        secondary: DEFAULT_BRANDING.secondaryColor,
        accent: DEFAULT_BRANDING.accentColor,
      },
      tagline: DEFAULT_BRANDING.tagline,
      logoUrl: DEFAULT_BRANDING.logoUrl,
    };
  }
  return {
    companyName: localStorage.getItem("company.name") || DEFAULT_BRANDING.companyName,
    legalName: localStorage.getItem("company.legalName") || DEFAULT_BRANDING.legalName,
    colors: {
      primary: localStorage.getItem("company.brand.primary") || DEFAULT_BRANDING.primaryColor,
      secondary: localStorage.getItem("company.brand.secondary") || DEFAULT_BRANDING.secondaryColor,
      accent: localStorage.getItem("company.brand.accent") || DEFAULT_BRANDING.accentColor,
    },
    tagline: localStorage.getItem("company.brand.tagline") || DEFAULT_BRANDING.tagline,
    logoUrl: localStorage.getItem("company.logo.url") || DEFAULT_BRANDING.logoUrl,
  };
}

export function saveBrandingPreferences(branding: {
  companyName?: string;
  legalName?: string;
  colors?: { primary?: string; secondary?: string; accent?: string };
  tagline?: string;
  logoUrl?: string;
}) {
  if (typeof localStorage !== "undefined") {
    if (branding.companyName) localStorage.setItem("company.name", branding.companyName);
    if (branding.legalName) localStorage.setItem("company.legalName", branding.legalName);
    if (branding.colors?.primary) localStorage.setItem("company.brand.primary", branding.colors.primary);
    if (branding.colors?.secondary) localStorage.setItem("company.brand.secondary", branding.colors.secondary);
    if (branding.colors?.accent) localStorage.setItem("company.brand.accent", branding.colors.accent);
    if (branding.tagline !== undefined) localStorage.setItem("company.brand.tagline", branding.tagline);
    if (branding.logoUrl) localStorage.setItem("company.logo.url", branding.logoUrl);
  }
  if (branding.colors?.primary) applyCssVar("--brand-primary", branding.colors.primary);
  if (branding.colors?.secondary) applyCssVar("--brand-secondary", branding.colors.secondary);
  if (branding.colors?.accent) applyCssVar("--brand-accent", branding.colors.accent);
  if (branding.logoUrl) applyCssVar("--company-logo-url", branding.logoUrl);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("company-branding-updated"));
  }
}

/**
 * Loads company branding/logo and applies them as CSS variables:
 * - --brand-primary, --brand-secondary (used by index.css defaults)
 * - --company-logo-url (for login/logo usage)
 */
export async function applyCompanyBranding(): Promise<CompanyBrandingData> {
  const apiBase = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
  const saved = getSavedBrandingPreferences();

  if (!apiBase) {
    return {
      companyName: saved.companyName,
      legalName: saved.legalName,
      tagline: saved.tagline,
      primaryColor: saved.colors.primary,
      secondaryColor: saved.colors.secondary,
      accentColor: saved.colors.accent,
      logoUrl: saved.logoUrl,
    };
  }

  try {
    const res = await fetch(`${apiBase}/company/public`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load branding");

    const body = (await res.json()) as {
      success?: boolean;
      data?: { company?: PublicCompany };
      company?: PublicCompany;
    };

    const company = body?.data?.company ?? body?.company ?? null;
    if (!company) throw new Error("No company returned");

    const primary = safeHex(company?.branding?.colors?.primary) || saved.colors.primary;
    const secondary = safeHex(company?.branding?.colors?.secondary) || saved.colors.secondary;
    const accent = safeHex(company?.branding?.colors?.accent) || saved.colors.accent;
    const logoUrl = buildAssetUrl(apiBase, company?.logo ?? null) || saved.logoUrl;
    const companyName = company?.name || saved.companyName;
    const legalName = company?.legalName || saved.legalName;
    const tagline = company?.branding?.tagline || saved.tagline;

    // Apply CSS variables to root
    applyCssVar("--brand-primary", primary);
    applyCssVar("--brand-secondary", secondary);
    applyCssVar("--brand-accent", accent);
    applyCssVar("--company-logo-url", logoUrl);

    // Persist in localStorage
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("company.name", companyName);
      localStorage.setItem("company.legalName", legalName);
      localStorage.setItem("company.brand.tagline", tagline);
      if (primary) localStorage.setItem("company.brand.primary", primary);
      if (secondary) localStorage.setItem("company.brand.secondary", secondary);
      if (accent) localStorage.setItem("company.brand.accent", accent);
      if (logoUrl) localStorage.setItem("company.logo.url", logoUrl);
    }

    return {
      companyName,
      legalName,
      tagline,
      primaryColor: primary,
      secondaryColor: secondary,
      accentColor: accent,
      logoUrl,
    };
  } catch {
    // Return saved preferences if API is unavailable
    applyCssVar("--brand-primary", saved.colors.primary);
    applyCssVar("--brand-secondary", saved.colors.secondary);
    applyCssVar("--brand-accent", saved.colors.accent);
    applyCssVar("--company-logo-url", saved.logoUrl);

    return {
      companyName: saved.companyName,
      legalName: saved.legalName,
      tagline: saved.tagline,
      primaryColor: saved.colors.primary,
      secondaryColor: saved.colors.secondary,
      accentColor: saved.colors.accent,
      logoUrl: saved.logoUrl,
    };
  }
}

/**
 * Enterprise TanStack Query Hook to consume cached company branding.
 * - Stored in Query cache (10 min stale time, 10 min periodic background sync).
 * - Guarantees components re-render automatically when branding is changed.
 */
export function useCompanyBranding() {
  const saved = getSavedBrandingPreferences();

  const { data, isLoading } = useQuery<CompanyBrandingData>({
    queryKey: queryKeys.company.public(),
    queryFn: () => applyCompanyBranding(),
    initialData: {
      companyName: saved.companyName,
      legalName: saved.legalName,
      tagline: saved.tagline,
      primaryColor: saved.colors.primary,
      secondaryColor: saved.colors.secondary,
      accentColor: saved.colors.accent,
      logoUrl: saved.logoUrl,
    },
    ...CACHE_POLICIES.STATIC_LOOKUPS,
  });

  return {
    ...data,
    loading: isLoading,
  };
}
