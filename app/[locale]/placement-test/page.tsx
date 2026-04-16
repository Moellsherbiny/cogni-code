import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { PlacementTestClient } from "@/components/placement-test/client";
import Navbar from "@/components/layout/navbar";

export default async function PlacementTestPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const t = await getTranslations("placementTest");

  // Check if user already completed the test
  const existingTest = await prisma.placementTest.findFirst({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PlacementTestClient
        userId={session.user.id}
        existingTest={existingTest}
      />
    </div>
  );
}