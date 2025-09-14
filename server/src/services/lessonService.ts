import { prisma } from "../config/db";
import { generateLessonContent } from "./aiService";

export interface LessonInput {
  categoryId: number;
  subCategoryId: number;
  prompt: string;
  userId?: number;
}

/**
 * Creates a lesson using AI-generated content.
 * 1) Generates content from the given prompt
 * 2) Persists the lesson in the DB
 */
export async function createLesson(input: LessonInput) {
  const { categoryId, subCategoryId, prompt, userId } = input;

  // 1) Generate content via OpenAI
  const content = await generateLessonContent(prompt);

  // 2) Save to DB
  return prisma.lesson.create({
    data: {
      title: `Lesson: ${prompt}`,
      content,
      categoryId,
      subCategoryId,
      userId,
    },
  });
}
