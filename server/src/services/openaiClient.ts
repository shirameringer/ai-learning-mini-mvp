// ===== src/services/openaiClient.ts =====
import OpenAI from "openai";
import { ENV } from "../config/env";

/**
 * Simple exponential backoff retry helper (no external deps).
 */
async function retryWithBackoff<T>(
  task: () => Promise<T>,
  opts: { retries: number; minDelayMs: number; maxDelayMs: number }
): Promise<T> {
  let attempt = 0;
  let delay = opts.minDelayMs;

  // jitter helper
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // clamp helper
  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));

  while (true) {
    try {
      return await task();
    } catch (err: any) {
      attempt++;
      if (attempt > opts.retries) {
        throw err;
      }

      // Heuristic: retry only on transient/network/timeouts and 5xx
      const status = err?.status ?? err?.response?.status;
      const isTimeout = err?.name === "AbortError";
      const shouldRetry =
        isTimeout ||
        status === 429 ||
        (typeof status === "number" && status >= 500);

      if (!shouldRetry) {
        throw err;
      }

      await sleep(delay);
      delay = clamp(Math.floor(delay * 2), opts.minDelayMs, opts.maxDelayMs);
    }
  }
}

const client = new OpenAI({ apiKey: ENV.OPENAI_API_KEY });

/**
 * Call OpenAI and ask for a strict JSON response.
 * Returns the raw JSON string (not yet parsed).
 */
export async function callOpenAIJson(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ENV.OPENAI_TIMEOUT_MS);

  try {
    const run = await retryWithBackoff(
      async () => {
        const res = await client.chat.completions.create({
          model: ENV.OPENAI_MODEL,
          temperature: 0.2,
          max_tokens: ENV.OPENAI_MAX_TOKENS,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a teaching assistant that returns strictly valid JSON for lessons.",
            },
            {
              role: "user",
              content: [
                "Return ONLY JSON with keys: title (string), objectives (string[]),",
                "outline ({heading:string, bullets:string[]}[]), codeSamples ({language:string, code:string}[]),",
                "exercises ({q:string, a?:string}[]), summary (string).",
                "No markdown, no prose outside JSON.",
                "",
                `Prompt: ${prompt}`,
              ].join("\n"),
            },
          ],
          // Abort after ENV.OPENAI_TIMEOUT_MS
          // @ts-ignore: OpenAI SDK accepts AbortSignal
          signal: controller.signal as any,
        });

        const text = res.choices?.[0]?.message?.content?.trim();
        if (!text) {
          throw new Error("Empty response from OpenAI");
        }
        return text;
      },
      { retries: 2, minDelayMs: 400, maxDelayMs: 1500 }
    );

    return run;
  } finally {
    clearTimeout(timeout);
  }
}