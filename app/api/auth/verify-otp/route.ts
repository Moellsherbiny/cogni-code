// app/api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, otp, type } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.otp !== otp) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  if (!user.otp_expires_at || user.otp_expires_at < new Date()) {
    return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  }

  if (type === "verify-email") {
    await prisma.user.update({
      where: { email },
      data: {
        is_otp_verified: true,
        otp: null,
        otp_expires_at: null,
      },
    });
  }

  return NextResponse.json({ success: true });
}