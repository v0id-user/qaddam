import { v } from "convex/values";
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { JobResult } from "./types/jobs";
import type { Doc } from "./_generated/dataModel";

export const getJobResults = query({
	args: { workflowId: v.string() },
	handler: async (ctx, { workflowId }) => {
		console.log(`Getting job results for workflow ${workflowId}`);

		// Get the job search results record
		const searchResults = await ctx.db
			.query("jobSearchResults")
			.withIndex("by_workflow", (q) => q.eq("workflowId", workflowId))
			.first();

		if (!searchResults) {
			console.log(`No search results found for workflow ${workflowId}`);
			return null;
		}

		console.log(`Found search results record with ID ${searchResults._id}`);

		// Get all job results for this search
		const jobResults = await ctx.db
			.query("jobSearchJobResults")
			.withIndex("by_search_results", (q) =>
				q.eq("jobSearchResultsId", searchResults._id),
			)
			.collect();

		console.log(`Retrieved ${jobResults.length} job results`);

		return {
			searchResults,
			jobResults,
		};
	},
});

export const getJobListing = query({
	args: {
		jobListingId: v.id("jobListings"),
	},
	handler: async (ctx, args) => {
		const user = await ctx.runQuery(api.users.getMe);
		if (!user) {
			throw new Error("User not found unauthorized");
		}
		const jobListing = await ctx.db.get(args.jobListingId);
		if (!jobListing) {
			throw new Error("Job listing not found");
		}
		return jobListing;
	},
});

export const getUserSurvey = query({
	handler: async (ctx) => {
		const user = await getAuthUserId(ctx);
		if (!user) {
			throw new Error("User not found unauthorized");
		}

		const userDoc = await ctx.db.get(user);
		if (!userDoc) {
			throw new Error("User not found");
		}

		const survey = await ctx.db
			.query("userSurveys")
			.withIndex("by_user", (q) => q.eq("userId", userDoc._id))
			.first();

		if (!survey) {
			throw new Error("User survey not found");
		}

		return survey;
	},
});

// Get enhanced job results with all analysis data
export const getJobResultsWithAnalysis = query({
	args: { workflowId: v.string() },
	handler: async (ctx, args) => {
		console.log(`Getting enhanced job results for workflow ${args.workflowId}`);

		const user = await getAuthUserId(ctx);
		if (!user) {
			throw new Error("User not found unauthorized");
		}

		const userDoc = await ctx.db.get(user);
		if (!userDoc) {
			throw new Error("User not found");
		}

		// Get the job search results record
		const searchResults = await ctx.db
			.query("jobSearchResults")
			.withIndex("by_workflow", (q) => q.eq("workflowId", args.workflowId))
			.first();

		if (!searchResults) {
			console.log(`No search results found for workflow ${args.workflowId}`);
			return null;
		}

		console.log(`Found search results record with ID ${searchResults._id}`);

		// Get all job results for this search
		const rawJobResults = await ctx.db
			.query("jobSearchJobResults")
			.withIndex("by_search_results", (q) =>
				q.eq("jobSearchResultsId", searchResults._id),
			)
			.collect();

		console.log(`Retrieved ${rawJobResults.length} job results`);

		// Transform raw job results to JobResult type with all required fields
		const jobResults: JobResult[] = rawJobResults.map((result) => ({
			jobListingId: result.jobListingId,
			benefits: result.benefits ?? [],
			matchedSkills: result.matchedSkills ?? [],
			missingSkills: result.missingSkills ?? [],
			experienceMatch: result.experienceMatch ?? "not_specified",
			experienceMatchScore: result.experienceMatchScore ?? 0,
			experienceMatchReasons: result.experienceMatchReasons ?? [],
			experienceGaps: [], // Not in database schema yet, provide default
			locationMatch: result.locationMatch ?? "not_specified",
			locationMatchScore: result.locationMatchScore ?? 0,
			locationMatchReasons: result.locationMatchReasons ?? [],
			workTypeMatch: result.workTypeMatch ?? false,
			requirements: result.requirements ?? [],
			aiMatchReasons: result.aiMatchReasons ?? [],
			aiConcerns: result.aiConcerns ?? [],
			aiRecommendation:
				(result.aiRecommendation as JobResult["aiRecommendation"]) ??
				"consider",
			// extractedData not in database schema yet, omitted for now
		}));

		return {
			searchResults,
			jobResults,
		};
	},
});

