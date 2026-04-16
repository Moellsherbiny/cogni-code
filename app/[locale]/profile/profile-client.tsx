"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { uploadImage } from "@/actions/upload-image";
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Camera,
  RefreshCcw,
  Save,
  Loader2,
  LogOut,
} from "lucide-react";

import { updateUser } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import Navbar from "@/components/layout/navbar";
import { BecomeTeacherDialog } from "@/components/profile/becomeTeacherDialog";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { uploadToCloudinary } from "@/actions/cloudinary";

export default function ProfileClient({ user: initialUser }: any) {
  const t = useTranslations("Profile");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    setLoading(true);
    try {
      await updateUser({
        name: user.name,
        email: user.email,
        image: user.image,
        level: user.level,
        role: user.role,
      });
      toast.success(t("updated"));
    } catch (error) {
      toast.error("Something went wrong while saving.");
    } finally {
      setLoading(false);
    }
  }
  async function handleLogout() {
    signOut();
  }
  async function handleImageClick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    //Front-end validation
    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Image too large. Max 2MB.");
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const file = formData.get("file") as File;
      if (!file) return;
      const result = await uploadToCloudinary(file);

      if (result) {
        // Update local state so user sees the change immediately
        setUser((prev: any) => ({ ...prev, image: result }));
        toast.success("Photo uploaded! Click save to keep changes.");
      } else {
        toast.error("Upload failed.");
      }
    } catch (error) {
      toast.error("Something went wrong with the upload.");
    } finally {
      setIsUploading(false);
    }
  }
  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={cn("min-h-screen bg-muted/30", isRtl ? "font-arabic" : "")}
    >
      <Navbar />

      <main className="container max-w-6xl mx-auto pt-28 pb-20 px-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading}
            className="rounded-full px-8 shadow-lg shadow-primary/20 gap-2 w-full sm:w-auto"
          >
            {loading ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? t("saving") : t("saveChanges")}
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* LEFT COLUMN: Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden border-none shadow-md">
              <div className="h-24 bg-linear-to-r from-primary/20 to-primary/5" />
              <CardContent className="relative flex flex-col items-center p-6 -mt-12">
                {/* Image Changer Logic */}
                <div className="relative group">
                  <Avatar className="w-28 h-28 border-4 border-background shadow-xl">
                    <AvatarImage
                      src={user.image || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary uppercase">
                      {user.name?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Hidden Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageClick}
                  />

                  {/* Camera Button */}
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95 disabled:opacity-70"
                  >
                    {isUploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <Badge variant="secondary" className="capitalize px-3 py-1">
                    {user.level}
                  </Badge>
                  <Badge className="capitalize px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                    {user.role}
                  </Badge>
                </div>

                <Separator className="my-6" />

                <div className="w-full space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 rounded-xl h-11"
                    asChild
                  >
                    <Button asChild>
                      <Link href="/placement-test">
                        <RefreshCcw
                          size={18}
                          className="text-muted-foreground"
                        />
                        {t("checkLevel")}
                      </Link>
                    </Button>
                  </Button>

                  {user.role === "STUDENT" && (
                    <BecomeTeacherDialog userId={user.id} />
                  )}

                  <Button
                    variant="destructive"
                    className="mx-auto flex justify-start gap-3 rounded-xl h-11 hover:text-red-600 hover:cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} className="text-muted-foreground" />
                    {t("logout")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Main Forms (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Account Information */}
            <Card className="shadow-md border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {t("accountInfo")}
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">{t("name")}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      className="pl-10 h-11 rounded-xl"
                      value={user.name || ""}
                      onChange={(e) =>
                        setUser({ ...user, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="email">{t("email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10 h-11 rounded-xl"
                      value={user.email || ""}
                      onChange={(e) =>
                        setUser({ ...user, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card className="shadow-md border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {t("security")}
                </CardTitle>
                <CardDescription>
                  Secure your account with a strong password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="new-password">{t("newPassword")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        className="pl-10 h-11 rounded-xl"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="confirm-password">
                      {t("confirmPassword")}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        className="pl-10 h-11 rounded-xl"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="gap-2 rounded-xl h-11 px-6"
                >
                  <Lock size={16} />
                  {t("updatePassword")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
