// server/src/app.ts
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middlewares/errorHandler";

// Routers
import health from "./routes/health";
import authRoutes from "./routes/authRoutes";   // ← auth
import categories from "./routes/categories";
import lessons from "./routes/lessons";
import users from "./routes/users";

const app = express();

/* Middlewares */
app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

/* Routes */
app.use("/api/health", health);
app.use("/api/auth", authRoutes);              // ← mount auth under /api/auth
app.use("/api/categories", categories);
app.use("/api/lessons", lessons);
app.use("/api/users", users);

// Root info
app.get("/", (_req, res) => res.send("Server is up. Try /api/health"));

/* 404 + Errors (keep last) */
app.use((_req, res) => res.status(404).json({ ok: false, message: "Not found" }));
app.use(errorHandler);

export default app;
