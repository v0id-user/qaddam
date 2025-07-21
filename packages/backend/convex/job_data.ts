import { v } from "convex/values";
import { query } from "./_generated/server";

import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { JobResult } from "./types/jobs";

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
			experienceMatch: result.experienceMatch ?? 'not_specified',
			experienceMatchScore: result.experienceMatchScore ?? 0,
			experienceMatchReasons: result.experienceMatchReasons ?? [],
			experienceGaps: [], // Not in database schema yet, provide default
			locationMatch: result.locationMatch ?? 'not_specified',
			locationMatchScore: result.locationMatchScore ?? 0,
			locationMatchReasons: result.locationMatchReasons ?? [],
			workTypeMatch: result.workTypeMatch ?? false,
			requirements: result.requirements ?? [],
			aiMatchReasons: result.aiMatchReasons ?? [],
			aiConcerns: result.aiConcerns ?? [],
			aiRecommendation: (result.aiRecommendation as JobResult['aiRecommendation']) ?? 'consider',
			// extractedData not in database schema yet, omitted for now
		}));

		return {
			searchResults,
			jobResults,
		};
	},
});
