"use server";

import { prisma } from "@/lib/prisma";

export async function getStudentLevel(userId: string) {
    const tests = await prisma.placementTest.findFirst({
        where: {
            userId: userId
        },
        orderBy: {
            createdAt: "desc"
        },
        
    });
    return tests?.level
}
