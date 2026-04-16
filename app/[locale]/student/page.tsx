"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLatestProgress, getProgressPercentage } from '@/actions/teacher/dashboard';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
export default function StudentDashboard() {
  const t = useTranslations('Student');
  const [progressPercentage, setProgressPercentage] = useState<number>(65);
  const { data: session } = useSession();
  useEffect(() => {
    const fetchProgress = async () => {
      const latest = await getLatestProgress({ userId: session?.user?.id as string });
      const percentage = await getProgressPercentage({ userId: session?.user?.id as string, lessonId: latest?.lessonId as string });
      setProgressPercentage(percentage);
    };
    fetchProgress();
  }, []);
  return (
    <div className="space-y-8" >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground">{t('currentLevel')}:</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
               {t('intermediate')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Progress Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> {t('continueLearning')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Introduction to TypeScript</span>
              <span className="text-sm text-muted-foreground">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <Button className="w-full mt-2 group">
              Resume Lesson 
              <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
            </Button>
          </CardContent>
        </Card>

        {/* Leaderboard/Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" /> {t('leaderboardRank')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="text-4xl font-extrabold text-primary">#4</div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Top 10% of students this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div>
        <h3 className="text-xl font-bold mb-4">{t('enrolledCourses')}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="h-32 bg-muted rounded-md mb-4 flex items-center justify-center text-muted-foreground">
                  Course Thumbnail
                </div>
                <h4 className="font-bold mb-1">Web Development Boot Camp</h4>
                <p className="text-sm text-muted-foreground mb-4">Instructor: Sarah Ahmed</p>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>12 {t('Course.lessons')}</span>
                  <span className="text-primary">80%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}