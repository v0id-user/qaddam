import { internalAction, internalQuery } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";
import type { JobResult } from "../../types/jobs";
import type { Doc } from "../../_generated/dataModel";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { validateBatchJobAnalysis } from "../../lib/validators";
import { batch_job_analysis_schema } from "../../lib/schemas/batch_job_analysis";
import type { BatchJobAnalysis } from "../../types/job_types";
import type { JobType } from "../../types/jobs";
// Internal query to get all jobs for testing/debugging
export const getAllJobListings = internalQuery({
	args: {},
	handler: async (ctx): Promise<Doc<"jobListings">[]> => {
		return await ctx.db.query("jobListings").take(100);
	},
});

// Internal query to search the database
export const searchJobListings = internalQuery({
	args: {
		searchQuery: v.string(),
	},
	handler: async (ctx, args): Promise<Doc<"jobListings">[]> => {
		// Query all jobs first to get total count
		const allJobsInDb = await ctx.db.query("jobListings").collect();
		console.log(
			`DB search: ${allJobsInDb.length} total jobs, query="${args.searchQuery.slice(0, 30)}..."`,
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

			const filteredJobs = allJobsInDb.filter((job) => {
				const jobText =
					`${job.name} ${job.description} ${job.sourceName || ""} ${job.location || ""}`.toLowerCase();
				return searchTerms.some((term) => jobText.includes(term));
			});

			console.log(`Text matching: ${filteredJobs.length} jobs matched`);
			return filteredJobs;
		}

		return uniqueResults;
	},
});

// Internal query to get survey results
export const getSurveyResults = internalQuery({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args): Promise<Doc<"userSurveys">[]> => {
		return await ctx.db
			.query("userSurveys")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.take(1);
	},
});

// Comprehensive job analysis schema imported from external file

