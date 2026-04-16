"use client";

import { useEffect, useState } from 'react';
import { Compass, BookOpen, Layers } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Navbar from '@/components/layout/navbar';
import { getPathsWithCourses } from '@/actions/courses';
import { CourseCard } from '@/components/course/course-card';

interface PathWithCourses {
  id: string;
  title: string;
  description: string | null;
  courses: {
    order: number;
    course: any; 
  }[];
}

export default function CoursesByPathPage() {
  const t = useTranslations("Courses");
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  const [paths, setPaths] = useState<PathWithCourses[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPathsWithCourses();
        setPaths(data as any);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className={cn("min-h-screen bg-background pb-20", isRtl ? "font-arabic" : "font-sans")}>
      <Navbar />

      <header className="pt-32 pb-12 px-6 max-w-7xl mx-auto">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none px-4">
            {t("learningRoadmaps")}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black">{t("browseByPath")}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">{t("pathHeroDesc")}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 space-y-24">
        {isLoading ? (
          // Simple loading state
          <div className="space-y-12">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid md:grid-cols-3 gap-6">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : paths.length > 0 ? (
          paths.map((path) => (
            <section key={path.id} className="relative">
              {/* Path Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-border/50 pb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Compass size={24} />
                    <span className="text-sm font-bold uppercase tracking-wider">{t("pathway")}</span>
                  </div>
                  <h2 className="text-3xl font-bold">{path.title}</h2>
                  <p className="text-muted-foreground max-w-xl">{path.description}</p>
                </div>
                
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                  <Layers size={16} />
                  {path.courses.length} {t("totalCourses")}
                </div>
              </div>

              {/* Courses Grid for this Path */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {path.courses.map((item, index) => (
                  <div key={item.course.id} className="relative">
                    {/* Visual indicator for sequence */}
                    <div className="absolute -top-3 -left-3 z-10 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg border-2 border-background">
                      {index + 1}
                    </div>
                    <CourseCard course={item.course} isRtl={isRtl} t={t} />
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-20">
            <BookOpen className="mx-auto mb-4 text-muted-foreground/50" size={48} />
            <p className="text-muted-foreground">{t("noPathsFound")}</p>
          </div>
        )}
      </main>
    </div>
  );
}