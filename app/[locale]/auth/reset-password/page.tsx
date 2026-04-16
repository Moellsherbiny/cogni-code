"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { resetPassword } from "@/actions/auth/reset-password";
import { KeyRound, Eye, EyeOff, Check, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

// ── password strength ────────────────────────────────────────────────────────

function getStrength(password: string): {
  score: number;   // 0–4
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8)  score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "",         color: "bg-white/10" },
    { label: "Weak",     color: "bg-red-500" },
    { label: "Fair",     color: "bg-amber-500" },
    { label: "Good",     color: "bg-blue-500" },
    { label: "Strong",   color: "bg-emerald-500" },
  ];

  return { score, ...levels[score] };
}

const requirements = [
  { label: "At least 8 characters",          test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",            test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number",                      test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character",           test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

// ────────────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const t = useTranslations("resetPassword");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState(false);
  const [isPending, startTransition] = useTransition();

  const strength   = getStrength(password);
  const match      = password && confirm && password === confirm;
  const mismatch   = confirm.length > 0 && password !== confirm;
  const canSubmit  = strength.score >= 3 && match && !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    startTransition(async () => {
      const result = await resetPassword({ token, password });
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    });
  };

  return (
    <main className="relative min-h-screen bg-[#0a0a0f] flex items-center justify-center overflow-hidden">

      {/* ── background blobs (matches verify page) ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-125 h-125 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-125 h-125 rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full bg-fuchsia-700/10 blur-[100px]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ── card ── */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/40 via-violet-500/20 to-fuchsia-500/30 blur-sm" />
        <div className="relative rounded-2xl bg-[#0f0f1a]/90 backdrop-blur-xl border border-white/[0.06] p-8 shadow-2xl">

          {/* back link */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-6"
          >
            <ArrowLeft className="w-3 h-3" />
            {t("back")}
          </Link>

          {/* icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-xl scale-150" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                {success
                  ? <ShieldCheck className="w-8 h-8 text-white" />
                  : <KeyRound    className="w-8 h-8 text-white" />
                }
              </div>
            </div>
          </div>

          {/* heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              {t("title")}
            </h1>
            <p className="text-sm text-white/50 leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* ── success state ── */}
          {success ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-emerald-400 font-semibold">{t("successMessage")}</p>
              <p className="text-white/40 text-sm">{t("redirecting")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* new password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
                  {t("newPassword")}
                </label>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={cn(
                      "h-12 rounded-xl bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20",
                      "focus:border-indigo-500 focus:ring-0 focus:bg-indigo-500/[0.06]",
                      "pr-11 transition-all duration-200"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* strength bar */}
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            i <= strength.score ? strength.color : "bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <p className={cn(
                        "text-xs font-medium transition-colors",
                        strength.score === 1 && "text-red-400",
                        strength.score === 2 && "text-amber-400",
                        strength.score === 3 && "text-blue-400",
                        strength.score === 4 && "text-emerald-400",
                      )}>
                        {strength.label}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* confirm password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-widest">
                  {t("confirmPassword")}
                </label>
                <div className="relative">
                  <Input
                    type={showConf ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={cn(
                      "h-12 rounded-xl bg-white/4 border-white/8 text-white placeholder:text-white/20",
                      "focus:ring-0 transition-all duration-200 pr-11",
                      mismatch  && "border-red-500/60    bg-red-500/6    focus:border-red-500",
                      match     && "border-emerald-500/60 bg-emerald-500/6 focus:border-emerald-500",
                      !mismatch && !match && "focus:border-indigo-500 focus:bg-indigo-500/6"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConf((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {match && (
                    <Check className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 pointer-events-none" />
                  )}
                </div>
                {mismatch && (
                  <p className="text-xs text-red-400">{t("passwordMismatch")}</p>
                )}
              </div>

              {/* requirements checklist */}
              {password.length > 0 && (
                <ul className="space-y-1.5 rounded-xl bg-white/2 border border-white/[0.05] p-3">
                  {requirements.map((req) => {
                    const met = req.test(password);
                    return (
                      <li key={req.label} className="flex items-center gap-2">
                        <div className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200",
                          met ? "bg-emerald-500" : "bg-white/10"
                        )}>
                          {met && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className={cn(
                          "text-xs transition-colors duration-200",
                          met ? "text-white/70" : "text-white/30"
                        )}>
                          {req.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* global error */}
              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              {/* submit */}
              <Button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "w-full h-12 rounded-xl font-semibold text-sm transition-all duration-200",
                  "bg-linear-to-r from-indigo-600 to-violet-600",
                  "hover:from-indigo-500 hover:to-violet-500",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  "shadow-lg shadow-indigo-500/20"
                )}
              >
                {isPending ? t("saving") : t("submitButton")}
              </Button>
            </form>
          )}

        </div>
      </div>
    </main>
  );
}