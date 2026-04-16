"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
] as const;

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 md:w-24 bg-muted animate-pulse rounded-full" />;
  }

  // Find current theme details (fallback to system if undefined)
  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[2];
  const Icon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 px-2 md:px-3 h-9 rounded-full hover:bg-muted transition-all"
        >
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline-block">
            {currentTheme.label}
          </span>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-37.5 rounded-xl p-1">
        {THEMES.map((t) => {
          const ItemIcon = t.icon;
          return (
            <DropdownMenuItem
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex items-center justify-between cursor-pointer rounded-lg py-2 px-3",
                theme === t.id && "bg-primary/5 text-primary font-medium"
              )}
            >
              <div className="flex items-center gap-3">
                <ItemIcon className="h-4 w-4" />
                <span className="text-sm">{t.label}</span>
              </div>
              {theme === t.id && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}