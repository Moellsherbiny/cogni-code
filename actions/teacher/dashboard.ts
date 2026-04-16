"use server"
import {prisma} from "@/lib/prisma";

export const getDashboardData = async ({ userId }: { userId: string }) => {
    const coursesJoined = await prisma.enrollment.count({
        where: {
            studentId: userId
        }
    });

    const lessonsCompleted = await prisma.progress.count({
        where: {
            studentId: userId,
            completed: true
        }
    });
    const leaderboardData = await prisma.leaderboard.findMany({orderBy: {score: 'desc'}});

    // get the student leaderboard rank
    const studentRank = leaderboardData.findIndex(entry => entry.studentId === userId) + 1;

    const quizScore = await prisma.quizAttempt.findMany({
        where: {
            studentId: userId
        }
    });

    const avgQuizScore = quizScore.length > 0 ? quizScore.reduce((acc, attempt) => acc + attempt.score, 0) / quizScore.length : 0;
    return {
        coursesJoined,
        lessonsCompleted,
        avgQuizScore,
        studentRank
    };

}

export const getProgressPercentage = async ({ userId, lessonId }: { userId: string, lessonId: string }) => {
    const totalLessons = await prisma.lesson.count({
        where: {
            id: lessonId
        }
    });
    const completedLessons = await prisma.progress.count({
        where: {
            studentId: userId,
            lessonId: {
                in: await prisma.lesson.findMany({
                    where: {
                        id: lessonId
                    },
                    select: {
                        id: true
                    }
                }).then(lessons => lessons.map(lesson => lesson.id))
            },
            completed: true
        }
    });
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
};

export const getLatestProgress = async ({ userId}: { userId: string }) => {
    const latestProgress = await prisma.progress.findFirst({
        where: {
            studentId: userId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return latestProgress;
};