import { z } from "zod";
import { MinimalLinkedInJobSchema } from "./linkedin";
import { MinimalIndeedJobSchema } from "./indeed";

// Discriminated union for crawled jobs - more memory efficient than regular union
export const CrawledJobsSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("linkedIn"),
    jobs: z.array(MinimalLinkedInJobSchema),
  }),
  z.object({
    source: z.literal("indeed"),
    jobs: z.array(MinimalIndeedJobSchema),
  }),
]);

export type CrawledJobs = z.infer<typeof CrawledJobsSchema>;

// Pre-defined parser for better performance
export const CrawledJobsArrayParser = z.array(CrawledJobsSchema);