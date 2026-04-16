"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GoogleIcon,
  FieldError,
  FieldLabel,
  PasswordInput,
  OrDivider,
  MobileLogo,
} from "@/components/auth/auth-primitives";
import { cn } from "@/lib/utils";

// ─── Validation ───────────────────────────────────────────────────────────────
type Errors = { email?: string; password?: string };

function useValidation() {
  const t = useTranslations("auth.validation");
  return (email: string, password: string): Errors => {
    const e: Errors = {};
    if (!email) e.email = t("emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t("emailInvalid");
    if (!password) e.password = t("passwordRequired");
    else if (password.length < 6) e.password = t("passwordMin");
    return e;
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const t = useTranslations("auth");
  const tl = useTranslations("auth.login");
  const validate = useValidation();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (field: "email" | "password") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...form, [field]: e.target.value };
    setForm(next);
    if (touched[field]) setErrors(validate(next.email, next.password));
  };

  const blur = (field: "email" | "password") => () => {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors(validate(form.email, form.password));
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validate(form.email, form.password);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (res?.ok) {
      toast.success(tl("successToast"));
      router.push("/student");
    } else {
      toast.error(tl("errorToast"));
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google");
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="space-y-1.5">
        <MobileLogo brand={t("brand")} />
        <h1 className="text-2xl font-black tracking-tight text-foreground">{tl("title")}</h1>
        <p className="text-sm text-muted-foreground">{tl("subtitle")}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <FieldLabel htmlFor="email">{tl("email")}</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={tl("emailPlaceholder")}
            value={form.email}
            onChange={set("email")}
            onBlur={blur("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={cn(
              "h-10 transition-colors",
              errors.email && "border-destructive focus-visible:ring-destructive/30"
            )}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">{tl("password")}</FieldLabel>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {tl("forgot")}
            </Link>
          </div>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={set("password")}
            onBlur={blur("password")}
            placeholder={tl("passwordPlaceholder")}
            hasError={!!errors.password}
            autoComplete="current-password"
          />
          <FieldError id="password-error" message={errors.password} />
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full h-10 font-semibold" disabled={loading || googleLoading}>
          {loading ? (
            <><Loader2 className="w-4 h-4 me-2 animate-spin" />{tl("submitting")}</>
          ) : tl("submit")}
        </Button>
      </form>

      <OrDivider label={tl("or")} />

      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 gap-2.5 font-medium"
        onClick={handleGoogle}
        disabled={loading || googleLoading}
      >
        {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon className="w-4 h-4" />}
        {tl("google")}
      </Button>

      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground">
        {tl("noAccount")}{" "}
        <Link href="/auth/register" className="font-semibold text-foreground hover:text-primary transition-colors underline-offset-2 hover:underline">
          {tl("signUp")}
        </Link>
      </p>
    </div>
  );
}