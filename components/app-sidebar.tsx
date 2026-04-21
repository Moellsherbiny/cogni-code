"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { 
  BookOpen, LayoutDashboard, Users, Settings, 
  GraduationCap, ClipboardList, Trophy, LogOut,
  Brush, 
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import Logo from "./layout/logo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { signOut } from "next-auth/react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const t = useTranslations("Common");
  const sidebarItems = useTranslations("Sidebar");
  const isRTL = useLocale() === "ar";
  // Detect role from path
  const isTeacher = pathname.includes("/teacher");
  
  const navItems = isTeacher ? [
    { title: t("dashboard"), url: "/teacher", icon: LayoutDashboard },
    { title: sidebarItems("learningPaths"), url: "/teacher/learning-paths", icon: BookOpen },
    { title: sidebarItems("myCourses"), url: "/teacher/courses", icon: BookOpen },
    { title: sidebarItems("myQuizzes"), url: "/teacher/quizzes", icon: Settings },
    { title: sidebarItems("students"), url: "/teacher/students", icon: Users },
    { title: sidebarItems("generateQuiz"), url: "/teacher/quizzes/new", icon: ClipboardList },
    { title: sidebarItems("whiteboard"), url: "/whiteboard", icon: Brush },
    { title: sidebarItems("mindMaps"), url: "/mind-maps", icon: Trophy },
  ] : [
    { title: t("dashboard"), url: "/student", icon: LayoutDashboard },
    { title: sidebarItems("myCourses"), url: "/student/courses", icon: GraduationCap },
    { title: sidebarItems("leaderboard"), url: "/leaderboard", icon: Trophy },
    { title: sidebarItems("whiteboard"), url: "/whiteboard", icon: Brush },
    { title: sidebarItems("myQuizzes"), url: "/student/quizzes", icon: ClipboardList },
    { title: sidebarItems("placementTest"), url: "/placement-test", icon: BookOpen },
    { title: sidebarItems("mindMaps"), url: "/mind-maps", icon: Trophy },
  ];

  return (
    <Sidebar variant="inset" {...props} side={isRTL ? "right" : "left"}>
      <SidebarHeader className="h-16 border-b flex justify-center px-4">
      <Logo />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isTeacher ? t("teacherPortal") : t("studentPortal")}</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.url}
                  tooltip={item.title}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/profile">
                   <Settings className="size-4" />
                   <span>{sidebarItems("settings")}</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                className="text-destructive hover:text-destructive"
                onClick={()=> signOut({redirectTo:"/"})}
                >
                   <LogOut className="size-4" />
                   <span>{t("logout")}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}