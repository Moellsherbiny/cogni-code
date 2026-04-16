"use server";

import { prisma } from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/mail";
import { generateOTP, hashOTP } from "@/lib/otp";
import crypto from "crypto";

type Mode = "register" | "reset";

interface VerifyOTPInput {
  email: string;
  otp: string;
  mode: Mode;
}

interface ResendOTPInput {
  email: string;
  mode: Mode;
}

// ─────────────────────────────────────────────
// Verify OTP
// ─────────────────────────────────────────────

export async function verifyOTP({ email, otp, mode }: VerifyOTPInput) {
  try {
    if (!email || !otp) return { error: "Invalid request." };

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.otp || !user.otp_expires_at) {
      return { error: "OTP not found. Please request a new one." };
    }

    if (user.is_otp_verified) {
      return { error: "This OTP has already been used." };
    }

    if (new Date() > user.otp_expires_at) {
      return { error: "OTP has expired. Please request a new one." };
    }

    const hashedInput = hashOTP(otp);
    if (user.otp !== hashedInput) {
      return { error: "Incorrect code. Please try again." };
    }

    if (mode === "register") {
      // Verify email and clear OTP fields
      await prisma.user.update({
        where: { email },
        data: {
          emailVerified: new Date(),
          is_otp_verified: true,
          otp: null,
          otp_expires_at: null,
        },
      });
      return { success: true };
    }

    // mode === "reset": mark OTP verified, issue a short-lived reset token
    // We store the hashed reset token in the otp field temporarily
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedReset = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await prisma.user.update({
      where: { email },
      data: {
        is_otp_verified: true,
        otp: hashedReset,
        otp_expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 min to reset password
      },
    });

    return { success: true, token: resetToken };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

// ─────────────────────────────────────────────
// Resend / Send OTP  (also used as sendInitialOTP)
// ─────────────────────────────────────────────

export async function resendOTP({ email, mode }: ResendOTPInput) {
  try {
    if (!email) return { error: "Email is required." };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "No account found with this email." };

    // Rate-limit: block if last OTP was issued < 60 seconds ago
    // otp_expires_at is set 10 min in the future, so if > 9 min remain → too soon
    if (
      user.otp_expires_at &&
      !user.is_otp_verified &&
      new Date() < new Date(user.otp_expires_at.getTime() - 9 * 60 * 1000)
    ) {
      return { error: "Please wait before requesting a new code." };
    }

    const { plain, hashed } = generateOTP();

    await prisma.user.update({
      where: { email },
      data: {
        otp: hashed,
        otp_expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 min
        is_otp_verified: false,
      },
    });

    await sendOTPEmail({ email, otp: plain, mode });

    return { success: true };
  } catch {
    return { error: "Failed to send code. Please try again." };
  }
}

// Alias — call this right after user creation or forgot-password form submit
export const sendInitialOTP = resendOTP;