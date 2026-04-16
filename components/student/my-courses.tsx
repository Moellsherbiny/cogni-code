// components/student/my-courses.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

export function MyCourses({ enrollments }: { enrollments: any[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Continue Learning</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {enrollments.map((enrollment) => {
          const course = enrollment.course;
          // Calculate progress percentage
          const totalLessons = course.modules.reduce((acc: number, m: any) => acc + m.lessons.length, 0);
          const completedLessons = enrollment.student.progress.filter((p: any) => 
            course.modules.some((m: any) => m.lessons.some((l: any) => l.id === p.lessonId))
          ).length;
          const progressValue = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

          return (
            <Card key={enrollment.id} className="overflow-hidden transition-all hover:shadow-md">
              <div className="h-2 w-full bg-muted">
                <div 
                  className="h-full bg-primary transition-all" 
                  style={{ width: `${progressValue}%` }}
                />
              </div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold leading-none mb-1">{course.title}</h4>
                    <p className="text-xs text-muted-foreground">{course.teacher.name}</p>
                  </div>
                  <span className="text-xs font-medium bg-secondary px-2 py-1 rounded">
                    {Math.round(progressValue)}%
                  </span>
                </div>
                <Button className="w-full" variant="outline">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Resume Lesson
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}