import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators/auth/register.schema";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { sendInitialOTP } from "@/actions/verify";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate with Zod
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

        

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name ?? null,
        email,
        password: hashedPassword,
        emailVerified: null,
        is_otp_verified: false,
      },
    });

    await sendInitialOTP({ email, mode: "register" });


    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}