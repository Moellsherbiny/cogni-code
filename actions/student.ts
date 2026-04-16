"use server"
import {prisma} from "@/lib/prisma";

export const isStudentTakePlacementTest = async ({ userId }: { userId: string }) => {
    const placementTest = await prisma.placementTest.findMany({
        where: {
            userId: userId
        }
    });
    if (placementTest.length === 0) {
        return false;
    }
    
    return placementTest[0].score !== null; 
}