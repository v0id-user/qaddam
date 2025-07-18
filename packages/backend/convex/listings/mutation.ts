import { internalMutation } from "../_generated/server";
import { type GenericId, v } from "convex/values";
import { validateCrawledJobsArray } from "../lib/validators";
import type {
	CrawledJobs,
	MinimalLinkedInJob,
	MinimalIndeedJob,
} from "../types/job_types";
import { normalizeJobListing } from "../driver/norm";

// Helper function to insert a normalized job
const insertJob = async (
	ctx: any,
	normalizedJob: any,
	insertedJobs: GenericId<"jobListings">[],
	jobSource: string,
): Promise<boolean> => {
	try {
		const jobId = await ctx.db.insert("jobListings", normalizedJob);
		insertedJobs.push(jobId);
		return true;
	} catch (error) {
		// Use console.log instead of Axiom logger in mutations
		console.error(
			`Failed to insert ${jobSource} job ${normalizedJob.sourceId}:`,
			error,
		);
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

		console.log("addNewJobsListing: Received jobSearchResults input", {
			type: typeof jobSearchResults,
			isArray: Array.isArray(jobSearchResults),
			length: Array.isArray(jobSearchResults)
				? jobSearchResults.length
				: undefined,
		});

		// Validate with lightweight validators (throws on invalid input)
		let parsedInput: CrawledJobs[];
		try {
			parsedInput = validateCrawledJobsArray(jobSearchResults);
			console.log(
				`addNewJobsListing: Parsed input contains ${parsedInput.length} sources`,
			);
		} catch (err) {
			console.error(
				"addNewJobsListing: Failed to validate jobSearchResults",
				err,
			);
			throw err;
		}

		// Insert all jobs, respecting the explicit source tag
		for (const { source, jobs } of parsedInput) {
			console.log(
				`addNewJobsListing: Processing source "${source}" with ${jobs.length} jobs`,
			);
			// Normalize source name for the normalizeJobListing function
			const normalizedSource = source === "linked-in" ? "linkedIn" : source;

			for (const [jobIdx, rawJob] of (
				jobs as (MinimalLinkedInJob | MinimalIndeedJob)[]
			).entries()) {
				console.log(
					`addNewJobsListing: Normalizing job #${jobIdx + 1} from source "${normalizedSource}"`,
				);
				const normalizedJob = normalizeJobListing(
					rawJob,
					normalizedSource as "linkedIn" | "indeed",
				);

				if (normalizedJob) {
					console.log(
						`addNewJobsListing: Inserting normalized job from source "${normalizedSource}" with title "${normalizedJob.name ?? "unknown"}"`,
					);
					const success = await insertJob(
						ctx,
						normalizedJob,
						insertedJobs,
						normalizedSource,
					);

					if (!success) {
						console.warn(
							`addNewJobsListing: Failed to insert job from source "${normalizedSource}" (title: "${normalizedJob.name ?? "unknown"}")`,
						);
						skippedJobs++;
					}
				} else {
					console.warn(
						`addNewJobsListing: Skipped invalid/unnormalizable job from source "${normalizedSource}" at index ${jobIdx}`,
					);
					skippedJobs++;
				}
			}
		}

		// Use console.log instead of Axiom logger in mutations
		console.log(
			`addNewJobsListing: Finished inserting ${insertedJobs.length} job listings, skipped ${skippedJobs} invalid items`,
		);
		return insertedJobs;
	},
});
