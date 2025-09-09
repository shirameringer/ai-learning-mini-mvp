import { Router } from "express";
import { createLesson } from "../services/lessonService";
import { createLessonSchema } from "../schemas/lesson";
import { prisma } from "../config/db";
import { validate } from "../middlewares/validate";

const router = Router();

/**
 * POST /api/lessons
 * body: { categoryId, subCategoryId, prompt, userId? }
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
 * מחזיר את כל השיעורים
 */
router.get("/", async (_req, res, next) => {
    try {
      const lessons = await prisma.lesson.findMany({
        include: { category: true, subCategory: true, user: true },
        orderBy: { createdAt: "desc" },
      });
      res.json({ ok: true, data: lessons });
    } catch (err) {
      next(err);
    }
  });
  
  /**
   * GET /api/lessons/:id
   * מחזיר שיעור לפי מזהה
   */
  router.get("/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ ok: false, message: "ID לא תקין" });
      }
  
      const lesson = await prisma.lesson.findUnique({
        where: { id },
        include: { category: true, subCategory: true, user: true },
      });
  
      if (!lesson) {
        return res.status(404).json({ ok: false, message: "שיעור לא נמצא" });
      }
  
      res.json({ ok: true, data: lesson });
    } catch (err) {
      next(err);
    }
  });

export default router;