// Step 3: Search with the AI keywords
export const aiSearchJobs = internalAction({
	args: {
		userId: v.id("users"),
		searchParams: v.object({
			primary_keywords: v.array(v.string()),
			secondary_keywords: v.array(v.string()),
			search_terms: v.array(v.string()),
			job_title_keywords: v.array(v.string()),
			technical_skills: v.array(v.string()),
		}), // Tuned parameters from step 2
		cvProfile: v.object({
			skills: v.array(v.string()),
			experience_level: v.string(),
			job_titles: v.array(v.string()),
			industries: v.array(v.string()),
			keywords: v.array(v.string()),
			education: v.string(),
			years_of_experience: v.number(),
			preferred_locations: v.array(v.string()),
		}), // Original profile from step 1
		workflowTrackingId: v.string(),
	},
	handler: async (
		ctx,
		args,
	): Promise<{
		jobs: JobResult[];
		totalFound: number;
		searchParams: typeof args.searchParams;
	}> => {
		console.log("Starting job search:", {
			technicalSkills: args.searchParams.technical_skills.length,
			jobTitles: args.searchParams.job_title_keywords.length,
			yearsOfExperience: args.cvProfile.years_of_experience,
		});

		// Update workflow status to indicate job search started
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "searching_jobs",
			percentage: 42,
			userId: args.userId,
		});

		const { searchParams } = args;

		// Try different search strategies with single terms (Convex limit: 16 terms max)
		const searchStrategies = [
			// Strategy 1: Individual technical skills
			...searchParams.technical_skills.slice(0, 3),
			// Strategy 2: Job titles
			...searchParams.job_title_keywords.slice(0, 2),
			// Strategy 3: Primary keywords
			...searchParams.primary_keywords.slice(0, 3),
		];

		console.log("Search strategies:", {
			terms: searchStrategies.length,
			strategies: searchStrategies.slice(0, 3).join(", ") + "...",
		});

		// Update workflow status to indicate database search started
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "searching_jobs",
			percentage: 48,
			userId: args.userId,
		});

		const allResults: Doc<"jobListings">[] = [];
		let searchCount = 0;

		// Try each search term individually (better for Convex search)
		for (const searchTerm of searchStrategies) {
			if (searchTerm && searchTerm.trim().length > 2) {
				searchCount++;
				console.log(
					`[${searchCount}/${searchStrategies.length}] Searching: "${searchTerm.slice(0, 20)}..."`,
				);

				// Update progress for each search term
				const searchProgress =
					48 + Math.round((searchCount / searchStrategies.length) * 4); // 48% to 52% spread across search terms
				await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
					workflowId: args.workflowTrackingId,
					stage: "searching_jobs",
					percentage: searchProgress,
					userId: args.userId,
				});

				const results = await ctx.runQuery(
					internal.jobs.actions.searchJobs.searchJobListings,
					{ searchQuery: searchTerm.trim() },
				);

				console.log(`  → Found ${results.length} results`);
				allResults.push(...results);
			}
		}

		// Remove duplicates
		const uniqueResults = allResults.filter(
			(job, index, self) => index === self.findIndex((j) => j._id === job._id),
		);

		console.log(
			`Search complete: ${uniqueResults.length} unique jobs from ${allResults.length} total results`,
		);

		// Update workflow status to indicate job search completed, processing started
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "processing_jobs",
			percentage: 52,
			userId: args.userId,
		});

		// Get survey results once for all jobs
		const surveyResults = await ctx.runQuery(
			internal.jobs.actions.searchJobs.getSurveyResults,
			{ userId: args.userId },
		);

		// Convert database results to JobResult format
		const jobResults: JobResult[] = [];
		console.log("Processing jobs for comprehensive AI analysis...");

		// Prepare job data for batched processing
		const jobsToProcess = uniqueResults.map((job, index) => {
			const jobText =
				`${job.name} ${job.description} ${job.sourceName || ""}`.toLowerCase();
			const matchedSkills = searchParams.technical_skills.filter((skill) =>
				jobText.includes(skill.toLowerCase()),
			);

			return {
				job,
				index,
				jobText,
				matchedSkills,
				missingSkills: searchParams.technical_skills.filter(
					(skill) => !matchedSkills.includes(skill),
				),
			};
		});

		// Update workflow status to indicate AI analysis started
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "processing_jobs",
			percentage: 55,
			userId: args.userId,
		});

		// Batch AI requests in chunks to avoid overwhelming the API
		const BATCH_SIZE = 12; // Increased from 5 to 12 jobs per batch for maximum efficiency
		const chunks = [];
		for (let i = 0; i < jobsToProcess.length; i += BATCH_SIZE) {
			chunks.push(jobsToProcess.slice(i, i + BATCH_SIZE));
		}

		console.log(
			`Processing ${jobsToProcess.length} jobs in ${chunks.length} batches of ${BATCH_SIZE} (using optimized batch AI analysis)`,
		);

		// Process each chunk with batch AI analysis
		for (const [chunkIndex, chunk] of chunks.entries()) {
			console.log(
				`Processing batch ${chunkIndex + 1}/${chunks.length} (${chunk.length} jobs)...`,
			);

			// Update progress at the start of each batch - 55% to 75% spread across batches (20% range)
			const batchStartProgress =
				55 + Math.round((chunkIndex / chunks.length) * 20);
			await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "processing_jobs",
				percentage: batchStartProgress,
				userId: args.userId,
			});

			// Prepare optimized batch data for AI analysis
			const batchJobData = chunk.map(
				({ job, index, matchedSkills, missingSkills }) => ({
					id: job._id,
					title: job.name.slice(0, 60), // Truncate title for efficiency
					desc: job.description.slice(0, 300), // Reduced from 1000 to 300 chars
					location: job.location || "Remote",
					matched: matchedSkills.slice(0, 5).join(","), // Limit to top 5 skills
					missing: missingSkills.slice(0, 3).join(","), // Limit to top 3 missing skills
				}),
			);

			// OPTIMIZED BATCH AI ANALYSIS - 12 jobs in single AI call
			const batchAnalysis = await (generateObject as any)({
				model: openai.chat("gpt-4o-mini", {
					structuredOutputs: true,
				}),
				messages: [
					{
						role: "system",
						content: `Analyze ${chunk.length} jobs for candidate fit. Extract: experience match (score 0-1), location compatibility (score 0-1), benefits, requirements, salary/company/job type. Be concise and consistent.`,
					},
					{
						role: "user",
						content: `
CANDIDATE: ${args.cvProfile.experience_level} (${args.cvProfile.years_of_experience}y) | Skills: ${args.cvProfile.skills.slice(0, 8).join(",")} | Locations: ${args.cvProfile.preferred_locations.join(",")}

JOBS:
${batchJobData.map((job, idx) => `${idx + 1}. ${job.title} @${job.location} | ${job.desc.slice(0, 200)}... | ✓${job.matched} | ✗${job.missing}`).join("\n")}

Return analysis for each job in order.
						`,
					},
				],
				schema: batch_job_analysis_schema,
			});

			console.log(
				`AI Batch Analysis [Batch ${chunkIndex + 1}] - Token usage:`,
				{
					promptTokens: batchAnalysis.usage?.promptTokens || 0,
					completionTokens: batchAnalysis.usage?.completionTokens || 0,
					totalTokens: batchAnalysis.usage?.totalTokens || 0,
				},
			);

			// Process batch results
			const batchData = validateBatchJobAnalysis(
				batchAnalysis.object as unknown,
			);

			const batchResults = batchData.jobAnalyses
				.map(
					(analysis: BatchJobAnalysis["jobAnalyses"][0], batchIdx: number) => {
						const originalJob = chunk[batchIdx];
						if (!originalJob) {
							console.warn(`Missing job data for batch index ${batchIdx}`);
							return null;
						}

						const { job, index, matchedSkills, missingSkills } = originalJob;

						// Check location match
						let locationMatch = "no_location_provided";
						if (args.cvProfile.preferred_locations.length > 0) {
							const jobLocation = (job.location || "").toLowerCase();
							const matchingLocation = args.cvProfile.preferred_locations.some(
								(location) => jobLocation.includes(location.toLowerCase()),
							);
							locationMatch = matchingLocation
								? "location_match"
								: "location_mismatch";
						}

						console.log(
							`  Job ${index + 1}: "${job.name.slice(0, 30)}..." - ${matchedSkills.length} skills matched, Experience: ${analysis.experienceMatch.match_level} (${analysis.experienceMatch.match_score}), Location: ${analysis.locationMatch.match_score}`,
						);

						return {
							jobListingId: job._id,
							// Benefits - convert to simple string array
							benefits: analysis.benefits.map((benefit) =>
								benefit.details
									? `${benefit.description} (${benefit.details})`
									: benefit.description,
							),
							// Requirements - convert to simple string array
							requirements: analysis.requirements.map((req) =>
								req.details
									? `${req.description} (${req.details})`
									: req.description,
							),
							matchedSkills,
							missingSkills,
							// Experience matching
							experienceMatch: analysis.experienceMatch.match_level,
							experienceMatchScore: analysis.experienceMatch.match_score,
							experienceMatchReasons: analysis.experienceMatch.match_reasons,
							// Location matching
							locationMatchScore: analysis.locationMatch.match_score,
							locationMatchReasons: analysis.locationMatch.match_reasons,
							locationMatch,
							workTypeMatch: ["remote", "hybrid", "onsite"].includes(
								(analysis.locationMatch.work_type_match || "").toLowerCase(),
							),
							// Data extraction (for use in combineResults)
							extractedData: {
								salary: analysis.dataExtraction.salary,
								company: analysis.dataExtraction.company,
								jobType: {
									type:
										(analysis.dataExtraction.job_type.type as JobType) || null,
									is_remote: false,
									work_arrangement: null,
								},
							},
						};
					},
				)
				.filter(
					(result): result is Exclude<typeof result, null> => result !== null,
				);

			jobResults.push(...batchResults);
			console.log(
				`Batch ${chunkIndex + 1} completed. Total processed: ${jobResults.length}/${jobsToProcess.length}`,
			);

			// Update progress after each batch completes
			const batchCompleteProgress =
				55 + Math.round(((chunkIndex + 1) / chunks.length) * 20);
			await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "processing_jobs",
				percentage: batchCompleteProgress,
				userId: args.userId,
			});
		}

		// Update workflow status to indicate all batches completed
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "jobs_processed",
			percentage: 75,
			userId: args.userId,
		});

		const finalResults = jobResults.slice(0, 20);
		console.log(
			`Returning ${finalResults.length} jobs: avg score: ${(finalResults.reduce((sum, job) => sum + job.experienceMatchScore, 0) / finalResults.length).toFixed(2)}`,
		);

		return {
			jobs: finalResults,
			totalFound: jobResults.length,
			searchParams: args.searchParams,
		};
	},
});
