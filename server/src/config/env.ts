export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
  OPENAI_TIMEOUT_MS: Number(process.env.OPENAI_TIMEOUT_MS ?? 20000),
  OPENAI_MAX_TOKENS: Number(process.env.OPENAI_MAX_TOKENS ?? 1200),
};
if (!ENV.OPENAI_API_KEY) {
  console.warn("[env] OPENAI_API_KEY is not set");
}
