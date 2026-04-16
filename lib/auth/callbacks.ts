import { UserRole } from "@/lib/generated/prisma/client";

export const callbacks = {
  // 1. The JWT callback transfers data from the User object (on login) to the token
  async jwt({ token, user }: any) {
    if (user) {
      token.id = user.id;
      token.role = user.role || "STUDENT";
      token.is_otp_verified = user.is_otp_verified || false;
    }
    return token;
  },

  // 2. The Session callback transfers data from the token to the client-side session
  async session({ session, token }: any) {
    if (session.user) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.is_otp_verified = token.is_otp_verified as boolean;
    }
    return session;
  },

  // 3. We use the signIn callback only for verification/gates, not user creation
  async signIn({ account }: any) {
    if (account?.provider === "google") {
      // You can add logic here if you want to BLOCK certain emails, 
      // otherwise returning true lets the Adapter auto-create the user!
      return true;
    }
    return true;
  },
};