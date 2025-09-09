import { Router } from "express";
import { prisma } from "../config/db";
import { createUserSchema, updateUserSchema } from "../schemas/user";
import { validate } from "../middlewares/validate";


const router = Router();

/**
 * POST /api/users
 * Create a new user (name, phone)
 */
router.post("/", validate(createUserSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.status(201).json({ ok: true, data: user });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({ ok: false, message: "Phone already exists" });
    }
    next(err);
  }
});

/**
 * GET /api/users
 * Get all users (with optional pagination)
 */
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10));
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.user.findMany({ orderBy: { id: "asc" }, skip, take: pageSize }),
      prisma.user.count(),
    ]);

    res.json({
      ok: true,
      data: items,
      meta: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/:id
 * Get a single user by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ ok: false, message: "Invalid ID" });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });

    res.json({ ok: true, data: user });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/users/:id
 * Update user (name and/or phone)
 */
router.patch("/:id", validate(updateUserSchema), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ ok: false, message: "Invalid ID" });

    const user = await prisma.user.update({
      where: { id },
      data: req.body,
    });

    res.json({ ok: true, data: user });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return res.status(409).json({ ok: false, message: "Phone already exists" });
    }
    if (err?.code === "P2025") {
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    next(err);
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user by ID
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ ok: false, message: "Invalid ID" });

    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err?.code === "P2025") {
      return res.status(404).json({ ok: false, message: "User not found" });
    }
    next(err);
  }
});

/**
 * GET /api/users/:id/lessons
 * Get all lessons for a specific user
 */
router.get("/:id/lessons", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ ok: false, message: "Invalid ID" });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ ok: false, message: "User not found" });

    const lessons = await prisma.lesson.findMany({
      where: { userId: id },
      include: { category: true, subCategory: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ ok: true, data: lessons });
  } catch (err) {
    next(err);
  }
});

export default router;
