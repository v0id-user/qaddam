import { internalMutation } from "../_generated/server";
import { type GenericId, v } from "convex/values";
import { validateCrawledJobsArray } from "../lib/validators";
import type { CrawledJobs, MinimalLinkedInJob, MinimalIndeedJob } from "../types/job_types";
import { logger } from "../lib/axiom";
import { normalizeJobListing } from "../driver/norm";

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

		// Validate with lightweight validators (throws on invalid input)
		const parsedInput: CrawledJobs[] = validateCrawledJobsArray(jobSearchResults);

		// Insert all jobs, respecting the explicit source tag
		for (const { source, jobs } of parsedInput) {
			for (const rawJob of jobs as (MinimalLinkedInJob | MinimalIndeedJob)[]) {
				const normalizedJob = normalizeJobListing(
					rawJob,
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
