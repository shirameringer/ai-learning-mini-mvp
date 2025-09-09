import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { ENV } from "./config/env";

// 🟢 optional: debug print (רק לבדיקת טעינת המפתח)
console.log("Loaded OPENAI_API_KEY:", process.env.OPENAI_API_KEY?.slice(0, 10));

app.listen(ENV.PORT, () => {
  console.log(`[server] running on http://localhost:${ENV.PORT} (${ENV.NODE_ENV})`);
});
