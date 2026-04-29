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

const Excalidraw = dynamic(
  async () =>
    (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => <WhiteboardSkeleton />,
  }
);

import "@excalidraw/excalidraw/index.css";

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

function WhiteboardSkeleton() {
  return (
    <div className="w-full h-full min-h-125 bg-muted/50 animate-pulse rounded-xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <PenLine className="w-8 h-8 animate-bounce opacity-40" />
        <span className="text-sm font-medium tracking-wide opacity-60">
          Loading canvas…
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface WhiteboardProps {
  className?: string;
  title?: string;
  minHeight?: string;
  showFocusToggle?: boolean;
  onFocusModeChange?: (active: boolean) => void;
  toolbarActions?: React.ReactNode;
  canvasClassName?: string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

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

  // Focus mode
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

  // Esc shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocusMode) {
        toggleFocusMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode, toggleFocusMode]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = isFocusMode ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFocusMode]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Canvas
  const renderCanvas = () => (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden rounded-xl border border-border/60 bg-card shadow-inner",
        canvasClassName
      )}
    >
      {mounted ? (
        <Excalidraw
          theme={isDark ? "dark" : "light"}
        />
      ) : (
        <WhiteboardSkeleton />
      )}
    </div>
  );

  // Focus mode
  if (isFocusMode) {
    return (
      <div className="fixed inset-0 z-9999 flex flex-col bg-background/95 backdrop-blur-sm p-3 gap-3">
        <div className="flex items-center justify-between px-2 py-1 shrink-0">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />

            <span className="text-sm font-semibold tracking-tight">
              {title}
            </span>

            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
            >
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
                  </Button>
                </TooltipTrigger>

                <TooltipContent side="left">
                  Exit focus mode
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="relative flex-1 min-h-0">
          {renderCanvas()}
        </div>
      </div>
    );
  }

  // Normal mode
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
                    className="h-7 gap-1.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    onClick={() => toggleFocusMode()}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Focus
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  Expand to full screen
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 p-3 min-h-0">
        <div className="absolute inset-3">
          {renderCanvas()}
        </div>
      </div>
    </div>
  );
}

export default Whiteboard;