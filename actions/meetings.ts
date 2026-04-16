
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateRoomName } from "@/lib/jitsi";

export async function getMeetings() {
  return prisma.meeting.findMany({
    include: { host: { select: { name: true, image: true } } },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getMeeting(roomName: string) {
  return prisma.meeting.findUnique({
    where: { roomName },
    include: { host: { select: { id: true, name: true, image: true } } },
  });
}

export async function createMeeting(formData: {
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  courseId?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const meeting = await prisma.meeting.create({
    data: {
      title: formData.title,
      description: formData.description ?? null,
      roomName: generateRoomName(formData.title),
      scheduledAt: new Date(formData.scheduledAt),
      duration: formData.duration,
      hostId: session.user.id,
      courseId: formData.courseId ?? null,
    },
  });

  revalidatePath("/meetings");
  return meeting;
}

export async function deleteMeeting(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.meeting.delete({ where: { id, hostId: session.user.id } });
  revalidatePath("/meetings");
}

export async function setMeetingActive(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.meeting.update({ where: { id }, data: { isActive } });
}