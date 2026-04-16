import { getLocale } from "next-intl/server";
import AuthSide from "@/components/auth/auth-side";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const isRtl = locale === "ar";
  const session = await auth();
  if (session?.user?.id) redirect("/");
  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen grid md:grid-cols-2 bg-background text-foreground"
    >
      {/* Side panel always on the "start" side */}
      <AuthSide />

      <div className="flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}