import { z } from "zod";

// CV Profile schema for parsing user CVs
export const CVProfileSchema = z.object({
  skills: z.array(z.string()).min(1),
  experience_level: z.enum(["entry", "mid", "senior", "executive"]),
  job_titles: z.array(z.string()).min(1),
  industries: z.array(z.string()).min(1),
  keywords: z.array(z.string()).min(1),
  education: z.string().min(1),
  years_of_experience: z.number().min(0),
  preferred_locations: z.array(z.string()).min(1),
});

export type CVProfile = z.infer<typeof CVProfileSchema>;