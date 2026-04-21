"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, BookOpen, BarChart3, Plus, Video, PowerOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useTransition } from "react";
import { getTeacherDashboardData } from "@/actions/teacher/teacherDashboard";
import { toggleMeetingStatus } from "@/actions/meetings";
import { CreateMeetingDialog } from "@/components/meetings/create-meeting-dialog";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

export default function TeacherDashboard() {
  const t = useTranslations("Teacher");
  const common = useTranslations("Common");
  const isRTL = useLocale() === "ar";
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [stats, setStats] = useState<any>({ totalStudents: 0, activeCourses: 0, avgQuizScore: 0, courses: [], activeMeetings: [] });

  const loadData = async () => {
    if (!session?.user?.id) return;
    const data = await getTeacherDashboardData({ userId: session.user.id });
    setStats({
      totalStudents: data.totalstudents,
      activeCourses: data.activeCourses,
      avgQuizScore: data.avgQuizScore,
      courses: data.courses,
      activeMeetings: data.activeMeetings,
    });
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [session?.user?.id]);

  const handleEndMeeting = (id: string) => {
    startTransition(async () => {
      await toggleMeetingStatus(id, false);
      toast.info("Meeting ended.");
      loadData();
    });
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="p-6 space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold">{t("title")}</h2>
          <p className="text-muted-foreground">{isRTL ? "مرحباً بك في لوحة التحكم الخاصة بك" : "Welcome back to your control center."}</p>
        </div>
        <div className="flex gap-2">
          <CreateMeetingDialog courses={stats.courses} onCreated={loadData} />
          <Button variant="outline" asChild><Link href="/teacher/courses/new"><Plus className="h-4 w-4 mr-2"/>{t("createCourse")}</Link></Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: t("totalStudents"), val: stats.totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
          { label: t("activeCourses"), val: stats.activeCourses, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: t("avgQuizScore"), val: `${stats.avgQuizScore.toFixed(0)}%`, icon: BarChart3, color: "text-amber-600", bg: "bg-amber-100" },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">{s.label}</span>
              <div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{s.val}</div></CardContent>
          </Card>
        ))}
      </div>

      {/* Active Meetings Row */}
      {stats.activeMeetings.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold flex items-center gap-2"><Video className="text-red-500 animate-pulse" /> Live Now</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.activeMeetings.map((m: any) => (
              <Card key={m.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{m.course?.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" asChild><Link href={`/meetings/${m.roomName}`}>Join</Link></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEndMeeting(m.id)} disabled={isPending}>
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PowerOff className="h-4 w-4 text-destructive" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Courses Table */}
      <Card className="border-none shadow-sm">
        <CardHeader><CardTitle>{t("myCourses")}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("courseTitle")}</TableHead>
                <TableHead>{t("students")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{common("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.courses.map((course: any) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course._count.enrollments}</TableCell>
                  <TableCell><Badge variant="outline">Active</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/teacher/courses/${course.id}`}>{common("manage")}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}