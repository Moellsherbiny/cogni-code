import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "./auth";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(req: NextRequest) {
  // 1. Run next-intl FIRST
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // 2. Auth logic
  const session = await auth();
  const { nextUrl } = req;
  const role = session?.user?.role;

  const pathname = nextUrl.pathname;

  // Remove locale prefix (/en, /ar)
  const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, "");

  const locale = pathname.split("/")[1] || "en";

  // Not logged in
  if (!session) {
    return NextResponse.redirect(new URL(`/${locale}/login`, nextUrl));
  }

  //  Teacher Security
  if (pathWithoutLocale.startsWith("/teacher") && role !== "TEACHER") {
    return NextResponse.redirect(new URL(`/${locale}`, nextUrl));
  }

  // Student Security
  if (pathWithoutLocale.startsWith("/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL(`/${locale}`, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)"
};