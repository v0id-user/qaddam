import { z } from "zod";

// Lightweight runtime-validation + static types for crawled jobs
// Keep the surface minimal – optional/unknown props are permitted via .catchall(z.any())

export const LinkedInJobSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    link: z.string(),
  })
  .catchall(z.any());

export const IndeedJobSchema = z
  .object({
    positionName: z.string(),
    url: z.string(),
    company: z.string(),
  })
  .catchall(z.any());

// Inferred TS types (use these everywhere instead of ad-hoc interfaces)
export type LinkedInJob = z.infer<typeof LinkedInJobSchema>;
export type IndeedJob = z.infer<typeof IndeedJobSchema>; 