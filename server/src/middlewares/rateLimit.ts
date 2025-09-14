import { rateLimit } from "express-rate-limit";

export const createLessonRateLimit = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many lesson creations, please slow down." },
});