import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  res.status(err?.status ?? 500).json({
    ok: false,
    error: err?.message ?? "Internal Server Error",
  });
}
