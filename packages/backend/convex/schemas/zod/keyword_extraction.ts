import { z } from "zod";

// Keyword extraction schema for job search optimization
export const KeywordExtractionSchema = z.object({
  primary_keywords: z
    .array(z.string())
    .min(1)
    .describe("Most important keywords for job searching - technical skills, job titles, core expertise"),
  secondary_keywords: z
    .array(z.string())
    .min(1)
    .describe("Additional relevant keywords - related skills, industry terms, experience levels"),
  search_terms: z
    .array(z.string())
    .min(1)
    .describe("Combined optimized search terms for database queries"),
  job_title_keywords: z
    .array(z.string())
    .min(1)
    .describe("Specific job titles and role names to search for"),
  technical_skills: z
    .array(z.string())
    .min(1)
    .describe("Technical skills, programming languages, frameworks, and tools"),
});

export type KeywordExtraction = z.infer<typeof KeywordExtractionSchema>;