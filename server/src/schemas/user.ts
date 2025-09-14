import { z } from "zod";

/** Create user schema */
export const createUserSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  phone: z.string().min(5, "Phone number is too short"),
}).strict();

/** Update user schema (optional fields; at least one) */
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(5).optional(),
})
  .strict()
  .refine(obj => Object.keys(obj).length > 0, { message: "No fields to update" });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
