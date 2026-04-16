import crypto from "crypto";


export function generateOTP(): { plain: string; hashed: string } {
  const plain = Math.floor(100_000 + Math.random() * 900_000).toString();
  return { plain, hashed: hashOTP(plain) };
}

export function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}