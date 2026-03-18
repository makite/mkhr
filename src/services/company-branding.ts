type CompanyBranding = {
  colors?: {
    primary?: string | null;
    secondary?: string | null;
  } | null;
} | null;

type PublicCompany = {
  id?: string;
  name?: string;
  legalName?: string;
  logo?: string | null;
  branding?: CompanyBranding;
};

function stripTrailingApi(base: string): string {
  // VITE_API_BASE_URL is usually like "http://localhost:5000/api"
  // Static files are served from backend root: "http://localhost:5000/uploads/..."
  return base.replace(/\/api\/?$/i, "");
}

function buildAssetUrl(apiBase: string, input: string | null): string | null {
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

function applyCssVar(name: string, value: string | null) {
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

/**
 * Loads company branding/logo and applies them as CSS variables:
 * - --brand-primary, --brand-secondary (used by src/index.css defaults)
 * - --company-logo-url (for login/logo usage)
 *
 * If the API returns nothing, current CSS defaults remain untouched.
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

    const primary = safeHex(company?.branding?.colors?.primary);
    const secondary = safeHex(company?.branding?.colors?.secondary);
    const logoUrl = buildAssetUrl(apiBase, company?.logo ?? null);

    // Apply CSS variables (fallbacks remain from index.css if values are null)
    applyCssVar("--brand-primary", primary);
    applyCssVar("--brand-secondary", secondary);
    applyCssVar("--company-logo-url", logoUrl);

    // Persist for components that want it without reading CSS vars
    if (typeof localStorage !== "undefined") {
      if (primary) localStorage.setItem("company.brand.primary", primary);
      if (secondary) localStorage.setItem("company.brand.secondary", secondary);
      if (logoUrl) localStorage.setItem("company.logo.url", logoUrl);
    }
  } catch {
    // ignore: keep defaults
  }
}

