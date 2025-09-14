import { Router } from "express";
import { prisma } from "../config/db";

const router = Router();

// GET /api/categories – מחזיר קטגוריות כולל תתי־קטגוריות
router.get("/", async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { subCategories: true },
    });
    res.json({ ok: true, data: categories });
  } catch (err) {
    next(err);
  }
});

export default router;
