// app/meetings/page.tsx
import { getMeetings } from "@/actions/meetings";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MeetingList } from "@/components/meetings/MeetingList";
import { CreateMeetingDialog } from "@/components/meetings/CreateMeetingDialog";
import Navbar from "@/components/layout/navbar";

export default async function MeetingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const meetings = await getMeetings();

  return (
    <>
    <Navbar />
    <div className="container mx-auto px-4 py-24 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground mt-1">Live sessions with your students</p>
        </div>
        <CreateMeetingDialog />
      </div>
      <MeetingList meetings={meetings} currentUserId={session.user.id} />
    </div>
    </>
  );
}