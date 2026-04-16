"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getAllStudents() {
  const session = await auth();

  if (!session?.user?.id) return [];


  const teacherId = session.user.id;

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      enrollments: {
        some: {
          course: {
            teacherId: teacherId,
          },
        },
      },
    },
    include: {
      enrollments: {
        where: {
          course: {
            teacherId: teacherId,
          },
        },
        include: {
          course: true,
        },
      },
    },
  });

  return students;
}