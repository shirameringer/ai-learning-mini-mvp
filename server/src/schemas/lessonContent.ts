import { z } from "zod";

export const LessonJsonSchema = z.object({
  title: z.string(),
  objectives: z.array(z.string()).default([]),
  outline: z.array(
    z.object({
      heading: z.string(),
      bullets: z.array(z.string()).default([]),
    })
  ).default([]),
  codeSamples: z.array(
    z.object({
      language: z.string(),
      code: z.string(),
    })
  ).default([]),
  exercises: z.array(
    z.object({
      q: z.string(),
      a: z.string().optional(),
    })
  ).default([]),
  summary: z.string().optional(),
});

export type LessonJson = z.infer<typeof LessonJsonSchema>;