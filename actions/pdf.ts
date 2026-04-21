"use server";

import puppeteer from "puppeteer";

export async function generatePdf(id: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`http://localhost:3000/mind-maps/pdf/${id}`, {
    waitUntil: "networkidle0",
  });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    scale: 0.9,
  });

  await browser.close();
  return pdf;
}