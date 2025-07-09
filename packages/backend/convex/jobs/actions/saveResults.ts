import { internalAction, internalMutation } from "@/_generated/server";
import { internal } from "@/_generated/api";
import { v } from "convex/values";
import type { JobSearchResults } from "@/types/jobs";

// Step 5: Save job search results to database
export const aiSaveJobResults = internalAction({
	args: {
		results: v.any(), // JobSearchResults type
		userId: v.id("users"),
		cvStorageId: v.id("_storage"),
		workflowId: v.string(),
	},
	handler: async (ctx, args): Promise<{ saved: boolean; resultId: string }> => {
		console.log("Step 5: Saving job search results to database");

		const results = args.results as JobSearchResults;
		const now = Date.now();

		try {
			// Save main job search results record
			const jobSearchResultsId = await ctx.runMutation(
				internal.jobs.actions.saveResults.saveJobSearchResults,
				{
					userId: args.userId,
					cvStorageId: args.cvStorageId,
					workflowId: args.workflowId,
					results,
					createdAt: now,
				},
			);

			// Save individual job results
			for (const job of results.jobs) {
				await ctx.runMutation(internal.jobs.actions.saveResults.saveJobResult, {
					jobSearchResultsId,
					job,
					createdAt: now,
				});
			}

			console.log(
				`Saved ${results.jobs.length} job results for workflow ${args.workflowId}`,
			);

			return {
				saved: true,
				resultId: jobSearchResultsId,
			};
		} catch (error) {
			console.error("Error saving job search results:", error);
			throw new Error(`Failed to save job search results: ${error}`);
		}
	},
});

// Helper mutation to save main job search results
export const saveJobSearchResults = internalMutation({
	args: {
		userId: v.id("users"),
		cvStorageId: v.id("_storage"),
		workflowId: v.string(),
		results: v.any(),
		createdAt: v.number(),
	},
	handler: async (ctx, args) => {
		const results = args.results as JobSearchResults;

		return await ctx.db.insert("jobSearchResults", {
			userId: args.userId,
			cvStorageId: args.cvStorageId,
			workflowId: args.workflowId,

			// Results data
			totalFound: results.totalFound,

			// Insights
			totalRelevant: results.insights.total_relevant,
			avgMatchScore: results.insights.avg_match_score,
			topSkillsInDemand: results.insights.top_skills_in_demand,
			salaryInsights: results.insights.salary_insights,
			marketObservations: results.insights.market_observations,

			// Search parameters
			optimizedKeywords: results.searchParams.optimized_keywords,
			targetJobTitles: results.searchParams.target_job_titles,
			targetCompanies: results.searchParams.target_companies,
			salaryRangeMin: results.searchParams.salary_range.min,
			salaryRangeMax: results.searchParams.salary_range.max,
			salaryRangeCurrency: results.searchParams.salary_range.currency,
			preferredJobTypes: results.searchParams.preferred_job_types,
			locations: results.searchParams.locations,
			searchStrategy: results.searchParams.search_strategy,

			// Metadata
			createdAt: args.createdAt,
			updatedAt: args.createdAt,
		});
	},
});

// Helper mutation to save individual job result
export const saveJobResult = internalMutation({
	args: {
		jobSearchResultsId: v.id("jobSearchResults"),
		job: v.any(),
		createdAt: v.number(),
	},
	handler: async (ctx, args) => {
		const job = args.job as JobSearchResults["jobs"][0];

		return await ctx.db.insert("jobSearchJobResults", {
			jobSearchResultsId: args.jobSearchResultsId,

			// Basic job info
			externalId: job.id,
			title: job.title,
			company: job.company,
			location: job.location,
			description: job.description,
			requirements: job.requirements,
			salary: job.salary,
			type: job.type,
			remote: job.remote,
			url: job.url,
			postedDate: job.postedDate,
			matchScore: job.matchScore,

			// AI Analysis
			benefits: job.benefits,
			matchedSkills: job.matchedSkills,
			missingSkills: job.missingSkills,
			experienceMatch: job.experienceMatch,
			locationMatch: job.locationMatch,

			// AI Ranking
			aiMatchReasons: job.aiMatchReasons,
			aiConcerns: job.aiConcerns,
			aiRecommendation: job.aiRecommendation,

			// Metadata
			createdAt: args.createdAt,
		});
	},
});
