"use server";
import { prisma } from "@/lib/prisma";

export const getTeacherDashboardData = async ({
  userId,
}: {
  userId: string;
}) => {
  const coursesCreated = await prisma.course.count({
    where: {
      teacherId: userId,
    },
  });
  const studentsEnrolled = await prisma.enrollment.count({
    where: {
      course: {
        teacherId: userId,
      },
    },
  });
  const activeCourses = await prisma.course.count({
    where: {
      teacherId: userId,
    },
  });
  const avgQuizScore = await prisma.quizAttempt.aggregate({
    where: {
      quiz: {
        course: {
          teacherId: userId,
        },
      },
    },
    _avg: {
      score: true,
    },
  });
  const courses = await prisma.course.findMany({
    where: {
      teacherId: userId,
    },
    include: {
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  return {
    coursesCreated,
    totalstudents: studentsEnrolled,
    activeCourses,
    avgQuizScore: avgQuizScore._avg.score || 0,
    courses,
  };
};
