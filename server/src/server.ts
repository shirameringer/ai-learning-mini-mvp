// ===== src/server.ts =====
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { ENV } from "./config/env";

// Optional: print partial OpenAI key for debugging (only first 10 chars)
if (process.env.OPENAI_API_KEY) {
  console.log("Loaded OPENAI_API_KEY:", process.env.OPENAI_API_KEY.slice(0, 10));
} else {
  console.warn("Warning: OPENAI_API_KEY is not set");
}

// Start the server
app.listen(ENV.PORT, () => {
  console.log(
    `[server] running on http://localhost:${ENV.PORT} (${ENV.NODE_ENV})`
  );
});
