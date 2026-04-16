"use server";

import { prisma } from "@/lib/prisma";

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  image: string | null;
  score: number;
  updatedAt: Date;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const rows = await prisma.leaderboard.findMany({
    orderBy: { score: "desc" },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return rows.map((row, index) => ({
    rank: index + 1,
    studentId: row.studentId,
    name: row.student.name ?? "Unknown",
    image: row.student.image ?? null,
    score: row.score,
    updatedAt: row.updatedAt,
  }));
}