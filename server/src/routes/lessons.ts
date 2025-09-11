// ===== src/routes/lessons.ts =====
import { Router } from "express";
import { prisma } from "../config/db";
import { validate } from "../middlewares/validate";
import { createLesson } from "../services/lessonService";
import {
  createLessonSchema,
  listLessonsQuerySchema,
} from "../schemas/lesson";

const router = Router();

/**
 * POST /api/lessons
 * Body: { categoryId, subCategoryId, prompt, userId? }
 * Creates a new lesson via the service (includes AI integration).
 */
router.post("/", validate(createLessonSchema), async (req, res, next) => {
  try {
    const lesson = await createLesson(req.body);
    res.status(201).json({ ok: true, data: lesson });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/lessons
 * Returns lessons with optional filtering, pagination, and sorting.
 * Query params:
 * - userId?: number
 * - categoryId?: number
 * - subCategoryId?: number
 * - page?: number (default: 1)
 * - pageSize?: number (default: 10, max: 100)
 * - sortBy?: "createdAt" | "title" (default: "createdAt")
 * - sortDir?: "asc" | "desc" (default: "desc")
 */
router.get("/", async (req, res, next) => {
  try {
    // Parse and coerce query using Zod (works even if your validate middleware handles body only)
    const {
      userId,
      categoryId,
      subCategoryId,
      page,
      pageSize,
      sortBy,
      sortDir,
    } = listLessonsQuerySchema.parse(req.query);

    const where: any = {};
    if (userId) where.userId = userId;
    if (categoryId) where.categoryId = categoryId;
    if (subCategoryId) where.subCategoryId = subCategoryId;

    const [total, items] = await Promise.all([
      prisma.lesson.count({ where }),
      prisma.lesson.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: true,
          subCategory: true,
          user: true,
        },
        // If you added contentMarkdown/contentJson to your schema, they are included by default.
      }),
    ]);

    res.json({
      ok: true,
      data: items,
      meta: {
        total,
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
        sortBy,
        sortDir,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/lessons/:id
 * Returns a single lesson by id.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, message: "Invalid id" });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { category: true, subCategory: true, user: true },
    });

    if (!lesson) {
      return res.status(404).json({ ok: false, message: "Lesson not found" });
    }

    res.json({ ok: true, data: lesson });
  } catch (err) {
    next(err);
  }
});

export default router;
