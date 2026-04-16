"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, BookOpen, BarChart3, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Ensure you have this shadcn component
import { useEffect, useState } from "react";
import { getTeacherDashboardData } from "@/actions/teacher/teacherDashboard";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function TeacherDashboard() {
  const t = useTranslations("Teacher");
  const common = useTranslations("Common");
  const locale = useLocale();
  const isRTL = locale === "ar";
  
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    avgQuizScore: 0,
    courses: [] as any[],
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.id) return;
      try {
        const data = await getTeacherDashboardData({
          userId: session.user.id,
        });
        setStats({
          totalStudents: data.totalstudents,
          activeCourses: data.activeCourses,
          avgQuizScore: data.avgQuizScore,
          courses: data.courses,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session?.user?.id]);

  const statCards = [
    {
      title: t("totalStudents"),
      value: stats.totalStudents,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: t("activeCourses"),
      value: stats.activeCourses,
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: t("avgQuizScore"),
      value: `${stats.avgQuizScore.toFixed(1)}%`,
      icon: BarChart3,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ];

  return (
    // The 'dir' attribute here handles the entire layout flow
    <div className="p-6 space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground mt-1">
            {isRTL ? "قم بإدارة فصولك الدراسية ومتابعة التحليلات" : "Manage your classroom and track analytics."}
          </p>
        </div>
        <Button className="w-full md:w-auto flex items-center gap-2 shadow-sm transition-all hover:scale-105" asChild>
          <Link href="/teacher/courses/new">
          <Plus className="h-4 w-4" /> {t("createCourse")}
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tighter">
                {loading ? "..." : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

{/* Courses Table */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>{t("myCourses")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 2. Remove hardcoded dir="rtl" from Table, let it inherit from the parent div */}
          <Table>
            <TableHeader>
              <TableRow>
                {/* 3. Use text-start for automatic alignment based on language */}
                <TableHead className="text-start">{t("courseTitle") || "Course Title"}</TableHead>
                <TableHead className="text-start">{t("students") || "Students"}</TableHead>
                <TableHead className="text-start">{t("status") || "Status"}</TableHead>
                {/* 4. Use text-end for the Actions column */}
                <TableHead className="text-end">{common("actions") || "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.courses.length > 0 ? (
                stats.courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium text-start">
                      {course.title}
                    </TableCell>
                    <TableCell className="text-start">
                      {course._count.enrollments}
                    </TableCell>
                    <TableCell className="text-start">
                      <Badge variant="outline">{isRTL ? "نشط" : "Active"}</Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Button variant="ghost" asChild size="sm">
                        <Link href={`/teacher/courses/${course.id}`}>
                          {common("manage")}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    {loading ? "..." : common("noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}