import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ProfileClient from "./profile-client"
import Navbar from "@/components/layout/navbar"
import { getLocale } from "next-intl/server"

export default async function ProfilePage() {
  const session = await auth()
  const isRtl = await getLocale() === 'ar';
  if (!session) {
    return (
      <>
      <Navbar />
      <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in
          </p>
          <Button asChild>
            <Link href="/auth/login">Go to Login</Link>
          </Button>
        </div>
      </div>
      </>
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) return null

  return <ProfileClient user={user} />
}