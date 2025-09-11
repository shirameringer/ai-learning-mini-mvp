// ===== src/routes/categories.ts =====
import { Router } from "express";
import { prisma } from "../config/db";
import { z } from "zod";
import { validate } from "../middlewares/validate";

const router = Router();

/**
 * GET /api/categories
 * Returns all categories including their subcategories
 */
router.get("/", async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { subCategories: true },
      orderBy: { name: "asc" },
    });
    res.json({ ok: true, data: categories });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/categories
 * Body: { name: string }
 * Creates a new category
 */
const createCategorySchema = z.object({
  name: z.string().min(2).max(60),
});

router.post("/", validate(createCategorySchema), async (req, res, next) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json({ ok: true, data: category });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({ ok: false, message: "Category name already exists" });
    }
    next(err);
  }
});

/**
 * POST /api/categories/:id/subcategories
 * Body: { name: string }
 * Creates a new subcategory under the given category
 */
const createSubCategorySchema = z.object({
  name: z.string().min(2).max(60),
});

router.post(
  "/:id/subcategories",
  validate(createSubCategorySchema),
  async (req, res, next) => {
    try {
      const subCategory = await prisma.subCategory.create({
        data: {
          name: req.body.name,
          categoryId: Number(req.params.id),
        },
      });
      res.status(201).json({ ok: true, data: subCategory });
    } catch (err: any) {
      if (err?.code === "P2003") {
        return res.status(404).json({ ok: false, message: "Category not found" });
      }
      if (err?.code === "P2002") {
        return res.status(409).json({
          ok: false,
          message: "Subcategory with this name already exists in this category",
        });
      }
      next(err);
    }
  }
);

export default router;
