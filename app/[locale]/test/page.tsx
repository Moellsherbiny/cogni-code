"use client";

import { useState, useTransition } from "react";
import { uploadToCloudinary } from "@/actions/cloudinary"; 
export default function TestUploadPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file) return;

    startTransition(async () => {
      try {
        const url = await uploadToCloudinary(file);
        setImageUrl(url);
      } catch (err) {
        console.error(err);
      }
    });
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Cloudinary Upload Test</h1>

      <form onSubmit={handleSubmit}>
        <input type="file" name="file" accept="image/*" required />
        <button type="submit" disabled={isPending}>
          {isPending ? "Uploading..." : "Upload"}
        </button>
      </form>

      {imageUrl && (
        <div style={{ marginTop: 20 }}>
          <p>Uploaded Image URL:</p>
          <a href={imageUrl} target="_blank">{imageUrl}</a>

          <div style={{ marginTop: 10 }}>
            <img
              src={imageUrl}
              alt="uploaded"
              style={{ width: 200, borderRadius: 10 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}