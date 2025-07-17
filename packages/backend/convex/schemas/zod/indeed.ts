import { z } from "zod";

// Minimal Indeed job schema - only fields used in normalization
export const MinimalIndeedJobSchema = z.object({
  positionName: z.string(),
  url: z.string(),
  company: z.string(),
  salary: z.string().optional(),
  jobType: z.array(z.string()).optional(),
  location: z.string().optional(),
  companyInfo: z.object({
    companyLogo: z.string().optional(),
    companyDescription: z.string().optional(),
  }).optional(),
});

export type MinimalIndeedJob = z.infer<typeof MinimalIndeedJobSchema>;