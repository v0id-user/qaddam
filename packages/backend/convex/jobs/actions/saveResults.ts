import { internalAction, internalMutation } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";
import type { JobSearchResults } from "../../types/jobs";
import { logger } from "../../lib/axiom";
// Step 5: Save job search results to database
export const aiSaveJobResults = internalAction({
	args: {
		results: v.any(), // JobSearchResults type
		userId: v.id("users"),
		cvStorageId: v.id("_storage"),
		workflowId: v.string(),
		workflowTrackingId: v.string(),
	},
	handler: async (ctx, args): Promise<{ saved: boolean; resultId: string }> => {
		logger.info("Step 5: Saving job search results:", {
			jobs: args.results.jobs.length,
			workflow: args.workflowId,
		});

		// Update workflow status to indicate saving started
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "saving_results",
			percentage: 82,
			userId: args.userId,
		});

		const results = args.results as JobSearchResults;
		const now = Date.now();

		try {
			logger.info("Saving main job search results record...");

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

			logger.info(`Main record saved with ID: ${jobSearchResultsId}`);
			logger.info(`Saving ${results.jobs.length} individual job results...`);

			// Update workflow status to indicate individual job results saving
			await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "saving_job_results",
				percentage: 88,
				userId: args.userId,
			});

			// Save individual job results
			for (const [index, job] of results.jobs.entries()) {
				if (index % 5 === 0) {
					logger.info(`  Saving job ${index + 1}/${results.jobs.length}...`);

					// Update progress during individual job saving
					const progressPercentage =
						88 + Math.round((index / results.jobs.length) * 10);
					await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
						workflowId: args.workflowTrackingId,
						stage: "saving_job_results",
						percentage: progressPercentage,
						userId: args.userId,
					});
				}

				await ctx.runMutation(internal.jobs.actions.saveResults.saveJobResult, {
					jobSearchResultsId,
					job,
					userId: args.userId,
					createdAt: now,
				});
			}

			logger.info("Save complete:", {
				jobs: results.jobs.length,
				workflow: args.workflowId,
				totalInsights: results.insights.total_relevant,
			});

			// Update workflow status to indicate completion
			await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "completed",
				percentage: 100,
				userId: args.userId,
			});

			return {
				saved: true,
				resultId: jobSearchResultsId,
			};
		} catch (error) {
			logger.error("Error saving job search results:", { error });

			// Update workflow status to indicate error
			await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "save_error",
				percentage: 100,
				userId: args.userId,
			});

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

		logger.info("Inserting main record:", {
			totalFound: results.totalFound,
			totalRelevant: results.insights.total_relevant,
			keywords: results.searchParams.optimized_keywords.length,
		});

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

		logger.info("Inserting job result:", {
			jobListingId: job.jobListingId,
			matchScore: job.experienceMatchScore,
			matchedSkills: job.matchedSkills.length,
		});

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
