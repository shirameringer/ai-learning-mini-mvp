import { z } from "zod";

export const createLessonSchema = z.object({
  userId: z.number().int().optional(),
  categoryId: z.number().int().positive(),
  subCategoryId: z.number().int().positive(),
  prompt: z.string().min(3, "Prompt חייב להכיל לפחות 3 תווים"),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
