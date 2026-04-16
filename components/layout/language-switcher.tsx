"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Check, Languages, Loader2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ar", label: "العربية", flag: "🇪🇬" },
] as const;

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLang = LANGUAGES.find((l) => l.code === locale);

  const onSelectChange = (nextLocale: "en" | "ar") => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "gap-2 px-2 md:px-3 h-9 rounded-full hover:bg-muted transition-all",
            isPending && "opacity-50 pointer-events-none"
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline-block">
            {currentLang?.code}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-37.5 rounded-xl p-1">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onSelectChange(lang.code)}
            className={cn(
              "flex items-center justify-between cursor-pointer rounded-lg py-2 px-3",
              locale === lang.code && "bg-primary/5 text-primary font-medium"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="text-base">{lang.flag}</span>
              <span className="text-sm">{lang.label}</span>
            </div>
            {locale === lang.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}