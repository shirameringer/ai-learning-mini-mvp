// ===== src/middlewares/errorHandler.ts =====
import { ErrorRequestHandler, RequestHandler } from "express";

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ ok: false, error: "NotFound" });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  const status = (err as any)?.status || 500;
  res.status(status).json({
    ok: false,
    error: (err as any)?.message || "InternalServerError",
  });
};
