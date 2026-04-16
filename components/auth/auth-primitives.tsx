"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Google SVG ───────────────────────────────────────────────────────────────
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── Field error ──────────────────────────────────────────────────────────────
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs text-destructive" role="alert">
      {message}
    </p>
  );
}

// ─── Field label ──────────────────────────────────────────────────────────────
export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
    >
      {children}
    </label>
  );
}

// ─── Password input ───────────────────────────────────────────────────────────
export function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  hasError,
  autoComplete = "current-password",
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  hasError?: boolean;
  autoComplete?: string;
}) {
  const t = useTranslations("auth");
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={cn(
          "h-10 pe-10 transition-colors",
          hasError && "border-destructive focus-visible:ring-destructive/30"
        )}
      />
      <button
        type="button"
        aria-label={show ? t("hidePassword") : t("showPassword")}
        onClick={() => setShow((p) => !p)}
        className="absolute inset-e-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

// ─── Or divider ───────────────────────────────────────────────────────────────
export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}

// ─── Mobile brand logo ────────────────────────────────────────────────────────
export function MobileLogo({ brand }: { brand: string }) {
  return (
    <div className="flex items-center gap-2 text-primary mb-3 md:hidden">
      <GraduationCap className="w-5 h-5" />
      <span className="text-sm font-bold tracking-tight">{brand}</span>
    </div>
  );
}

// ─── Role card ────────────────────────────────────────────────────────────────
export function RoleCard({
  label,
  description,
  icon: Icon,
  selected,
  onSelect,
}: {
  label: string;
  description: string;
  icon: React.ElementType;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border text-start w-full transition-all duration-150",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-muted-foreground/40 hover:bg-muted/40"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors",
          selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className={cn("text-sm font-semibold", selected ? "text-primary" : "text-foreground")}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground leading-snug mt-0.5">{description}</p>
      </div>
    </button>
  );
}