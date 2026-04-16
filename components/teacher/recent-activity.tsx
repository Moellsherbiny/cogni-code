// components/teacher/recent-activity.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, UserPlus, Trophy } from "lucide-react";

export function RecentActivity() {
  // Example activity data derived from Enrollments and QuizAttempts
  const activities = [
    {
      id: "1",
      type: "ENROLLMENT",
      user: "Sarah Chen",
      content: "enrolled in",
      target: "Advanced TypeScript Basics",
      time: "2 hours ago",
      icon: <UserPlus className="h-4 w-4 text-blue-500" />,
      initials: "SC"
    },
    {
      id: "2",
      type: "QUIZ_COMPLETE",
      user: "Alex Rivera",
      content: "scored 95% in",
      target: "Module 1 Assessment",
      time: "5 hours ago",
      icon: <Trophy className="h-4 w-4 text-yellow-600" />,
      initials: "AR"
    },
    {
      id: "3",
      type: "PROGRESS",
      user: "Jordan Smith",
      content: "completed lesson",
      target: "Setup & Installation",
      time: "Yesterday",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      initials: "JS"
    }
  ];

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest student updates across your courses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{activity.initials}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
                  {activity.icon}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium leading-none">
                  {activity.user}{" "}
                  <span className="font-normal text-muted-foreground">
                    {activity.content}
                  </span>{" "}
                  {activity.target}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}