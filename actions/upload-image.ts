"use server";

import fs from "fs";
import path from "path";

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create unique filename
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;

  // Define path
  const uploadDir = path.join(process.cwd(), "public/uploads");

  // Ensure folder exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);

  // Save file
  await fs.promises.writeFile(filePath, buffer);

  // Return public URL
  const fileUrl = `/uploads/${fileName}`;

  return {
    success: true,
    url: fileUrl,
  };
}