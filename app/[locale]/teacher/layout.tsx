
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import LanguageSwitcher from "@/components/layout/language-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const {locale} = await params;
  const isRtl = locale === "ar";
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  if (session?.user?.role !== "TEACHER") redirect("/");
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" dir={isRtl ? "rtl" : "ltr"}>
        <AppSidebar />
        <SidebarInset>
          {/* Top Header */}
          <header className="flex h-16 shrink-0 items-center justify-between px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ms-1" />
              <Separator orientation="vertical" className="me-2 " />
              <h1 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Overview
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link href="/profile">
              <Avatar>
                <AvatarImage src={session?.user?.image as string} alt="User" />
                <AvatarFallback className="bg-primary/10 flex items-center justify-center text-xs font-bold border">{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              </Link>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex flex-1 flex-col gap-4 p-4 md:p-8 bg-muted/20">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}