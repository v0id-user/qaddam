import { z } from "zod";

// Minimal LinkedIn job schema - only fields used in normalization
export const MinimalLinkedInJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  link: z.string(),
  companyName: z.string().optional(),
  descriptionHtml: z.string().optional(),
  descriptionText: z.string().optional(),
  location: z.string().optional(),
  salaryInfo: z.array(z.string()).optional(),
  postedAt: z.string().optional(),
});

export type MinimalLinkedInJob = z.infer<typeof MinimalLinkedInJobSchema>;