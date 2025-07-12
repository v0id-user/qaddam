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
		console.log(
			"Step 5: Saving job search results:",
			`${args.results.jobs.length} jobs,`,
			`workflow: ${args.workflowId.slice(0, 8)}...`
		);

		const results = args.results as JobSearchResults;
		const now = Date.now();

		try {
			console.log("Saving main job search results record...");
			
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

			console.log(`Main record saved with ID: ${jobSearchResultsId}`);
			console.log(`Saving ${results.jobs.length} individual job results...`);

			// Save individual job results
			for (const [index, job] of results.jobs.entries()) {
				if (index % 5 === 0) {
					console.log(`  Saving job ${index + 1}/${results.jobs.length}...`);
				}
				
				await ctx.runMutation(internal.jobs.actions.saveResults.saveJobResult, {
					jobSearchResultsId,
					job,
					userId: args.userId,
					createdAt: now,
				});
			}

			console.log(
				`Save complete: ${results.jobs.length} job results saved`,
				`for workflow ${args.workflowId.slice(0, 8)}...`,
				`Total insights: ${results.insights.total_relevant} relevant jobs`
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

		console.log(
			"Inserting main record:",
			`${results.totalFound} total found,`,
			`${results.insights.total_relevant} relevant,`,
			`${results.searchParams.optimized_keywords.length} keywords`
		);

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
		userId: v.id("users"),
		createdAt: v.number(),
	},
	handler: async (ctx, args) => {
		const job = args.job as JobSearchResults["jobs"][0];
		
		console.log(
			"Inserting job result:",
			`ID: ${job.jobListingId},`,
			`match score: ${job.experienceMatchScore},`,
			`${job.matchedSkills.length} matched skills`
		);

		return await ctx.db.insert("jobSearchJobResults", {
			userId: args.userId,
			jobSearchResultsId: args.jobSearchResultsId,

			// Basic job info
			jobListingId: job.jobListingId,

			// AI Analysis
			benefits: job.benefits,
			requirements: job.requirements || [],
			matchedSkills: job.matchedSkills,
			missingSkills: job.missingSkills,
			experienceMatch: job.experienceMatch,
			experienceMatchScore: job.experienceMatchScore,
			experienceMatchReasons: job.experienceMatchReasons || [],
			locationMatch: job.locationMatch,
			locationMatchScore: job.locationMatchScore || 0,
			locationMatchReasons: job.locationMatchReasons || [],
			workTypeMatch: job.workTypeMatch,

			// AI Ranking
			aiMatchReasons: job.aiMatchReasons,
			aiConcerns: job.aiConcerns,
			aiRecommendation: job.aiRecommendation,

			// Metadata
			createdAt: args.createdAt,
		});
	},
});
