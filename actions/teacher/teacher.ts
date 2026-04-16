"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

async function requireTeacher() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export async function createCourse(data: {
  title: string;
  description?: string;
  thumbnail?: string;
}) {
  const teacherId = await requireTeacher();
  const course = await prisma.course.create({
    data: { ...data, teacherId },
  });
  revalidatePath("/teacher/courses");
  return course;
}

export async function updateCourse(
  id: string,
  data: { title?: string; description?: string; thumbnail?: string }
) {
  await requireTeacher();
  const course = await prisma.course.update({ where: { id }, data });
  revalidatePath("/teacher/courses");
  revalidatePath(`/teacher/courses/${id}`);
  return course;
}

export async function deleteCourse(id: string) {
  await requireTeacher();
  await prisma.course.delete({ where: { id } });
  revalidatePath("/teacher/courses");
}

export async function getTeacherCourses() {
  const teacherId = await requireTeacher();
  return prisma.course.findMany({
    where: { teacherId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { modules: true, enrollments: true } },
    },
  });
}

export async function getCourseDetail(courseId: string) {
  const teacherId = await requireTeacher();
  return prisma.course.findFirst({
    where: { id: courseId, teacherId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });
}

// ─── Modules ──────────────────────────────────────────────────────────────────

export async function createModule(data: {
  courseId: string;
  title: string;
  description?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  order: number;
}) {
  await requireTeacher();
  const mod = await prisma.module.create({ data });
  revalidatePath(`/teacher/courses/${data.courseId}`);
  return mod;
}

export async function updateModule(
  id: string,
  courseId: string,
  data: {
    title?: string;
    description?: string;
    level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    order?: number;
  }
) {
  await requireTeacher();
  const mod = await prisma.module.update({ where: { id }, data });
  revalidatePath(`/teacher/courses/${courseId}`);
  return mod;
}

export async function deleteModule(id: string, courseId: string) {
  await requireTeacher();
  await prisma.module.delete({ where: { id } });
  revalidatePath(`/teacher/courses/${courseId}`);
}

export async function reorderModules(
  courseId: string,
  items: { id: string; order: number }[]
) {
  await requireTeacher();
  await Promise.all(
    items.map((item) =>
      prisma.module.update({ where: { id: item.id }, data: { order: item.order } })
    )
  );
  revalidatePath(`/teacher/courses/${courseId}`);
}

// ─── Lessons ──────────────────────────────────────────────────────────────────

export async function createLesson(data: {
  moduleId: string;
  courseId: string;
  title: string;
  type: "VIDEO" | "TEXT" | "MATERIAL";
  content?: string;
  videoUrl?: string;
  materialUrl?: string;
  transcript?: string;
  order: number;
}) {
  await requireTeacher();
  const { courseId, ...lessonData } = data;
  const lesson = await prisma.lesson.create({ data: lessonData });
  revalidatePath(`/teacher/courses/${courseId}`);
  return lesson;
}

export async function updateLesson(
  id: string,
  courseId: string,
  data: {
    title?: string;
    type?: "VIDEO" | "TEXT" | "MATERIAL";
    content?: string;
    videoUrl?: string;
    materialUrl?: string;
    transcript?: string;
    order?: number;
  }
) {
  await requireTeacher();
  const lesson = await prisma.lesson.update({ where: { id }, data });
  revalidatePath(`/teacher/courses/${courseId}`);
  return lesson;
}

export async function deleteLesson(id: string, courseId: string) {
  await requireTeacher();
  await prisma.lesson.delete({ where: { id } });
  revalidatePath(`/teacher/courses/${courseId}`);
}

export async function reorderLessons(
  moduleId: string,
  courseId: string,
  items: { id: string; order: number }[]
) {
  await requireTeacher();
  await Promise.all(
    items.map((item) =>
      prisma.lesson.update({ where: { id: item.id }, data: { order: item.order } })
    )
  );
  revalidatePath(`/teacher/courses/${courseId}`);
}

// ─── Learning Paths ───────────────────────────────────────────────────────────

export async function createLearningPath(data: {
  title: string;
  description?: string;
  thumbnail?: string;
  courseIds: string[]; // ordered
}) {
  await requireTeacher();
  const { courseIds, ...pathData } = data;
  const path = await prisma.learningPath.create({
    data: {
      ...pathData,
      courses: {
        create: courseIds.map((courseId, index) => ({ courseId, order: index })),
      },
    },
  });
  revalidatePath("/teacher/learning-paths");
  return path;
}

export async function updateLearningPath(
  id: string,
  data: {
    title?: string;
    description?: string;
    thumbnail?: string;
    courseIds?: string[];
  }
) {
  await requireTeacher();
  const { courseIds, ...pathData } = data;

  await prisma.learningPath.update({ where: { id }, data: pathData });

  if (courseIds !== undefined) {
    // Replace all courses
    await prisma.learningPathCourse.deleteMany({ where: { learningPathId: id } });
    await prisma.learningPathCourse.createMany({
      data: courseIds.map((courseId, index) => ({
        learningPathId: id,
        courseId,
        order: index,
      })),
    });
  }

  revalidatePath("/teacher/learning-paths");
  revalidatePath(`/teacher/learning-paths/${id}`);
}

export async function deleteLearningPath(id: string) {
  await requireTeacher();
  await prisma.learningPath.delete({ where: { id } });
  revalidatePath("/teacher/learning-paths");
}

export async function getLearningPaths() {
  await requireTeacher();
  return prisma.learningPath.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      courses: {
        orderBy: { order: "asc" },
        include: { course: { select: { id: true, title: true, thumbnail: true } } },
      },
      _count: { select: { progress: true } },
    },
  });
}

