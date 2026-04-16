import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getLocale, setRequestLocale } from "next-intl/server";
import { DirectionProvider } from "@/components/ui/direction"

export const metadata: Metadata = {
  title: "CogniCode Academy – Adaptive Programming Education",
  description:
    "AI-powered adaptive coding platform for all learners, including those with disabilities.",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const messages = (await import(`@/messages/${locale}.json`)).default;
  const dir = await getLocale()
  return (
    <SessionProvider session={session}>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <DirectionProvider dir={dir === 'ar' ? 'rtl' : 'ltr'}>
        {children}
        <Toaster position="top-right" />
        </DirectionProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
