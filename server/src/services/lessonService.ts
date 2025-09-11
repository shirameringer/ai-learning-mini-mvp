// ===== server/src/services/lessonService.ts =====
import { prisma } from "../config/db";
import { LessonJsonSchema, LessonJson } from "../schemas/lessonContent";
import { generateLessonContent, /* optional */ generateLessonJson } from "./aiService";

export interface LessonInput {
  categoryId: number;
  subCategoryId: number;
  prompt: string;
  userId?: number;
}

/**
 * Render markdown from a structured lesson JSON object.
 */
function renderMarkdownFromJson(j: LessonJson): string {
  const lines: string[] = [];
  const safeTitle = j.title?.trim() || "Untitled Lesson";
  lines.push(`# ${safeTitle}`);

  if (j.objectives?.length) {
    lines.push("\n## Objectives");
    for (const o of j.objectives) lines.push(`- ${o}`);
  }

  if (j.outline?.length) {
    lines.push("\n## Outline");
    for (const sec of j.outline) {
      if (sec.heading) lines.push(`### ${sec.heading}`);
      for (const b of sec.bullets || []) lines.push(`- ${b}`);
    }
  }

  if (j.codeSamples?.length) {
    lines.push("\n## Code Samples");
    for (const cs of j.codeSamples) {
      lines.push(`\n\`\`\`${cs.language}\n${cs.code}\n\`\`\``);
    }
  }

  if (j.exercises?.length) {
    lines.push("\n## Exercises");
    for (const ex of j.exercises) {
      lines.push(`- **Q:** ${ex.q}`);
      if (ex.a) lines.push(`  - **A (hint/solution):** ${ex.a}`);
    }
  }

  if (j.summary) {
    lines.push("\n## Summary");
    lines.push(j.summary);
  }

  return lines.join("\n");
}

/**
 * Creates a lesson with robust validation:
 * 1) Validate foreign keys (userId exists if provided, category/subCategory exist and match)
 * 2) Try generating structured JSON (if aiService.generateLessonJson exists)
 * 3) Fallback to plain markdown content
 * 4) Persist with backward-compatible "content" plus new fields
 */
export async function createLesson(input: LessonInput) {
  const categoryId = Number(input.categoryId);
  const subCategoryId = Number(input.subCategoryId);
  const userId = input.userId === undefined ? undefined : Number(input.userId);
  const prompt = (input.prompt || "").trim();

  if (!prompt) {
    const err: any = new Error("Prompt is required");
    err.status = 400;
    throw err;
  }

  // Validate userId (optional) — prevent FK error
  if (userId !== undefined) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err: any = new Error("User not found");
      err.status = 400;
      err.details = { field: "userId" };
      throw err;
    }
  }

  // Validate category and subCategory, and their relationship
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    const err: any = new Error("Category not found");
    err.status = 400;
    err.details = { field: "categoryId" };
    throw err;
  }

  const sub = await prisma.subCategory.findUnique({ where: { id: subCategoryId } });
  if (!sub) {
    const err: any = new Error("SubCategory not found");
    err.status = 400;
    err.details = { field: "subCategoryId" };
    throw err;
  }

  if (sub.categoryId !== categoryId) {
    const err: any = new Error("SubCategory does not belong to Category");
    err.status = 400;
    err.details = { fields: ["categoryId", "subCategoryId"] };
    throw err;
  }

  // Attempt structured JSON path first
  let title = `Lesson: ${prompt}`;
  let contentMarkdown: string | null = null;
  let contentJson: LessonJson | null = null;

  try {
    if (typeof generateLessonJson === "function") {
      const raw = await generateLessonJson(prompt); // expected JSON string or object
      const parsedObj = typeof raw === "string" ? JSON.parse(raw) : raw;
      const parsed = LessonJsonSchema.parse(parsedObj);
      contentJson = parsed;
      contentMarkdown = renderMarkdownFromJson(parsed);
      if (parsed.title?.trim()) title = parsed.title.trim();
    }
  } catch {
    // ignore JSON path errors and fall back to plain content
  }

  // Fallback to legacy plain content if no JSON/markdown was produced
  if (!contentMarkdown) {
    const content = await generateLessonContent(prompt);
    contentMarkdown = content?.trim() || `# ${title}\n\nNo content returned.`;
  }

  // Persist
  const created = await prisma.lesson.create({
    data: {
      title,
      content: contentMarkdown,          // backward-compatible column
      contentMarkdown: contentMarkdown,  // remove if your model doesn't include this column
      contentJson: contentJson as any,   // remove if your model doesn't include this column
      categoryId,
      subCategoryId,
      userId,
    },
  });

  return created;
}
