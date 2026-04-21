"use client";

import { useEffect, useRef } from "react";

interface JitsiProps {
  roomName: string;
  userName: string;
  onClose: () => void;
}

export default function JitsiMeeting({ roomName, userName, onClose }: JitsiProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Jitsi script dynamically
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (jitsiContainerRef.current) {
        const domain = "meet.jit.si";
        const options = {
          roomName: roomName,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          userInfo: { displayName: userName },
          configOverwrite: {
            startWithAudioMuted: true,
            disableModeratorIndicator: false,
            startScreenSharing: false,
          },
          interfaceConfigOverwrite: {
            TILE_VIEW_MAX_COLUMNS: 8,
          },
        };

        // @ts-ignore
        const api = new window.JitsiMeetExternalAPI(domain, options);
        
        api.addEventListener("videoConferenceLeft", () => {
          onClose();
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [roomName, userName]);

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="absolute top-4 right-4 z-60">
        <button 
          onClick={onClose}
          className="bg-destructive text-white px-4 py-2 rounded-md font-bold"
        >
          Leave Meeting
        </button>
      </div>
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  );
}