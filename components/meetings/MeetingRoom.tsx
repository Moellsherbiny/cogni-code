// components/meetings/MeetingRoom.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  Maximize2, X, GripVertical, Video, VideoOff,
  Mic, MicOff, PhoneOff, Users, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { setMeetingActive } from "@/actions/meetings";

declare global {
  interface Window { JitsiMeetExternalAPI: any; }
}

// ─── Skeleton (mirrors WhiteboardSkeleton) ────────────────────────────────────

function MeetingSkeleton() {
  return (
    <div className="w-full h-full min-h-100 bg-muted/50 animate-pulse rounded-xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Video className="w-8 h-8 animate-bounce opacity-40" />
        <span className="text-sm font-medium tracking-wide opacity-60">
          Connecting to meeting…
        </span>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MeetingRoomProps {
  className?: string;
  title?: string;
  roomName: string;
  meetingId: string;
  displayName: string;
  email: string;
  isModerator?: boolean;
  minHeight?: string;
  showFocusToggle?: boolean;
  onFocusModeChange?: (active: boolean) => void;
  toolbarActions?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MeetingRoom({
  className,
  title = "Live Meeting",
  roomName,
  meetingId,
  displayName,
  email,
  isModerator = false,
  minHeight = "min-h-[600px]",
  showFocusToggle = true,
  onFocusModeChange,
  toolbarActions,
}: MeetingRoomProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);           // seconds
  const [participantCount, setParticipantCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  // ── Focus mode (same pattern as Whiteboard) ──────────────────────────────
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocusMode) toggleFocusMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode, toggleFocusMode]);

  useEffect(() => {
    document.body.style.overflow = isFocusMode ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFocusMode]);

  // ── Meeting timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // ── Jitsi bootstrap ───────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !jitsiContainerRef.current) return;

    const init = () => {
      if (!window.JitsiMeetExternalAPI || !jitsiContainerRef.current) return;

      apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName,
        parentNode: jitsiContainerRef.current,
        width: "100%",
        height: "100%",
        userInfo: { displayName, email },
        configOverwrite: {
          startWithAudioMuted: !isModerator,
          startWithVideoMuted: !isModerator,
          prejoinPageEnabled: true,
          enableNoisyMicDetection: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone", "camera", "desktop", "fullscreen",
            "fodeviceselection", "hangup", "chat", "raisehand",
            "videoquality", "tileview", "closedcaptions",
            ...(isModerator ? ["mute-everyone", "security"] : []),
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
      });

      apiRef.current.addEventListener("participantJoined", () => {
        setParticipantCount((n) => n + 1);
      });
      apiRef.current.addEventListener("participantLeft", () => {
        setParticipantCount((n) => Math.max(0, n - 1));
      });
      apiRef.current.addEventListener("readyToClose", handleLeave);
    };

    if (window.JitsiMeetExternalAPI) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = init;
      document.body.appendChild(script);
    }

    return () => { apiRef.current?.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // ── Leave / end ───────────────────────────────────────────────────────────
  const handleLeave = useCallback(async () => {
    apiRef.current?.dispose();
    if (isModerator) await setMeetingActive(meetingId, false);
    router.push("/meetings");
  }, [isModerator, meetingId, router]);

  // ── Jitsi canvas ──────────────────────────────────────────────────────────
  const renderCanvas = () => (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden rounded-xl border border-border/60 bg-black shadow-inner",
        "[&_iframe]:rounded-xl"
      )}
    >
      {mounted ? (
        <div ref={jitsiContainerRef} className="w-full h-full" />
      ) : (
        <MeetingSkeleton />
      )}
    </div>
  );

  // ── Header bar (shared between modes) ────────────────────────────────────
  const renderHeader = (compact = false) => (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border/50 bg-muted/30 shrink-0",
        compact ? "px-2 py-1" : "px-4 py-2.5"
      )}
    >
      <div className="flex items-center gap-2">
        {compact && <GripVertical className="w-4 h-4 text-muted-foreground" />}
        {!compact && <Video className="w-4 h-4 text-red-500 animate-pulse" />}
        <span className={cn("font-semibold tracking-tight", compact ? "text-sm" : "text-sm text-foreground")}>
          {title}
        </span>
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 animate-pulse">
          LIVE
        </Badge>
        {compact && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Focus</Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Timer */}
        <span className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
          <Clock className="w-3 h-3" />
          {formatElapsed(elapsed)}
        </span>

        {/* Participants */}
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          {participantCount + 1}
        </span>

        {toolbarActions}

        {/* Focus toggle */}
        {showFocusToggle && !compact && (
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

        {/* Exit focus */}
        {compact && (
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
        )}

        {/* Leave / End button */}
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={handleLeave}
              >
                <PhoneOff className="w-3.5 h-3.5" />
                {isModerator ? "End" : "Leave"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isModerator ? "End meeting for everyone" : "Leave the meeting"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  // ─── Focus-mode overlay ──────────────────────────────────────────────────
  if (isFocusMode) {
    return (
      <div className="fixed inset-0 z-9999 flex flex-col bg-background/95 backdrop-blur-sm p-3 gap-3">
        {renderHeader(true)}
        <div className="relative flex-1" style={{ minHeight: 0 }}>
          {renderCanvas()}
        </div>
      </div>
    );
  }

  // ─── Normal card ─────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col w-full rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden",
        minHeight,
        className
      )}
    >
      {renderHeader(false)}
      <div className="relative flex-1 p-3" style={{ minHeight: 0 }}>
        <div
          className={cn(
            "absolute inset-3 overflow-hidden rounded-xl border border-border/60 bg-black shadow-inner",
            "[&_iframe]:rounded-xl"
          )}
        >
          {mounted ? (
            <div ref={jitsiContainerRef} className="w-full h-full" />
          ) : (
            <MeetingSkeleton />
          )}
        </div>
      </div>
    </div>
  );
}

export default MeetingRoom;