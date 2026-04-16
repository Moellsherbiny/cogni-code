"use server";

import cloudinary from "@/lib/cloudinary";

export async function uploadToCloudinary(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const result: any = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream((error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
  return result.secure_url;
}
