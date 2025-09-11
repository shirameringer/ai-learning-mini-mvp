// ===== src/services/aiService.ts =====
import OpenAI from "openai";

// ודאי שיש OPENAI_API_KEY ב-.env (בצד השרת)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// עזר ל-timeout עם AbortController
function withTimeout<T>(ms: number, fn: (signal: AbortSignal) => Promise<T>) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fn(controller.signal).finally(() => clearTimeout(id));
}

/**
 * מחזיר JSON מובנה של שיעור (מחרוזת JSON).
 * המבנה: { title, objectives[], outline[], codeSamples[], exercises[], summary }
 */
export async function generateLessonJson(prompt: string): Promise<string> {
  const safePrompt = (prompt ?? "").trim();
  if (!safePrompt) {
    return JSON.stringify({
      title: "Empty Prompt",
      objectives: [],
      outline: [],
      codeSamples: [],
      exercises: [],
      summary: "No prompt provided.",
    });
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const maxTokens = Number(process.env.OPENAI_MAX_TOKENS ?? 1200);
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS ?? 20000);

  return withTimeout(timeoutMs, async (signal) => {
    // שימי לב: ה-signal עובר בארגומנט **השני** (options), לא בתוך גוף הבקשה
    const resp = await openai.chat.completions.create(
      {
        model,
        temperature: 0.2,
        max_tokens: maxTokens,
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
              "Return ONLY JSON with keys:",
              "title (string), objectives (string[]),",
              "outline ({heading:string, bullets:string[]}[]),",
              "codeSamples ({language:string, code:string}[]),",
              "exercises ({q:string, a?:string}[]), summary (string).",
              "No markdown, no prose outside JSON.",
              "",
              `Prompt: ${safePrompt}`,
            ].join("\n"),
          },
        ],
      },
      { signal } // <<<<<< זה המקום הנכון
    );

    const text = resp.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return JSON.stringify({
        title: `Lesson: ${safePrompt}`,
        objectives: [],
        outline: [],
        codeSamples: [],
        exercises: [],
        summary: "Empty response from OpenAI.",
      });
    }
    return text;
  });
}

/**
 * יוצר תוכן Markdown לשיעור (מסלול הפשוט/הישן).
 */
export async function generateLessonContent(prompt: string): Promise<string> {
  const safePrompt = (prompt ?? "").trim();
  if (!safePrompt) return "No prompt provided.";

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS ?? 20000);

  return withTimeout(timeoutMs, async (signal) => {
    const resp = await openai.chat.completions.create(
      {
        model,
        temperature: 0.4,
        max_tokens: 450,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful tutor. Create a short, structured lesson in Markdown.",
          },
          { role: "user", content: safePrompt },
        ],
      },
      { signal } // <<<<<< גם כאן בארגומנט השני
    );

    return resp.choices?.[0]?.message?.content?.trim() || "No content generated.";
  });
}
