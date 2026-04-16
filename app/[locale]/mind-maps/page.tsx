import { SummarizerClient } from "./page-client";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export default async function Page() {
  const locale = await getLocale();
  return (
      <SummarizerClient locale={locale} />
  );
}