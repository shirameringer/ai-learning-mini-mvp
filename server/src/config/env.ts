// Loads .env and validates required environment variables.
// Keep all keys in one place so imports like `ENV.OPENAI_API_KEY` work.

import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  // Server
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  // OpenAI
  OPENAI_API_KEY: z
    .string()
    .min(1, "OPENAI_API_KEY is required (set it in your .env)"),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_MAX_TOKENS: z.coerce.number().default(1200),
  OPENAI_TIMEOUT_MS: z.coerce.number().default(20000),

  // Database (optional here; Prisma reads DATABASE_URL directly)
  DATABASE_URL: z.string().optional(),
});

export const ENV = schema.parse(process.env);

// Handy flags
export const IS_PROD = ENV.NODE_ENV === "production";
export const IS_DEV = ENV.NODE_ENV === "development";