export const getJobListings = query({
	args: {
		paginationOpts: paginationOptsValidator,
	},
	handler: async (ctx, args) => {
		// Use cursor-based pagination as recommended by Convex, but limit to 50 results maximum
		const limitedPaginationOpts = {
			...args.paginationOpts,
			numItems: Math.min(args.paginationOpts.numItems, 50),
		};
		const results = await ctx.db
			.query("jobListings")
			.order("desc")
			.paginate(limitedPaginationOpts);

		return results;
	},
});

// Search job listings with filters
export const searchJobListings = query({
	args: {
		searchQuery: v.optional(v.string()),
		companyName: v.optional(v.string()),
		location: v.optional(v.string()),
		limit: v.optional(v.number()),
	},
	handler: async (
		ctx,
		args,
	): Promise<{ jobs: Doc<"jobListings">[]; totalCount: number }> => {
		const user = await ctx.runQuery(api.users.getMe);
		if (!user) {
			throw new Error("User not found unauthorized");
		}

		if (!user.isPro) {
			throw new Error("User is not a pro user");
		}

		const limit = Math.min(args.limit || 20, 50); // Max 50 results
		let results: Doc<"jobListings">[] = [];

		// If we have a search query, use the search indexes
		if (args.searchQuery && args.searchQuery.trim()) {
			const searchTerm = args.searchQuery.trim();

			// Search in job descriptions with filters
			const descriptionQuery = ctx.db
				.query("jobListings")
				.withSearchIndex("search_description", (q) => {
					let query = q.search("description", searchTerm);

					// Apply filters
					if (args.companyName) {
						query = query.eq("sourceName", args.companyName);
					}
					if (args.location) {
						query = query.eq("location", args.location);
					}

					return query;
				});

			// Search in job names/titles with filters
			const nameQuery = ctx.db
				.query("jobListings")
				.withSearchIndex("search_name", (q) => {
					let query = q.search("name", searchTerm);

					// Apply filters
					if (args.companyName) {
						query = query.eq("sourceName", args.companyName);
					}
					if (args.location) {
						query = query.eq("location", args.location);
					}

					return query;
				});

			const [descriptionResults, nameResults] = await Promise.all([
				descriptionQuery.take(limit * 2),
				nameQuery.take(limit * 2),
			]);

			// Combine and deduplicate results
			const allResults = [...descriptionResults, ...nameResults];
			const uniqueResults = allResults.filter(
				(job, index, self) =>
					index === self.findIndex((j) => j._id === job._id),
			);

			results = uniqueResults.slice(0, limit);

			// If no search results, try fallback text matching
			if (results.length === 0) {
				const sampleJobs = await ctx.db.query("jobListings").take(100);
				const searchTerms = searchTerm
					.toLowerCase()
					.split(" ")
					.filter((term) => term.length > 2);

				const textMatchingJobs = sampleJobs.filter((job) => {
					const jobText =
						`${job.name} ${job.description} ${job.sourceName || ""} ${job.location || ""}`.toLowerCase();
					const matchesSearch = searchTerms.some((term) =>
						jobText.includes(term),
					);
					const matchesCompany =
						!args.companyName ||
						(job.sourceName &&
							job.sourceName
								.toLowerCase()
								.includes(args.companyName.toLowerCase()));
					const matchesLocation =
						!args.location ||
						(job.location &&
							job.location.toLowerCase().includes(args.location.toLowerCase()));

					return matchesSearch && matchesCompany && matchesLocation;
				});

				results = textMatchingJobs.slice(0, limit);
			}
		} else {
			// No search query, just apply filters to all jobs
			const allJobs = await ctx.db
				.query("jobListings")
				.order("desc")
				.take(limit * 2);

			// Apply filters in memory
			results = allJobs
				.filter((job) => {
					const matchesCompany =
						!args.companyName ||
						(job.sourceName &&
							job.sourceName
								.toLowerCase()
								.includes(args.companyName.toLowerCase()));
					const matchesLocation =
						!args.location ||
						(job.location &&
							job.location.toLowerCase().includes(args.location.toLowerCase()));

					return matchesCompany && matchesLocation;
				})
				.slice(0, limit);
		}

		return {
			jobs: results,
			totalCount: results.length,
		};
	},
});
