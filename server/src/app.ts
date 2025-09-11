
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler } from "./middlewares/errorHandler";
import health from "./routes/health";
import categories from "./routes/categories";
import lessons from "./routes/lessons";
import users from "./routes/users";
import authRoutes from "./routes/authRoutes";
const app = express();

// Security headers
app.use(helmet());

// HTTP request logger
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS configuration (allows frontend origin or defaults to localhost:5173)
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Routes
app.use("/api/health", health);
app.use("/api/categories", categories);
app.use("/api/lessons", lessons);
app.use("/api/users", users);
app.use("/api/auth", authRoutes);

// Root info (so / won't be 404)
app.get("/", (_req, res) => {
  res.send("Server is up. Try /api/health");
});

// 404 fallback (after all routes)
app.use((_req, res) => {
  res.status(404).json({ ok: false, message: "Not found" });
});

// Error handler
app.use(errorHandler);

export default app;
