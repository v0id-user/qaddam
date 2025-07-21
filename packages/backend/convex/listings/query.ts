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
		limit: v.number(),
	},
	handler: async (ctx, args): Promise<Doc<"jobListings">[]> => {
		// Query job search results for the user only (this is fine)
		const userJobSearchResults = await ctx.db
			.query("jobSearchJobResults")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();

		const userJobIds = new Set(
			userJobSearchResults.map((result) => result.jobListingId),
		);

		console.log(
			`DB search: query="${args.searchQuery.slice(0, 30)}..." (limit: ${args.limit})`,
		);

		// Search in job descriptions
		const descriptionResults = await ctx.db
			.query("jobListings")
			.withSearchIndex("search_description", (q) =>
				q.search("description", args.searchQuery),
			)
			.take(args.limit * 2); // Take more to allow for filtering

		console.log(`Description search: ${descriptionResults.length} results`);

		// Search in job names/titles
		const nameResults = await ctx.db
			.query("jobListings")
			.withSearchIndex("search_name", (q) => q.search("name", args.searchQuery))
			.take(args.limit * 2);

		console.log(`Name search: ${nameResults.length} results`);

		// Combine and deduplicate results, and filter out jobs already seen by user
		const allResults = [...descriptionResults, ...nameResults];
		const uniqueResults = allResults.filter(
			(job, index, self) =>
				index === self.findIndex((j) => j._id === job._id) &&
				!userJobIds.has(job._id),
		);

		console.log(
			`Combined: ${uniqueResults.length} unique results after filtering user jobs`,
		);

		// If no results from search indexes, try a fallback: fetch a small sample and filter in memory
		if (uniqueResults.length === 0) {
			console.log("No search results, trying fallback text matching...");

			// Fetch a small sample of jobs (e.g., 50) to avoid full table scan
			const sampleJobs = await ctx.db.query("jobListings").take(50);

			const searchTerms = args.searchQuery
				.toLowerCase()
				.split(" ")
				.filter((term) => term.length > 2);

			console.log(
				`Text matching with ${searchTerms.length} terms: ${searchTerms.slice(0, 3).join(", ")}...`,
			);

			const textMatchingJobs = sampleJobs.filter((job) => {
				const jobText =
					`${job.name} ${job.description} ${job.sourceName || ""} ${job.location || ""}`.toLowerCase();
				return (
					searchTerms.some((term) => jobText.includes(term)) &&
					!userJobIds.has(job._id)
				);
			});

			console.log(
				`Text matching: ${textMatchingJobs.length} jobs matched (from sample)`,
			);
			return textMatchingJobs.slice(0, args.limit);
		}

		return uniqueResults.slice(0, args.limit);
	},
});
