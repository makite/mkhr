import { LoginForm } from "@/components/login/login-form";
import { useCompanyBranding } from "@/services/company-branding";
import { Users, Building, ShieldCheck } from "lucide-react";

const LoginPage = () => {
  const branding = useCompanyBranding();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[var(--brand-primary)] selection:text-white relative overflow-hidden transition-colors"
      style={{
        backgroundColor: branding.secondaryColor || "#ecf0f2",
      }}
    >
      {/* ── BACKGROUND AMBIENT BRAND WAVES ──────────────────────────────────── */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: branding.primaryColor || "#015896" }}
      />
      <div
        className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ backgroundColor: branding.primaryColor || "#015896" }}
      />

      {/* ── MASTER FLOATING CONTAINER (60/40 SPLIT WITH FLUID WAVES) ───────── */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden flex flex-col lg:flex-row min-h-[620px]">
        {/* ── LEFT PANEL: BRAND FLUID BLUE WAVE SIGN-IN (48%) ────────────────── */}
        <div
          className="lg:w-[48%] xl:w-[46%] relative text-white p-8 sm:p-11 flex flex-col justify-between overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${branding.primaryColor || "#015896"} 0%, #001f36 100%)`,
          }}
        >
          {/* Subtle Organic Wave Layers */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
            <svg
              className="absolute -bottom-10 -left-10 w-[140%] h-[120%]"
              viewBox="0 0 500 500"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#ffffff"
                d="M44.5,-63.3C57.4,-54.6,67.5,-41.8,72.4,-27.4C77.4,-13,77.1,3,72.8,17.4C68.5,31.7,60.1,44.4,48.5,54.1C36.9,63.7,22,70.3,5.9,72.3C-10.2,74.3,-27.6,71.7,-41.6,63.1C-55.7,54.6,-66.5,40.1,-72.1,24.1C-77.8,8.1,-78.3,-9.4,-72.4,-24.5C-66.5,-39.7,-54.1,-52.4,-40.1,-60.7C-26.1,-69,-10.5,-72.8,3.2,-77.3C16.9,-81.7,31.6,-71.9,44.5,-63.3Z"
                transform="translate(250 250)"
              />
            </svg>
          </div>

          {/* Top Logo & Cached Company Name */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white shadow-md flex items-center justify-center p-2 shrink-0">
              <img
                src={branding.logoUrl || "/mk_logo.png"}
                alt={branding.companyName}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white uppercase">
                {branding.companyName}
              </div>
              <p className="text-[11px] text-white/80 font-medium">
                {branding.legalName}
              </p>
            </div>
          </div>

          {/* Center Form Section */}
          <div className="relative z-10 my-auto py-6">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back!
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-1">
                {branding.tagline || "Sign in to access your enterprise account."}
              </p>
            </div>

            <LoginForm />
          </div>

          {/* Footer */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
            <span>© {new Date().getFullYear()} {branding.companyName}</span>
            <span>Addis Ababa, Ethiopia</span>
          </div>
        </div>

        {/* ── RIGHT PANEL: HABESHA RECEPTIONIST & WORKSPACE (52%) ───────────── */}
        <div className="lg:w-[52%] xl:w-[54%] bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between items-center relative overflow-hidden">
          {/* Top ERP Header */}
          <div className="w-full flex items-center justify-between relative z-10 mb-3">
            <div
              className="text-xs font-bold tracking-wide uppercase"
              style={{ color: branding.primaryColor || "#015896" }}
            >
              Enterprise ERP Portal
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Addis Ababa Headquarters
            </div>
          </div>

          {/* Central Habesha Receptionist Showcase Card */}
          <div className="relative z-10 my-auto flex flex-col items-center max-w-lg w-full">
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border border-slate-200 group">
              <img
                src="/habesha_receptionist.jpg"
                alt="Habesha Corporate Receptionist"
                className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-5">
                <span className="text-xs uppercase tracking-widest font-semibold text-white/90">
                  {branding.companyName}
                </span>
                <p className="text-white font-bold text-sm sm:text-base">
                  Corporate Headquarters & Operations
                </p>
              </div>
            </div>

            {/* Clean Feature Badges in Company Brand Styling */}
            <div className="w-full mt-4 space-y-2.5">
              <div
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200"
                style={{
                  backgroundColor: `${branding.secondaryColor || "#ecf0f2"}80`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0"
                  style={{ color: branding.primaryColor || "#015896" }}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Workforce & Operations
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Unified employee management, attendance & operations
                  </div>
                </div>
              </div>

              <div
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200"
                style={{
                  backgroundColor: `${branding.secondaryColor || "#ecf0f2"}80`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0"
                  style={{ color: branding.primaryColor || "#015896" }}
                >
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Enterprise Resource Planning
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {branding.legalName} organizational structure & branch network
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="w-full flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400">
            <span>{branding.companyName}</span>
            <span
              className="flex items-center gap-1 font-medium"
              style={{ color: branding.primaryColor || "#015896" }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enterprise ERP Portal</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
