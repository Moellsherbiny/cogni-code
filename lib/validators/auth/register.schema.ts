import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;