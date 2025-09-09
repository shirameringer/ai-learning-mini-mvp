import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  phone: z.string().min(5, "Phone number is too short"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
