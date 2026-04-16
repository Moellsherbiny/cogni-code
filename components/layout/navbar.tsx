"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import {
  Code2,
  Menu,
  ArrowRight,
  User,
  LayoutDashboard,
  LogIn,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/layout/theme-toggle";
import LanguageSwitcher from "./language-switcher";
import Logo from "./logo";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { data: session, status } = useSession();

  const navLinks = [
    { href: "#features", label: t("links.features") },
    { href: "courses", label: t("links.courses"), badge: t("badges.new") },
    { href: "#audience", label: t("links.audience") },
    { href: "#pricing", label: t("links.pricing") },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const DashboardLink =
    session?.user?.role === "teacher" ? "/teacher" : "/student";

  
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3"
          : "bg-transparent border-b border-transparent py-5",
      )}
    >
      <nav className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Desktop Links */}
          <div className="flex items-center gap-10">
            <Logo />
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map(({ href, label, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  {label}
                  {badge && (
                    <Badge
                      variant="secondary"
                      className="h-4 px-1.5 text-[9px] uppercase bg-primary/10 text-primary border-none"
                    >
                      {badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 mr-2">
              <LanguageSwitcher />
              <ModeToggle />
            </div>

            {status === "authenticated" ? (
              <Link
                href="/profile"
                className="hidden sm:block transition-transform hover:scale-105"
              >
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={session.user.image ?? ""} />
                  <AvatarFallback className="text-xs font-bold">
                    {session.user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">{t("login")}</Link>
                </Button>
                <Button
                  size="sm"
                  className="rounded-full px-5 shadow-lg shadow-primary/20"
                  asChild
                >
                  <Link href="/auth/register">
                    {t("getStarted")}{" "}
                    <ArrowRight
                      className={cn("ml-2 h-4 w-4", isRtl && "rotate-180")}
                    />
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <div className="lg:hidden ml-2">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side={isRtl ? "left" : "right"}
                  className="w-full sm:max-w-xs p-0 flex flex-col border-none bg-background"
                >
                  {/* Mobile Header Profile */}
                  <div className="p-6 pb-4 pt-10 bg-primary/5">
                    {status === "authenticated" ? (
                      <div className="flex items-center gap-4">
                        <SheetTitle>
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src={session.user.image as string} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {session.user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </SheetTitle>
                        <div className="flex flex-col">
                          <span className="font-bold text-lg leading-tight">
                            {session.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {session.user.email}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <SheetTitle className="text-2xl font-black flex items-center gap-2">
                          <Code2 className="text-primary h-6 w-6" /> CogniCode
                        </SheetTitle>
                        <p className="text-sm text-muted-foreground">
                          Unlock your coding potential.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    {navLinks.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-4 text-base font-semibold rounded-xl hover:bg-muted active:bg-muted transition-colors"
                      >
                        {label}
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-muted-foreground/50",
                            isRtl && "rotate-180",
                          )}
                        />
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Footer Actions */}
                  <div className="p-6 border-t bg-muted/30 space-y-4">
                    {status === "authenticated" ? (
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="h-12 gap-2 rounded-xl"
                          asChild
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href={DashboardLink}>
                            <LayoutDashboard size={18} /> {t("dashboard")}
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-12 gap-2 rounded-xl text-destructive hover:text-destructive"
                          onClick={() => {
                            setIsOpen(false);
                            signOut();
                          }}
                        >
                          <LogOut size={18} /> {t("logout") || "Logout"}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Button
                          className="w-full h-12 font-bold rounded-xl"
                          asChild
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href="/auth/register">{t("getStarted")}</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full h-12 font-bold"
                          asChild
                          onClick={() => setIsOpen(false)}
                        >
                          <Link href="/auth/login">{t("login")}</Link>
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Settings size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {t("settings")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <ModeToggle />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
