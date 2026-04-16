import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

import { callbacks } from "@/lib/auth/callbacks";
import { providers } from "@/lib/auth/providers";

const uri = process.env.DATABASE_URL || "";
if (!uri) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks,
  pages: {
    signIn: "/auth/login",
  },
});
