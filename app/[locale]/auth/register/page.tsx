"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Loader2, UserRound, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GoogleIcon,
  FieldError,
  FieldLabel,
  PasswordInput,
  OrDivider,
  MobileLogo,
  RoleCard,
} from "@/components/auth/auth-primitives";
import { cn } from "@/lib/utils";

// ─── Validation ───────────────────────────────────────────────────────────────
type FormFields = { name: string; email: string; password: string };
type Errors = Partial<FormFields>;

function useValidation() {
  const t = useTranslations("auth.validation");
  return (form: FormFields): Errors => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = t("nameRequired");
    else if (form.name.trim().length < 2) e.name = t("nameMin");
    if (!form.email) e.email = t("emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("emailInvalid");
    if (!form.password) e.password = t("passwordRequired");
    else if (form.password.length < 6) e.password = t("passwordMin");
    return e;
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const t = useTranslations("auth");
  const tr = useTranslations("auth.register");
  const validate = useValidation();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as "student" | "teacher",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (field: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...form, [field]: e.target.value };
    setForm(next);
    if (touched[field]) setErrors(validate(next));
  };

  const blur = (field: keyof FormFields) => () => {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors(validate(form));
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(tr("successToast"));
        router.push(`/auth/verify?email=${encodeURIComponent(form.email)}&mode=register`);
      } else {
        const data = await res.json();
        toast.error(data.message || tr("errorToast"));
      }
    } catch {
      toast.error(tr("networkError"));
    }
    setLoading(false);
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
        <h1 className="text-2xl font-black tracking-tight text-foreground">{tr("title")}</h1>
        <p className="text-sm text-muted-foreground">{tr("subtitle")}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleRegister} noValidate className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <FieldLabel htmlFor="name">{tr("name")}</FieldLabel>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder={tr("namePlaceholder")}
            value={form.name}
            onChange={set("name")}
            onBlur={blur("name")}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={cn(
              "h-10 transition-colors",
              errors.name && "border-destructive focus-visible:ring-destructive/30"
            )}
          />
          <FieldError id="name-error" message={errors.name} />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <FieldLabel htmlFor="email">{tr("email")}</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={tr("emailPlaceholder")}
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
          <FieldLabel htmlFor="password">{tr("password")}</FieldLabel>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={set("password")}
            onBlur={blur("password")}
            placeholder={tr("passwordPlaceholder")}
            hasError={!!errors.password}
            autoComplete="new-password"
          />
          <FieldError id="password-error" message={errors.password} />
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <FieldLabel htmlFor="role">{tr("roleLabel")}</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            <RoleCard
              label={tr("roleStudent")}
              description={tr("roleStudentDesc")}
              icon={UserRound}
              selected={form.role === "student"}
              onSelect={() => setForm((p) => ({ ...p, role: "student" }))}
            />
            <RoleCard
              label={tr("roleTeacher")}
              description={tr("roleTeacherDesc")}
              icon={BookOpen}
              selected={form.role === "teacher"}
              onSelect={() => setForm((p) => ({ ...p, role: "teacher" }))}
            />
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full h-10 font-semibold" disabled={loading || googleLoading}>
          {loading ? (
            <><Loader2 className="w-4 h-4 me-2 animate-spin" />{tr("submitting")}</>
          ) : tr("submit")}
        </Button>
      </form>

      <OrDivider label={tr("or")} />

      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 gap-2.5 font-medium"
        onClick={handleGoogle}
        disabled={loading || googleLoading}
      >
        {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon className="w-4 h-4" />}
        {tr("google")}
      </Button>

      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground">
        {tr("hasAccount")}{" "}
        <Link href="/auth/login" className="font-semibold text-foreground hover:text-primary transition-colors underline-offset-2 hover:underline">
          {tr("signIn")}
        </Link>
      </p>
    </div>
  );
}