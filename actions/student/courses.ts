"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Enrolled Courses ─────────────────────────────────────────────────────────

export interface EnrolledCourse {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  teacherName: string;
  teacherImage: string | null;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  enrolledAt: Date;
  updatedAt: Date;
}

export async function enrollCourse(studentId: string, courseId: string) {

  if (!studentId) throw new Error("Unauthorized");

  await prisma.enrollment.create({ data: { studentId, courseId } });

  revalidatePath(`/courses/${courseId}/`);
}

export async function getEnrolledCourses(
  studentId: string
): Promise<EnrolledCourse[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    orderBy: { updatedAt: "desc" },
    include: {
      course: {
        include: {
          teacher: { select: { name: true, image: true } },
          modules: {
            include: {
              lessons: {
                select: {
                  id: true,
                  progress: {
                    where: { studentId },
                    select: { completed: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return enrollments.map((e) => {
    const lessons = e.course.modules.flatMap((m) => m.lessons);
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter(
      (l) => l.progress[0]?.completed
    ).length;

    return {
      id: e.course.id,
      title: e.course.title,
      description: e.course.description,
      thumbnail: e.course.thumbnail,
      teacherName: e.course.teacher.name ?? "Unknown",
      teacherImage: e.course.teacher.image,
      totalLessons,
      completedLessons,
      progressPercent:
        totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100),
      enrolledAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  });
}

// ─── Study Page ───────────────────────────────────────────────────────────────

export interface LessonWithProgress {
  id: string;
  title: string;
  type: "VIDEO" | "TEXT" | "MATERIAL";
  order: number;
  completed: boolean;
  videoUrl: string | null;
  materialUrl: string | null;
  content: string | null;
  transcript: string | null;
}

export interface ModuleWithLessons {
  id: string;
  title: string;
  description: string | null;
  level: string;
  lessons: LessonWithProgress[];
  completedLessons: number;
  totalLessons: number;
}

export interface StudyCourseDetail {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  teacherName: string;
  teacherImage: string | null;
  modules: ModuleWithLessons[];
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export async function getStudyCourseDetail(
  courseId: string,
  studentId: string
): Promise<StudyCourseDetail | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      teacher: { select: { name: true, image: true } },
      modules: {
        orderBy: { createdAt: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
              progress: {
                where: { studentId },
                select: { completed: true },
              },
            },
          },
        },
      },
    },
  });

  if (!course) return null;

  const modules: ModuleWithLessons[] = course.modules.map((mod) => {
    const lessons: LessonWithProgress[] = mod.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      type: l.type,
      order: l.order,
      completed: l.progress[0]?.completed ?? false,
      videoUrl: l.videoUrl,
      materialUrl: l.materialUrl,
      content: l.content,
      transcript: l.transcript,
    }));

    return {
      id: mod.id,
      title: mod.title,
      description: mod.description,
      level: mod.level,
      lessons,
      completedLessons: lessons.filter((l) => l.completed).length,
      totalLessons: lessons.length,
    };
  });

  const totalLessons = modules.reduce((s, m) => s + m.totalLessons, 0);
  const completedLessons = modules.reduce((s, m) => s + m.completedLessons, 0);

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnail: course.thumbnail,
    teacherName: course.teacher.name ?? "Unknown",
    teacherImage: course.teacher.image,
    modules,
    totalLessons,
    completedLessons,
    progressPercent:
      totalLessons === 0
        ? 0
        : Math.round((completedLessons / totalLessons) * 100),
  };
}

// ─── Mark lesson complete/incomplete ─────────────────────────────────────────

export async function toggleLessonProgress(
  studentId: string,
  lessonId: string,
  completed: boolean,
  courseId: string
) {
  await prisma.progress.upsert({
    where: { studentId_lessonId: { studentId, lessonId } },
    update: { completed },
    create: { studentId, lessonId, completed },
  });

  revalidatePath(`/courses/${courseId}/study`);
}