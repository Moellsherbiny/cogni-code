// components/meetings/MeetingList.tsx
import { MeetingCard } from "./MeetingCard";

export function MeetingList({ meetings, currentUserId }: {
  meetings: any[];
  currentUserId: string;
}) {
  if (!meetings.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">No meetings scheduled yet.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {meetings.map((m) => (
        <MeetingCard key={m.id} meeting={m} />
      ))}
    </div>
  );
}