export async function getLearningPathDetail(id: string) {
  await requireTeacher();
  return prisma.learningPath.findUnique({
    where: { id },
    include: {
      courses: {
        orderBy: { order: "asc" },
        include: { course: true },
      },
    },
  });
}


// ─── Get learning paths that a course belongs to ──────────────────────────────
export async function getLearningPathsForCourse(courseId: string) {
  await requireTeacher();
  return prisma.learningPathCourse.findMany({
    where: { courseId },
    include: {
      learningPath: { select: { id: true, title: true, thumbnail: true } },
    },
    orderBy: { order: "asc" },
  });
}
 
// ─── Get all learning paths (for the link picker) ─────────────────────────────
export async function getAllLearningPaths() {
  await requireTeacher();
  return prisma.learningPath.findMany({
    orderBy: { title: "asc" },
    include: {
      _count: { select: { courses: true } },
    },
  });
}
 
// ─── Link a course to a learning path ─────────────────────────────────────────
export async function linkCourseToPath(courseId: string, learningPathId: string) {
  await requireTeacher();
 
  // Get current max order in this path
  const maxOrderRow = await prisma.learningPathCourse.findFirst({
    where: { learningPathId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = (maxOrderRow?.order ?? -1) + 1;
 
  await prisma.learningPathCourse.create({
    data: { courseId, learningPathId, order },
  });
 
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath(`/teacher/courses/${courseId}/edit`);
  revalidatePath(`/teacher/learning-paths`);
}
 
// ─── Unlink a course from a learning path ────────────────────────────────────
export async function unlinkCourseFromPath(courseId: string, learningPathId: string) {
  await requireTeacher();
 
  await prisma.learningPathCourse.deleteMany({
    where: { courseId, learningPathId },
  });
 
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath(`/teacher/courses/${courseId}/edit`);
  revalidatePath(`/teacher/learning-paths`);
}
 
// ─── Get teacher courses (simple list for LP form) ───────────────────────────
export async function getTeacherCoursesSimple() {
  const teacherId = await requireTeacher();
  return prisma.course.findMany({
    where: { teacherId },
    orderBy: { title: "asc" },
    select: { id: true, title: true, thumbnail: true },
  });
}
 
// ─── Get full learning path detail (for edit page) ───────────────────────────
export async function getLearningPathFull(id: string) {
  await requireTeacher();
  return prisma.learningPath.findUnique({
    where: { id },
    include: {
      courses: {
        orderBy: { order: "asc" },
        include: {
          course: { select: { id: true, title: true, thumbnail: true } },
        },
      },
    },
  });
}
 