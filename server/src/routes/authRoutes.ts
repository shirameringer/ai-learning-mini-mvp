import { Router } from "express";
import { prisma } from "../config/db";
import { validate } from "../middlewares/validate";
import { checkSchema, registerSchema } from "../schemas/auth";

const router = Router();

/**
 * POST /api/auth/check
 * body: { phone }
 * אם קיים משתמש עם הטלפון → { ok:true, found:true, data:user }
 * אחרת → { ok:true, found:false }
 */
router.post("/check", validate(checkSchema), async (req, res, next) => {
  try {
    const { phone } = req.body as { phone: string };
    const normalized = phone.replace(/\s+/g, "");
    const user = await prisma.user.findUnique({ where: { phone: normalized } });
    if (!user) return res.json({ ok: true, found: false });
    return res.json({ ok: true, found: true, data: user });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/register
 * body: { name, phone }
 * יוצר משתמש חדש אם לא קיים; אם קיים (לפי phone @unique) מחזיר 409
 */
router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { name, phone } = req.body as { name: string; phone: string };
    const normalized = phone.replace(/\s+/g, "");

    const exists = await prisma.user.findUnique({ where: { phone: normalized } });
    if (exists) {
      return res.status(409).json({ ok: false, message: "User already exists" });
    }

    const user = await prisma.user.create({
      data: { name, phone: normalized },
    });

    return res.status(201).json({ ok: true, data: user });
  } catch (err) {
    next(err);
  }
});

export default router;