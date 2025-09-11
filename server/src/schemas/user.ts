import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Phone is required"),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    name: z.string().min(2).optional(),
    phone: z.string().min(6).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field (name or phone) must be provided",
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
