"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

interface CreateMeetingInput {
  title: string;
  courseId: string;
  scheduledAt: string;
}

export async function createMeetingAction(data: CreateMeetingInput) {
  const session = await auth();
  if (session?.user?.role !== "TEACHER") throw new Error("Unauthorized");

  const title = data.title;
  const courseId = data.courseId;
  const scheduledAt = data.scheduledAt;

  // Use a URL-safe room name + timestamp for uniqueness
  const roomName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

  await prisma.meeting.create({
    data: {
      title,
      roomName,
      scheduledAt: new Date(),
      hostId: session.user.id!,
      courseId: courseId || null,
      isActive: true,
    },
  });

  revalidatePath("/teacher");
  revalidatePath("/student");
}
export async function getActiveMeetings(courseId?: string) {
  return await prisma.meeting.findMany({
    where: {
      courseId: courseId,
      isActive: true,
      // Optional: scheduledAt: { gte: new Date() }
    },
    include: {
      host: { select: { name: true } }
    },
    orderBy: { scheduledAt: 'asc' }
  });
}

export async function getMeetings() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return await prisma.meeting.findMany({ where: { hostId: session.user.id } });
}

export async function toggleMeetingStatus(id: string, active: boolean) {
  await prisma.meeting.update({
    where: { id },
    data: { isActive: active },
  });
  revalidatePath("/teacher");
}