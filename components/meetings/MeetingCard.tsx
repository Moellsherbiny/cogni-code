// components/meetings/MeetingCard.tsx
"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Video, Clock, User, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  roomName: string;
  scheduledAt: string;
  duration: number;
  host: { name: string | null; image: string | null };
}

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const isUpcoming = new Date(meeting.scheduledAt) > new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-tight">{meeting.title}</h3>
          <Badge variant={isUpcoming ? "default" : "secondary"}>
            {isUpcoming ? "Upcoming" : "Past"}
          </Badge>
        </div>
        {meeting.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{meeting.description}</p>
        )}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {format(new Date(meeting.scheduledAt), "MMM d, yyyy · h:mm a")}
          </span>
          <span className="flex items-center gap-1">
            <Video className="w-3.5 h-3.5" />
            {meeting.duration} min
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={meeting.host.image ?? undefined} />
            <AvatarFallback>{meeting.host.name?.[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{meeting.host.name}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full gap-2" variant={isUpcoming ? "default" : "outline"}>
          <Link href={`/meetings/${meeting.roomName}`}>
            <ExternalLink className="w-4 h-4" />
            {isUpcoming ? "Join Meeting" : "View Room"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}