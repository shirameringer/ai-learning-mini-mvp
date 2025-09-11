
import { z } from "zod";

// Schema for creating a lesson
export const createLessonSchema = z.object({
  userId: z.number().int().optional(),
  categoryId: z.number().int().positive(),
  subCategoryId: z.number().int().positive(),
  prompt: z.string().min(3, "Prompt must contain at least 3 characters"),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;

// Schema for querying lessons (GET /api/lessons)
export const listLessonsQuerySchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  subCategoryId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "title"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type ListLessonsQuery = z.infer<typeof listLessonsQuerySchema>;
