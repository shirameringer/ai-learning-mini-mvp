// server/src/schemas/auth.ts
import { z } from "zod";

// בדיקה/התחברות – רק טלפון
export const checkSchema = z.object({
  phone: z.string().min(6, "Phone is required"),
});

// הרשמה – שם + טלפון
export const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Phone is required"),
});

export type CheckInput = z.infer<typeof checkSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
