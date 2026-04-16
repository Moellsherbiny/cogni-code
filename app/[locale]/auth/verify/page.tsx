"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { verifyOTP, resendOTP } from "@/actions/verify";
import { ShieldCheck, Mail, RefreshCw, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function VerifyPage() {
  const t = useTranslations("verify");
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";
  const mode = (searchParams.get("mode") as "register" | "reset") ?? "register";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();

  /* ── countdown timer ── */
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  /* ── auto-submit when 6 digits entered ── */
  useEffect(() => {
    if (otp.length === 6) handleSubmit(otp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleSubmit = (value: string) => {
    if (value.length !== 6) return;
    setError(null);
    startTransition(async () => {
      const result = await verifyOTP({ email, otp: value, mode });
      if (result.error) {
        setError(result.error);
        setOtp("");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push(mode === "reset" ? `/auth/reset-password?token=${result.token}` : "/");
        }, 1200);
      }
    });
  };

  const handleResend = () => {
    setError(null);
    setCanResend(false);
    setCountdown(60);
    startResendTransition(async () => {
      const result = await resendOTP({ email, mode });
      if (result.error) setError(result.error);
    });
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* ── card ── */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="relative">

          {/* back link */}
          <Link
            href={mode === "reset" ? "/auth/forgot-password" : "/auth/register"}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-3 h-3" />
            {t("back")}
          </Link>

          {/* icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-xl scale-150" />
              <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                {success ? (
                  <ShieldCheck className="w-8 h-8 text-white animate-scale-in" />
                ) : (
                  <Mail className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              {mode === "reset" ? t("titleReset") : t("titleRegister")}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("description")}{" "}
              <span className="text-indigo-400 font-medium">{email}</span>
            </p>
          </div>

          {/* OTP input */}
          <div className={cn("flex justify-center mb-6 transition-all duration-300", success && "opacity-0 scale-95")}>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={isPending || success}
              className="gap-2"
            >
              <InputOTPGroup className="gap-2" dir="ltr">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className={cn(
                      "w-12 h-14 text-xl font-bold rounded-xl border",
                      "bg-white/4 border-white/8 text-primary",
                      "focus:border-indigo-500 focus:bg-indigo-500/10 focus:ring-0",
                      "transition-all duration-200",
                      error && "border-red-500/60 bg-red-500/10",
                      success && "border-emerald-500/60 bg-emerald-500/10 text-emerald-400"
                    )}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* success state */}
          {success && (
            <div className="text-center mb-6 animate-fade-in">
              <p className="text-emerald-400 font-semibold text-sm">
                {mode === "reset" ? t("successReset") : t("successRegister")}
              </p>
            </div>
          )}

          {/* error */}
          {error && (
            <p className="text-center text-sm text-red-400 mb-4 animate-fade-in">
              {error}
            </p>
          )}

          {/* verify button */}
          <Button
            onClick={() => handleSubmit(otp)}
            disabled={otp.length !== 6 || isPending || success}
            className={cn(
              "w-full h-12 rounded-xl font-semibold text-sm transition-all duration-200",
              "bg-linear-to-r from-indigo-600 to-violet-600",
              "hover:from-indigo-500 hover:to-violet-500",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "shadow-lg shadow-indigo-500/20"
            )}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t("verifying")}
              </span>
            ) : (
              t("verifyButton")
            )}
          </Button>

          {/* resend */}
          <div className="mt-5 text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium inline-flex items-center gap-1.5"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isResending && "animate-spin")} />
                {t("resend")}
              </button>
            ) : (
              <p className="text-sm text-primary/30">
                {t("resendIn")}{" "}
                <span className="text-primary/60 tabular-nums font-medium">0:{countdown.toString().padStart(2, "0")}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}