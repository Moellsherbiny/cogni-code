"use client";

import { JitsiMeeting } from '@jitsi/react-sdk';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface JitsiRoomProps {
  roomName: string;
  userName: string;
  userEmail?: string;
}

export default function JitsiRoom({ roomName, userName, userEmail }: JitsiRoomProps) {
  const router = useRouter();

  return (
    <div className="h-[calc(100vh-64px)] w-full border rounded-lg overflow-hidden bg-muted">
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator: false,
          startScreenSharing: true,
          enableEmailInStats: false,
          prejoinPageEnabled: false, // Skips the Jitsi prejoin screen since they are already logged in to your app
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        }}
        userInfo={{
          displayName: userName,
          email: userEmail || '',
        }}
        onReadyToClose={() => {
          // This triggers when the user hangs up
          router.push('/');
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }}
        spinner={() => (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Initializing secure meeting room...</p>
          </div>
        )}
      />
    </div>
  );
}