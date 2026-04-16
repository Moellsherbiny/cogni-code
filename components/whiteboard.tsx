"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import {
  Maximize2,
  PenLine,
  X,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import "./whiteboard.css"
const Tldraw = dynamic(async () => (await import("tldraw")).Tldraw, {
  ssr: false,
  loading: () => <WhiteboardSkeleton />,
});

import "tldraw/tldraw.css";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function WhiteboardSkeleton() {
  return (
    <div className="w-full h-full min-h-100 bg-muted/50 animate-pulse rounded-xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <PenLine className="w-8 h-8 animate-bounce opacity-40" />
        <span className="text-sm font-medium tracking-wide opacity-60">
          Loading canvas…
        </span>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WhiteboardProps {
  /** Extra class names applied to the root wrapper */
  className?: string;
  /** Title shown in the header */
  title?: string;
  /** Minimum height when not in focus mode (Tailwind class, e.g. "min-h-[500px]") */
  minHeight?: string;
  /** Show / hide the focus-mode toggle button */
  showFocusToggle?: boolean;
  /** Callback fired when focus mode changes */
  onFocusModeChange?: (active: boolean) => void;
  /** Additional toolbar actions rendered next to the built-in buttons */
  toolbarActions?: React.ReactNode;
  /** tldraw className override */
  canvasClassName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Whiteboard({
  className,
  title = "Whiteboard",
  minHeight = "min-h-[500px]",
  showFocusToggle = true,
  onFocusModeChange,
  toolbarActions,
  canvasClassName,
}: WhiteboardProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDark = resolvedTheme === "dark";

  // ── Focus mode ──────────────────────────────────────────────────────────────
  const toggleFocusMode = useCallback(
    (next?: boolean) => {
      setIsFocusMode((prev) => {
        const value = next !== undefined ? next : !prev;
        onFocusModeChange?.(value);
        return value;
      });
    },
    [onFocusModeChange]
  );

  // ── Keyboard shortcut ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocusMode) toggleFocusMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode, toggleFocusMode]);

  // ── Scroll lock in focus mode ───────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isFocusMode ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFocusMode]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Canvas renderer ─────────────────────────────────────────────────────────
  const renderCanvas = () => (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden rounded-xl border border-border/60 bg-card shadow-inner",
        "[&_.tl-container]:rounded-xl!",
        "[&_.tl-background]:rounded-xl",
        canvasClassName
      )}
    >
      {mounted ? (
        <Tldraw inferDarkMode={isDark} className="w-full h-full" />
      ) : (
        <WhiteboardSkeleton />
      )}
    </div>
  );

  // ─── Focus-mode overlay ─────────────────────────────────────────────────────
  if (isFocusMode) {
    return (
      <div className="fixed inset-0 z-9999 flex flex-col bg-background/95 backdrop-blur-sm p-3 gap-3">
        {/* Slim top bar */}
        <div className="flex items-center justify-between px-2 py-1 shrink-0">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold tracking-tight">
              {title}
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Focus
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            {toolbarActions}
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => toggleFocusMode(false)}
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Exit focus mode</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Exit focus mode <kbd className="ml-1 opacity-60">Esc</kbd>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Canvas fills remaining focus-mode space */}
        <div className="relative flex-1" style={{ minHeight: 0 }}>
          {renderCanvas()}
        </div>
      </div>
    );
  }

  // ─── Normal card ────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col w-full rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden",
        minHeight,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <PenLine className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {toolbarActions}

          {showFocusToggle && (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-7 gap-1.5 text-xs font-medium transition-colors",
                      "hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    )}
                    onClick={() => toggleFocusMode()}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Focus
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Expand to full screen</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Canvas — grows to fill whatever height the parent gives */}
      <div className="relative flex-1 p-3" style={{ minHeight: 0 }}>
        <div
          className={cn(
            "absolute inset-3 overflow-hidden rounded-xl border border-border/60 bg-card shadow-inner",
            "[&_.tl-container]:rounded-xl!",
            "[&_.tl-background]:rounded-xl",
            canvasClassName
          )}
        >
          {mounted ? (
            <Tldraw inferDarkMode={isDark} className="w-full h-full" />
          ) : (
            <WhiteboardSkeleton />
          )}
        </div>
      </div>
    </div>
  );
}

export default Whiteboard;