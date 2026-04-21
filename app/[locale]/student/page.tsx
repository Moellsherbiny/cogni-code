"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, ArrowRight, Ghost, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useTransition } from "react";
import { getStudentDashboardData } from "@/actions/student/dashboard";
import Link from "next/link";
import { getActiveMeetings } from "@/actions/meetings";

export default function StudentDashboard() {
  const t = useTranslations("Student");
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<any>(null);
  const [ activeMeetings, setActiveMeetings] = useState<any[]>([]);
  useEffect(() => {
    startTransition(async () => {
      try {
        const result = await getStudentDashboardData();
        const activeMeetingsResponse = await getActiveMeetings();
        setData(result);
        setActiveMeetings(activeMeetingsResponse);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    });
  }, []);

  if (isPending || !data) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-pulse text-muted-foreground">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  const hasCourses = data.enrolledCourses && data.enrolledCourses.length > 0;
  const hasLeaderboardScore = data.leaderboardRank > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("title")}, {data.user.name || "Student"}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground">{t("currentLevel")}:</span>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {data.user.level}
            </Badge>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {/* Continue Learning Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> {t("continueLearning")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.resumeLesson ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">
                    {data.resumeLesson.title}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {data.resumeLesson.percentage.toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={data.resumeLesson.percentage}
                  className="h-2"
                />
                <Button className="w-full mt-2 group" asChild>
                  <Link href={`/lessons/${data.resumeLesson.lessonId}`}>
                    Resume Lesson
                    <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="py-6 text-center">
                <Ghost className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">
                  No active lessons found.
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/courses">Browse Catalog</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />{" "}
              {t("leaderboardRank")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            {hasLeaderboardScore ? (
              <>
                <div className="text-4xl font-extrabold text-primary">
                  #{data.leaderboardRank}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center px-4">
                  Keep learning to improve your standing!
                </p>
              </>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground/50">
                  --
                </div>
                <p className="text-xs text-muted-foreground mt-2 px-2 italic">
                  "You haven't earned a score yet. Complete quizzes to appear
                  here!"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Meetings Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          {t("liveMeetings")}
        </h3>

        {activeMeetings && activeMeetings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {activeMeetings.map((meeting: any) => (
              <Card key={meeting.id} className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <h4 className="font-bold">{meeting.title}</h4>
                    <p className="text-xs text-muted-foreground italic">
                      Hosted by {meeting.host.name}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/meeting/${meeting.roomName}`}>
                      Join Room
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="py-6 text-center">
              <p className="text-sm text-muted-foreground">
                No live sessions currently scheduled.
              </p>
              <p className="text-xs text-muted-foreground/60">
                Check back later or contact your instructor for class times.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Courses Grid */}
      <div>
        <h3 className="text-xl font-bold mb-4">{t("enrolledCourses")}</h3>
        {hasCourses ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.enrolledCourses.map((course: any) => (
              <Card
                key={course.id}
                className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
              >
                <div className="h-32 bg-muted relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground/40">
                      <Search className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <CardContent className="pt-4">
                  <h4 className="font-bold mb-1 truncate">{course.title}</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Instructor: {course.instructor}
                  </p>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span>
                      {course.lessonCount} {t("Course.lessons")}
                    </span>
                    <span className="text-primary font-bold">
                      {course.progressPercentage.toFixed(0)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl border-muted">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold">No courses yet</h4>
            <p className="text-muted-foreground mb-6">
              Explore our library to start your learning journey.
            </p>
            <Button asChild>
              <Link href="/courses">View All Courses</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
