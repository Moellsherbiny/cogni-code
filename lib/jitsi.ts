
export function generateRoomName(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
  const uid = Math.random().toString(36).slice(2, 8);
  return `${slug}-${uid}`;
}

export function getJitsiUrl(roomName: string): string {
  return `https://meet.jit.si/${roomName}`;
}

// For JWT-secured self-hosted Jitsi, use this interface:
export interface JitsiConfig {
  roomName: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  isModerator?: boolean;
}