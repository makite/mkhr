/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import api from "@/lib/api";
import { useCompanyBranding } from "@/services/company-branding";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Shield,
  Users,
  Building,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const branding = useCompanyBranding();

  const token = useMemo(() => params.get("token") || "", [params]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or expired reset link. Please request a new one.");
      toast.error("Invalid reset link", {
        description: "Password reset token is missing.",
      });
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Reset token is missing or expired.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      setSuccess(true);
      toast.success("Password updated", {
        description: "Your corporate password has been reset successfully.",
      });
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message || "Failed to reset password";
      setError(msg);
      toast.error("Reset failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

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
        {/* ── LEFT PANEL: BRAND FLUID BLUE WAVE (48%) ────────────────────────── */}
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

          {/* Top Logo & Company Name */}
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
                Reset Password
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-1">
                Set a strong corporate password to secure your account.
              </p>
            </div>

            {success ? (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm">Password Updated</h3>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">
                      Your password has been reset successfully. You can now log in using your new credentials.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white shadow-md hover:brightness-110 active:brightness-90 transition-all cursor-pointer"
                  style={{
                    backgroundColor: branding.primaryColor,
                  }}
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Go to Login</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/15 backdrop-blur-md border border-rose-400/30 flex items-start gap-2.5 text-white">
                    <AlertCircle className="w-4 h-4 text-rose-300 mt-0.5 shrink-0" />
                    <div className="text-xs font-medium leading-relaxed">{error}</div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-xs font-medium text-white/90 mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative group">
                    <input
                      id="new-password"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="At least 8 characters"
                      className="w-full pl-4 pr-10 py-3 text-sm rounded-xl bg-white text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 transition-all font-mono tracking-wide"
                      style={{
                        outlineColor: branding.primaryColor,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-medium text-white/90 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <input
                      id="confirm-password"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Repeat new password"
                      className="w-full pl-4 pr-10 py-3 text-sm rounded-xl bg-white text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 transition-all font-mono tracking-wide"
                      style={{
                        outlineColor: branding.primaryColor,
                      }}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 transition-colors">
                      <Lock className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="group w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white shadow-md hover:brightness-110 active:brightness-90 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    style={{
                      backgroundColor: branding.primaryColor,
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Updating password...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Password</span>
                        <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to login</span>
                  </Link>
                </div>

                {/* Brand Security Note */}
                <div className="pt-2">
                  <div className="w-full py-2.5 px-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center text-xs text-white/90 flex items-center justify-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-white/80 shrink-0" />
                    <span className="font-medium text-[11px]">
                      {branding.companyName} Account Security
                    </span>
                  </div>
                </div>
              </form>
            )}
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
}
