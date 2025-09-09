import { prisma } from "../config/db";

export async function createLesson(params: {
  userId?: number;
  categoryId: number;
  subCategoryId: number;
  prompt: string;
}) {
  // תוכן דמו "מזויף" בשלב ראשון — נחליף ל-AI בהמשך
  const title = `שיעור: ${params.prompt}`;
  const content = [
    `מטרה: להבין ${params.prompt}`,
    "תוכן:",
    "1) היכרות עם הנושא",
    "2) דוגמאות",
    "3) תרגול קצר",
  ].join("\n");

  return prisma.lesson.create({
    data: {
      userId: params.userId,
      categoryId: params.categoryId,
      subCategoryId: params.subCategoryId,
      title,
      content,
    },
  });
}
