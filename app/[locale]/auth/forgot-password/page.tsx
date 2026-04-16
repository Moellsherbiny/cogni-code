"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sendForgotPasswordOTP } from "@/actions/auth/forgot-password";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);

    startTransition(async () => {
      const result = await sendForgotPasswordOTP({ email });
      if (result.error) {
        setError(result.error);
      } else {
        setSent(true);
        setTimeout(() => {
          router.push(
            `/auth/verify?email=${encodeURIComponent(email)}&mode=reset`,
          );
        }, 1000);
      }
    });
  };

  return (
    <main className="relative min-h-screen  flex items-center justify-center overflow-hidden">
      {/* background blobs */}

      {/* card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="relative">
          {/* back */}
          <Button asChild variant="link" className="mb-6">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3 h-3" />
              {t("back")}
            </Link>
          </Button>

          {/* icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-xl scale-150" />
              <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("description")}
            </p>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <p className="text-emerald-400 font-semibold text-sm">
                {t("sentMessage")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  {t("emailLabel")}
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={cn(
                    "h-12 rounded-xl primary placeholder:primary/20",
                    "focus:border-indigo-500 focus:ring-0 transition-all duration-200",
                  )}
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={!email || isPending}
                className={cn(
                  "w-full h-12 rounded-xl font-semibold text-sm transition-all duration-200",
                  "bg-linear-to-r from-indigo-600 to-violet-600",
                  "hover:from-indigo-500 hover:to-violet-500",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                  "shadow-lg shadow-indigo-500/20",
                )}
              >
                {isPending ? (
                  t("sending")
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    {t("submitButton")}
                  </span>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
