import { DefaultSession } from "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      interfaceMode?: string
      level?: number
      is_otp_verified?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    role?: UserRole
    interfaceMode?: string
    level?: number
  }
}