type CompanyBranding = {
  colors?: {
    primary?: string | null;
    secondary?: string | null;
    accent?: string | null;
  } | null;
  tagline?: string | null;
} | null;

type PublicCompany = {
  id?: string;
  name?: string;
  legalName?: string;
  logo?: string | null;
  branding?: CompanyBranding;
};

export function stripTrailingApi(base: string): string {
  // VITE_API_BASE_URL is usually like "http://localhost:3000/api"
  // Static files are served from backend root: "http://localhost:3000/uploads/..."
  return base.replace(/\/api\/?$/i, "");
}

export function buildAssetUrl(apiBase: string, input: string | null): string | null {
  const v = safeString(input);
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const assetBase = stripTrailingApi(apiBase);
  // If backend stores "/uploads/..." make it absolute using backend origin (not /api).
  if (v.startsWith("/")) return `${assetBase}${v}`;
  // If stored relative without leading slash, treat as relative to backend origin.
  return `${assetBase}/${v}`;
}

function safeHex(value: unknown): string | null {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) return null;
  // Allow #RGB, #RRGGBB
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

export function saveBrandingPreferences(branding: {
  colors?: { primary?: string; secondary?: string; accent?: string };
  tagline?: string;
}) {
  if (typeof localStorage !== "undefined") {
    if (branding.colors?.primary) localStorage.setItem("company.brand.primary", branding.colors.primary);
    if (branding.colors?.secondary) localStorage.setItem("company.brand.secondary", branding.colors.secondary);
    if (branding.colors?.accent) localStorage.setItem("company.brand.accent", branding.colors.accent);
    if (branding.tagline !== undefined) localStorage.setItem("company.brand.tagline", branding.tagline);
  }
  if (branding.colors?.primary) applyCssVar("--brand-primary", branding.colors.primary);
  if (branding.colors?.secondary) applyCssVar("--brand-secondary", branding.colors.secondary);
  if (branding.colors?.accent) applyCssVar("--brand-accent", branding.colors.accent);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("company-branding-updated"));
  }
}

export function getSavedBrandingPreferences() {
  if (typeof localStorage === "undefined") {
    return {
      colors: { primary: "#0f172a", secondary: "#16a34a", accent: "#2563eb" },
      tagline: "",
    };
  }
  return {
    colors: {
      primary: localStorage.getItem("company.brand.primary") || "#0f172a",
      secondary: localStorage.getItem("company.brand.secondary") || "#16a34a",
      accent: localStorage.getItem("company.brand.accent") || "#2563eb",
    },
    tagline: localStorage.getItem("company.brand.tagline") || "",
  };
}

/**
 * Loads company branding/logo and applies them as CSS variables:
 * - --brand-primary, --brand-secondary (used by src/index.css defaults)
 * - --company-logo-url (for login/logo usage)
 */
export async function applyCompanyBranding(): Promise<void> {
  const apiBase = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
  if (!apiBase) return;

  try {
    const res = await fetch(`${apiBase}/company/public`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) return;

    const body = (await res.json()) as {
      success?: boolean;
      data?: { company?: PublicCompany };
      company?: PublicCompany;
    };

    const company = body?.data?.company ?? body?.company ?? null;
    if (!company) return;

    const saved = getSavedBrandingPreferences();
    const primary = safeHex(company?.branding?.colors?.primary) || saved.colors.primary;
    const secondary = safeHex(company?.branding?.colors?.secondary) || saved.colors.secondary;
    const accent = safeHex(company?.branding?.colors?.accent) || saved.colors.accent;
    const logoUrl = buildAssetUrl(apiBase, company?.logo ?? null);

    // Apply CSS variables
    applyCssVar("--brand-primary", primary);
    applyCssVar("--brand-secondary", secondary);
    applyCssVar("--brand-accent", accent);
    applyCssVar("--company-logo-url", logoUrl);

    // Persist for components that want it without reading CSS vars
    if (typeof localStorage !== "undefined") {
      if (primary) localStorage.setItem("company.brand.primary", primary);
      if (secondary) localStorage.setItem("company.brand.secondary", secondary);
      if (accent) localStorage.setItem("company.brand.accent", accent);
      if (logoUrl) localStorage.setItem("company.logo.url", logoUrl);
    }
  } catch {
    // ignore: keep defaults
  }
}
