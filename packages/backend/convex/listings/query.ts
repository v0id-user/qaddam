import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import { internalQuery } from "../_generated/server";

// Internal query to get all jobs for testing/debugging
export const getAllJobListings = internalQuery({
	args: {},
	handler: async (ctx): Promise<Doc<"jobListings">[]> => {
		return await ctx.db.query("jobListings").take(100);
	},
});

// Internal query to search the database for jobs that the user has not already searched for
export const searchJobListingsUnused = internalQuery({
	args: {
		searchQuery: v.string(),
		userId: v.id("users"),
	},
	handler: async (ctx, args): Promise<Doc<"jobListings">[]> => {
		// Query job search results for the user and all jobs in parallel
		const [userJobSearchResults, allJobsInDb] = await Promise.all([
			ctx.db
				.query("jobSearchJobResults")
				.withIndex("by_user", (q) => q.eq("userId", args.userId))
				.collect(),
			ctx.db.query("jobListings").collect(),
		]);

		const filteredJobs = allJobsInDb.filter(
			(job) =>
				!userJobSearchResults.some((result) => result.jobListingId === job._id),
		);

		console.log(
			`DB search: ${filteredJobs.length} total jobs, query="${args.searchQuery.slice(0, 30)}..."`,
		);

		// Search in job descriptions
		const descriptionResults = await ctx.db
			.query("jobListings")
			.withSearchIndex("search_description", (q) =>
				q.search("description", args.searchQuery),
			)
			.take(50);

		console.log(`Description search: ${descriptionResults.length} results`);

		// Search in job names/titles
		const nameResults = await ctx.db
			.query("jobListings")
			.withSearchIndex("search_name", (q) => q.search("name", args.searchQuery))
			.take(50);

		console.log(`Name search: ${nameResults.length} results`);

		// Combine and deduplicate results
		const allResults = [...descriptionResults, ...nameResults];
		const uniqueResults = allResults.filter(
			(job, index, self) => index === self.findIndex((j) => j._id === job._id),
		);

		console.log(`Combined: ${uniqueResults.length} unique results`);

		// If no results from search indexes, try simple text matching
		if (uniqueResults.length === 0) {
			console.log("No search results, trying text matching...");

			// Filter jobs that contain any of the search terms (case insensitive)
			const searchTerms = args.searchQuery
				.toLowerCase()
				.split(" ")
				.filter((term) => term.length > 2);

			console.log(
				`Text matching with ${searchTerms.length} terms: ${searchTerms.slice(0, 3).join(", ")}...`,
			);

			const textMatchingJobs = filteredJobs.filter((job) => {
				const jobText =
					`${job.name} ${job.description} ${job.sourceName || ""} ${job.location || ""}`.toLowerCase();
				return searchTerms.some((term) => jobText.includes(term));
			});

			console.log(`Text matching: ${textMatchingJobs.length} jobs matched`);
			return textMatchingJobs;
		}

		return uniqueResults;
	},
});
