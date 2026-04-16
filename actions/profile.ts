"use server";
import { prisma } from "@/lib/prisma";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/lib/generated/prisma/enums";

export async function updateUser(data: {
  name: string;
  email: string;
  image: string;
  level: string;
  role: UserRole;
}) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
    },
  });

  revalidatePath("/profile");

  return { success: true };
}

export async function becomeAsTeacher(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "TEACHER") {
    throw new Error("User is already a teacher");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: UserRole.TEACHER },
  });
  revalidatePath("/profile");

  return { success: true };
}
