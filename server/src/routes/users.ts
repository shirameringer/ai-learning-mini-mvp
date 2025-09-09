import { Router } from "express";
import { prisma } from "../config/db";
import { createUserSchema } from "../schemas/user";

const router = Router();

/**
 * POST /api/users
 * Create a new user (name, phone)
 */
router.post("/", async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);

    const user = await prisma.user.create({ data });
    res.status(201).json({ ok: true, data: user });
  } catch (err: any) {
    // Validation error
    if (err?.issues) {
      return res.status(400).json({ ok: false, message: "Validation failed", issues: err.issues });
    }
    // Unique constraint error (phone already exists)
    if (err?.code === "P2002") {
      return res.status(409).json({ ok: false, message: "Phone already exists" });
    }
    next(err);
  }
});

/**
 * GET /api/users
 * Get all users (without lessons)
 */
router.get("/", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    res.json({ ok: true, data: users });
  } catch (err) {
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





