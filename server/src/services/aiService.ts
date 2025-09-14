import OpenAI from "openai";

/**
 * Single OpenAI client configured from env.
 * Make sure OPENAI_API_KEY is set in server/.env
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateLessonContent(prompt: string): Promise<string> {
  // Basic guard
  const safePrompt = (prompt || "").trim();
  if (!safePrompt) return "No prompt provided.";

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini", // you can use "gpt-4o" as well
    messages: [
      { role: "system", content: "You are a helpful tutor. Create a short, structured lesson." },
      { role: "user", content: safePrompt },
    ],
    max_tokens: 450,
    temperature: 0.4,
  });

  return resp.choices[0]?.message?.content?.trim() || "No content generated.";
}
