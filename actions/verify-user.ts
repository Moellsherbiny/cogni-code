"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function isVerifyUser() {
    const session = await auth();
    if (!session?.user?.id) return false;

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    return user?.is_otp_verified || false;
}