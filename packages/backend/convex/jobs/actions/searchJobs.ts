import { internalAction } from "../../_generated/server";
import { api, internal } from "../../_generated/api";
import { v } from "convex/values";
import type { JobResult } from "../../types/jobs";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { batch_job_analysis_schema } from "../../lib/schemas/batch_job_analysis";
import type { JobType } from "../../types/jobs";

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

		const me = await ctx.runQuery(api.users.getMe);

		// Update workflow status to indicate job search started
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "searching_jobs",
			percentage: 42,
			userId: args.userId,
		});

		const { searchParams } = args;

		// OPTIMIZATION 1: Use only top 3 most relevant search terms to reduce API calls
		const searchStrategies = [
			// Strategy 1: Top technical skills (reduced from 3 to 2)
			...searchParams.technical_skills.slice(0, 2),
			// Strategy 2: Primary job title (reduced from 2 to 1)
			...searchParams.job_title_keywords.slice(0, 1),
		].filter((term) => term && term.trim().length > 2);

		console.log("Optimized search strategies:", {
			terms: searchStrategies.length,
			strategies: searchStrategies.slice(0, 3).join(", ") + "...",
		});

		// OPTIMIZATION 2: Run all database searches in parallel with 20 job limit per search
		console.log(
			`Running ${searchStrategies.length} parallel database searches (20 jobs each)...`,
		);
		const searchPromises = searchStrategies.map(async (searchTerm) => {
			console.log(`Parallel search: "${searchTerm.slice(0, 20)}..."`);
			return await ctx.runQuery(
				internal.listings.query.searchJobListingsUnused,
				{ searchQuery: searchTerm.trim(), userId: args.userId },
			);
		});

		const searchResults = await Promise.all(searchPromises);
		const allResults = searchResults.flat();

		console.log(
			`Parallel search completed: ${allResults.length} total results`,
		);

		// OPTIMIZATION 3: Single workflow update after all searches complete
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "searching_jobs",
			percentage: 52,
			userId: args.userId,
		});

		// Remove duplicates, shuffle, and limit to 20 jobs immediately
		const uniqueResults = allResults
			.filter(
				(job, index, self) =>
					index === self.findIndex((j) => j._id === job._id),
			)
			.sort(() => Math.random() - 0.5) // Shuffle randomly
			.slice(0, me?.isPro ? 20 : 7);

		console.log(
			`Search complete: ${uniqueResults.length} unique jobs (limited to 20) from ${allResults.length} total results`,
		);

		// OPTIMIZATION 4: Cache survey results and run parallel with job processing
		const [surveyResults] = await Promise.all([
			ctx.runQuery(internal.surveys.getSurveyResults, { userId: args.userId }),
			ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "processing_jobs",
				percentage: 55,
				userId: args.userId,
			}),
		]);

		// Extract survey data for AI analysis (optimized string building)
		const surveyData = surveyResults[0];
		const userSurveyInfo = surveyData
			? `USER: ${surveyData.profession} (${surveyData.experience}y, ${surveyData.careerLevel}) | Titles: ${surveyData.jobTitles.slice(0, 3).join(", ")} | Industries: ${surveyData.industries.slice(0, 3).join(", ")} | Work: ${surveyData.workType} | Locations: ${surveyData.locations.slice(0, 3).join(", ")} | Skills: ${surveyData.skills.slice(0, 8).join(", ")} | Companies: ${surveyData.companyTypes.slice(0, 3).join(", ")}`
			: "No survey data available";

		// Convert database results to JobResult format
		const jobResults: JobResult[] = [];
		console.log("Processing jobs for comprehensive AI analysis...");

		// OPTIMIZATION 5: Efficient job preprocessing (already limited to 20)
		const jobsToProcess = uniqueResults.map((job, index) => {
			// Pre-lowercase job text once
			const jobText = `${job.name} ${job.description}`.toLowerCase();

			// Optimize skill matching with early exit
			const matchedSkills: string[] = [];
			const missingSkills: string[] = [];

			for (const skill of searchParams.technical_skills) {
				const skillLower = skill.toLowerCase();
				if (jobText.includes(skillLower)) {
					matchedSkills.push(skill);
				} else {
					missingSkills.push(skill);
				}
			}

			return {
				job,
				index,
				matchedSkills,
				missingSkills,
			};
		});

		// OPTIMIZATION 6: Reduce AI batch size for faster response time
		const BATCH_SIZE = 8; // Reduced from 12 to 8 for faster processing
		const chunks = [];
		for (let i = 0; i < jobsToProcess.length; i += BATCH_SIZE) {
			chunks.push(jobsToProcess.slice(i, i + BATCH_SIZE));
		}

		console.log(
			`Processing ${jobsToProcess.length} jobs in ${chunks.length} batches of ${BATCH_SIZE} (optimized for speed)`,
		);

		// OPTIMIZATION 7: Minimize workflow updates - only update every 2nd batch
		let lastProgressUpdate = 55;

		// Process each chunk with batch AI analysis
		for (const [chunkIndex, chunk] of chunks.entries()) {
			console.log(
				`Processing batch ${chunkIndex + 1}/${chunks.length} (${chunk.length} jobs)...`,
			);

			// OPTIMIZATION 8: Prepare compact batch data for AI analysis
			const batchJobData = chunk.map(
				({ job, matchedSkills, missingSkills }) => ({
					id: job._id,
					title: job.name.slice(0, 50), // Reduced from 60 to 50 chars
					desc: job.description.slice(0, 200), // Reduced from 300 to 200 chars
					location: job.location || "Remote",
					matched: matchedSkills.slice(0, 4).join(","), // Reduced from 5 to 4 skills
					missing: missingSkills.slice(0, 2).join(","), // Reduced from 3 to 2 missing skills
				}),
			);

			// OPTIMIZATION 9: Streamlined AI prompt for faster processing
			const batchAnalysis = await generateObject({
				model: openai.chat("gpt-4o-mini", {
					structuredOutputs: true,
				}),
				messages: [
					{
						role: "system",
						content: `Analyze ${chunk.length} jobs for candidate fit. Extract: experience match (0-1 score), location match (0-1 score), top 3 benefits, top 3 requirements, salary/company/job type. Be concise.`,
					},
					{
						role: "user",
						content: `${userSurveyInfo}

CV: ${args.cvProfile.experience_level} (${args.cvProfile.years_of_experience}y) | Skills: ${args.cvProfile.skills.slice(0, 6).join(",")} | Locations: ${args.cvProfile.preferred_locations.slice(0, 3).join(",")}

JOBS:
${batchJobData.map((job, idx) => `${idx + 1}. ${job.title} @${job.location} | ${job.desc} | ✓${job.matched} | ✗${job.missing}`).join("\n")}`,
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
			const batchData = batchAnalysis.object as {
				jobAnalyses: Array<{
					jobId: string;
					experienceMatch: {
						match_level: "perfect" | "good" | "partial" | "poor" | "mismatch";
						match_score: number;
						match_reasons: string[];
						experience_gaps: string[];
						recommendation: string;
					};
					locationMatch: {
						match_score: number;
						match_reasons: string[];
						work_type_match: string;
					};
					benefits: string[];
					requirements: string[];
					dataExtraction: {
						salary: {
							is_salary_mentioned: boolean;
							min: number | null;
							max: number | null;
							currency: string;
						};
						company: {
							is_company_mentioned: boolean;
							name: string | null;
						};
						job_type: {
							type: string;
						};
					};
				}>;
			};

			const batchResults: JobResult[] = [];

			// OPTIMIZATION 10: Efficient batch result processing
			for (
				let batchIdx = 0;
				batchIdx < batchData.jobAnalyses.length;
				batchIdx++
			) {
				const analysis = batchData.jobAnalyses[batchIdx];
				const originalJob = chunk[batchIdx];
				if (!originalJob) continue;

				const { job, matchedSkills, missingSkills } = originalJob;

				// OPTIMIZATION 11: Simplified location matching
				let locationMatch = "no_location_provided";
				if (args.cvProfile.preferred_locations.length > 0) {
					const jobLocation = (job.location || "").toLowerCase();
					locationMatch = args.cvProfile.preferred_locations.some((location) =>
						jobLocation.includes(location.toLowerCase()),
					)
						? "location_match"
						: "location_mismatch";
				}

				const jobResult: JobResult = {
					jobListingId: job._id,
					// Benefits - now directly as string array
					benefits: analysis.benefits,
					// Requirements - now directly as string array
					requirements: analysis.requirements,
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
							type: (analysis.dataExtraction.job_type.type as JobType) || null,
							is_remote: false,
							work_arrangement: null,
						},
					},
				};

				batchResults.push(jobResult);
			}

			jobResults.push(...batchResults);

			// OPTIMIZATION 12: Reduce progress updates frequency - only update every 2nd batch or at end
			const shouldUpdateProgress =
				chunkIndex % 2 === 0 || chunkIndex === chunks.length - 1;
			if (shouldUpdateProgress) {
				const batchCompleteProgress =
					55 + Math.round(((chunkIndex + 1) / chunks.length) * 20);
				if (batchCompleteProgress > lastProgressUpdate) {
					lastProgressUpdate = batchCompleteProgress;
					await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
						workflowId: args.workflowTrackingId,
						stage: "processing_jobs",
						percentage: batchCompleteProgress,
						userId: args.userId,
					});
				}
			}

			console.log(
				`Batch ${chunkIndex + 1}/${chunks.length} completed (${jobResults.length} total processed)`,
			);
		}

		// Update workflow status to indicate all batches completed
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "jobs_processed",
			percentage: 75,
			userId: args.userId,
		});

		// OPTIMIZATION 13: Return all processed results (already limited to 20)
		const finalResults = jobResults;
		const avgScore =
			finalResults.length > 0
				? (
						finalResults.reduce(
							(sum, job) => sum + job.experienceMatchScore,
							0,
						) / finalResults.length
					).toFixed(2)
				: "0.00";

		console.log(
			`✅ Optimized search completed: ${finalResults.length} jobs, avg score: ${avgScore}`,
		);

		return {
			jobs: finalResults,
			totalFound: jobResults.length,
			searchParams: args.searchParams,
		};
	},
});
