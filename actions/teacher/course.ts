"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

interface CourseValues {
  title: string;
  description?: string;
  thumbnail?: string; 
}

export async function getTeacherCourses() {
  const session = await auth();

  if (!session?.user?.id) return [];

  return await prisma.course.findMany({
    where: {
      teacherId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCourseById(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
  });
}

export async function createCourse(values: CourseValues) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const course = await prisma.course.create({
    data: {
      title: values.title,
      description: values.description,
      thumbnail: values.thumbnail,
      teacherId: session.user.id,
    },
  });

  revalidatePath("/teacher/dashboard");
  return course;
}

export async function updateCourse(id: string, values: { title: string; description?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.course.update({
    where: { id, teacherId: session.user.id },
    data: values,
  });

  revalidatePath("/teacher/dashboard");
}

export async function deleteCourse(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.course.delete({
    where: { id, teacherId: session.user.id },
  });

  revalidatePath("/teacher/dashboard");
}