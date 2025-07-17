import { internalMutation } from "../_generated/server";
import { type GenericId, v } from "convex/values";
import { z } from "zod";
import { 
  LinkedInJobSchema, 
  IndeedJobSchema, 
  type LinkedInJob as ParsedLinkedInJob, 
  type IndeedJob as ParsedIndeedJob,
} from "../driver/jobs/schemas";
import type { LinkedInJob as LinkedInJobFull } from "../driver/jobs/actors/linkedin_jobs";
import type { IndeedJob as IndeedJobFull } from "../driver/jobs/actors/indeed_jobs";
import { logger } from "../lib/axiom";
import { normalizeJobListing } from "../driver/norm";

// -----------------------------------------------
// Runtime-checked schema for what the Action sends
// -----------------------------------------------
export const CrawledJobsSchema = z.union([
  z.object({
    source: z.literal("linkedIn"),
    jobs: z.array(LinkedInJobSchema),
  }),
  z.object({
    source: z.literal("indeed"),
    jobs: z.array(IndeedJobSchema),
  }),
]);

export type CrawledJobs = z.infer<typeof CrawledJobsSchema>;

// Helper function to insert a normalized job
const insertJob = async (
	ctx: any,
	normalizedJob: any,
	insertedJobs: GenericId<"jobListings">[],
	jobSource: string
): Promise<boolean> => {
	try {
		const jobId = await ctx.db.insert("jobListings", normalizedJob);
		insertedJobs.push(jobId);
		return true;
	} catch (error) {
		logger.error(`Failed to insert ${jobSource} job ${normalizedJob.sourceId}:`, {
			error,
		});
		return false;
	}
};

// Mutation that receives raw job-search results from multiple sources and persists them
// in the `jobListings` table after normalizing them appropriately.
export const addNewJobsListing = internalMutation({
	// Keep the validator broad – the action will pass raw actor results from multiple sources.
	// We validate/clean the data ourselves before inserting.
	args: {
		jobSearchResults: v.any(),
	},
	handler: async (
		ctx,
		{ jobSearchResults },
	): Promise<GenericId<"jobListings">[]> => {
		const insertedJobs: GenericId<"jobListings">[] = [];
		let skippedJobs = 0;

		// Validate & parse with Zod (throws on invalid input)
		const parsedInput: CrawledJobs[] = z.array(CrawledJobsSchema).parse(jobSearchResults);

		// Insert all jobs, respecting the explicit source tag
		for (const { source, jobs } of parsedInput) {
			for (const rawJob of jobs as (ParsedLinkedInJob | ParsedIndeedJob)[]) {
				const normalizedJob = normalizeJobListing(
					rawJob as unknown as LinkedInJobFull | IndeedJobFull,
					source,
				);

				if (normalizedJob) {
					const success = await insertJob(
						ctx,
						normalizedJob,
						insertedJobs,
						source,
					);

					if (!success) skippedJobs++;
				} else {
					skippedJobs++;
				}
			}
		}

		logger.info(
			`Finished inserting ${insertedJobs.length} job listings, skipped ${skippedJobs} invalid items`,
		);
		return insertedJobs;
	},
});
