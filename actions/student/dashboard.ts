"use server";

import { prisma } from "@/lib/prisma"; 
import { auth } from "@/auth";

export async function getStudentDashboardData() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // 1. Get User Info & Enrolled Courses with Progress
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      level: true,
      enrollments: {
        include: {
          course: {
            include: {
              teacher: { select: { name: true } },
              modules: {
                include: {
                  lessons: {
                    include: {
                      progress: {
                        where: { studentId: userId }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) throw new Error("User not found");

  // 2. Calculate Progress for each course
  const enrolledCourses = user.enrollments.map((enrollment) => {
    const course = enrollment.course;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const totalLessons = allLessons.length;
    const completedLessons = allLessons.filter((l) => l.progress[0]?.completed).length;
    
    const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      id: course.id,
      title: course.title,
      thumbnail: course.thumbnail,
      instructor: course.teacher.name,
      lessonCount: totalLessons,
      progressPercentage: percentage,
    };
  });

  // 3. Get Recent Progress (For the "Resume Lesson" card)
  const latestProgress = await prisma.progress.findFirst({
    where: { studentId: userId, completed: false },
    orderBy: { updatedAt: 'desc' },
    include: {
      lesson: {
        select: {
          title: true,
          id: true,
        }
      }
    }
  });

  // 4. Calculate Leaderboard Rank
  // Find current user's score
  const userScoreRecord = await prisma.leaderboard.findUnique({
    where: { studentId: userId }
  });

  const userScore = userScoreRecord?.score || 0;

  // Count how many people have a higher score
  const higherScoresCount = await prisma.leaderboard.count({
    where: { score: { gt: userScore } }
  });

  return {
    user: {
      name: user.name,
      level: user.level,
    },
    enrolledCourses,
    leaderboardRank: higherScoresCount + 1,
    resumeLesson: latestProgress ? {
      title: latestProgress.lesson.title,
      lessonId: latestProgress.lesson.id,
      // Default to 0 if no specific course progress found
      percentage: enrolledCourses[0]?.progressPercentage || 0 
    } : null,
  };
}