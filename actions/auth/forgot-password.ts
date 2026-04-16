"use server";

import { prisma } from "@/lib/prisma";
import { sendInitialOTP } from "@/actions/verify";

interface ForgotPasswordInput {
  email: string;
}

export async function sendForgotPasswordOTP({ email }: ForgotPasswordInput) {
  try {
    if (!email) return { error: "Email is required." };

    const user = await prisma.user.findUnique({ where: { email } });

    // Don't reveal whether the email exists — always return success to the client.
    // Only actually send if user exists.
    if (user) {
      await sendInitialOTP({ email, mode: "reset" });
    }

    return { success: true };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}
