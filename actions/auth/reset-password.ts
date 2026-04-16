"use server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import crypto from "crypto";
 
export async function resetPassword({token, password}: any) {
 
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
 
  const user = await prisma.user.findFirst({
    where: {
      otp: hashedToken,
      is_otp_verified: true,
      otp_expires_at: { gt: new Date() },
    },
  });
 
  if (!user) return { error: "Reset link is invalid or has expired." };
 
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(password),
      otp: null,
      otp_expires_at: null,
      is_otp_verified: false,
    },
  });
 
  return { success: true };
}