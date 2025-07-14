import { v } from "convex/values";
import { query } from "./_generated/server";
import chalk from "chalk";
import { api } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getJobResults = query({
	args: { workflowId: v.string() },
	handler: async (ctx, { workflowId }) => {
		console.log(chalk.blue(`Getting job results for workflow ${workflowId}`));

		// Get the job search results record
		const searchResults = await ctx.db
			.query("jobSearchResults")
			.withIndex("by_workflow", (q) => q.eq("workflowId", workflowId))
			.first();

		if (!searchResults) {
			console.log(
				chalk.yellow(`No search results found for workflow ${workflowId}`),
			);
			return null;
		}

		console.log(
			chalk.green(`Found search results record with ID ${searchResults._id}`),
		);

		// Get all job results for this search
		const jobResults = await ctx.db
			.query("jobSearchJobResults")
			.withIndex("by_search_results", (q) =>
				q.eq("jobSearchResultsId", searchResults._id),
			)
			.collect();

		console.log(chalk.blue(`Retrieved ${jobResults.length} job results`));

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
		console.log(
			chalk.blue(
				`Getting enhanced job results for workflow ${args.workflowId}`,
			),
		);

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
			console.log(
				chalk.yellow(`No search results found for workflow ${args.workflowId}`),
			);
			return null;
		}

		console.log(
			chalk.green(`Found search results record with ID ${searchResults._id}`),
		);

		// Get all job results for this search
		const jobResults = await ctx.db
			.query("jobSearchJobResults")
			.withIndex("by_search_results", (q) =>
				q.eq("jobSearchResultsId", searchResults._id),
			)
			.collect();

		console.log(chalk.blue(`Retrieved ${jobResults.length} job results`));

		// Get user survey data for context
		const userSurvey: Doc<"userSurveys"> | null = await ctx.db
			.query("userSurveys")
			.withIndex("by_user", (q) => q.eq("userId", userDoc._id))
			.first();

		// Get job listings data for each result
		const jobListings = await Promise.all(
			jobResults.map(async (result) => {
				const listing = await ctx.db.get(result.jobListingId);
				return listing;
			}),
		);

		return {
			searchResults,
			jobResults,
			userSurvey,
			jobListings: jobListings.filter(Boolean), // Remove any null entries
		};
	},
});
