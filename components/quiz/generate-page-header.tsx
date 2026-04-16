"use client"
import { useTranslations } from 'next-intl'
import React from 'react'

function GeneratePageHeader() {
    const t = useTranslations("quiz");
  return (
    <h1 className="text-2xl font-medium">{t("generate")}</h1>
  )
}

export default GeneratePageHeader