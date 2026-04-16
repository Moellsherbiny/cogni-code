
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { MeetingRoom } from "@/components/meetings/MeetingRoom";
import { getMeeting, setMeetingActive } from "@/actions/meetings";

export default async function MeetingRoomPage({
  params,
}: {
  params: Promise<{ roomName: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const meeting = await getMeeting(( await params).roomName);
  if (!meeting) notFound();

  const isModerator = meeting.host.id === session.user.id;

  // Mark as active when host opens it
  if (isModerator) await setMeetingActive(meeting.id, true);

  return (
    <div className="h-screen flex flex-col p-4 bg-background">
      <MeetingRoom
        title={meeting.title}
        roomName={meeting.roomName}
        meetingId={meeting.id}
        displayName={session.user.name ?? "Participant"}
        email={session.user.email ?? ""}
        isModerator={isModerator}
        minHeight="min-h-[calc(100vh-2rem)]"
      />
    </div>
  );
}