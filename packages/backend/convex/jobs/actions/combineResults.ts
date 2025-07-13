import { internalAction, internalQuery } from "@/_generated/server";
import { internal } from "@/_generated/api";
import { v } from "convex/values";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { JobResult, JobSearchResults } from "../../types/jobs";
import type { Doc } from "@/_generated/dataModel";
import { generateObject } from "ai";

// Internal query to get job listing details
export const getJobListing = internalQuery({
	args: {
		jobListingId: v.id("jobListings"),
	},
	handler: async (ctx, args): Promise<Doc<"jobListings"> | null> => {
		return await ctx.db.get(args.jobListingId);
	},
});

// Step 4: Combine and rank all job results
export const aiCombineJobResults = internalAction({
	args: {
		jobResults: v.object({
			jobs: v.array(v.any()), // JobResult array - keeping as any for now due to complex nested structure
			totalFound: v.number(),
			searchParams: v.object({
				primary_keywords: v.array(v.string()),
				secondary_keywords: v.array(v.string()),
				search_terms: v.array(v.string()),
				job_title_keywords: v.array(v.string()),
				technical_skills: v.array(v.string()),
			}),
		}), // Results from step 3
		cvProfile: v.object({
			skills: v.array(v.string()),
			experience_level: v.string(),
			job_titles: v.array(v.string()),
			industries: v.array(v.string()),
			keywords: v.array(v.string()),
			education: v.string(),
			years_of_experience: v.number(),
			preferred_locations: v.array(v.string()),
		}), // Original profile for matching
		searchParams: v.object({
			primary_keywords: v.array(v.string()),
			secondary_keywords: v.array(v.string()),
			search_terms: v.array(v.string()),
			job_title_keywords: v.array(v.string()),
			technical_skills: v.array(v.string()),
		}), // Search parameters used
		userId: v.id("users"),
		workflowTrackingId: v.string(),
	},
	handler: async (ctx, args): Promise<JobSearchResults> => {
		console.log(
			"Starting job ranking:",
			`${args.jobResults.jobs.length} jobs,`,
			`${args.searchParams.primary_keywords.length} primary keywords,`,
			`${args.cvProfile.skills.length} skills`
		);

		// Update workflow status to indicate job ranking started
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "ranking_jobs",
			percentage: 75,
			userId: args.userId,
		});

		// If no jobs found, return empty results with default insights
		if (!args.jobResults.jobs || args.jobResults.jobs.length === 0) {
			console.log("No jobs found, returning empty results");
			
			// Update workflow status to indicate completion with no results
			await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "no_jobs_found",
				percentage: 82,
				userId: args.userId,
			});
			
			return {
				jobs: [],
				totalFound: 0,
				insights: {
					total_relevant: 0,
					avg_match_score: 0,
					top_skills_in_demand: [],
					salary_insights: "No salary data available",
					market_observations: "No jobs found matching the search criteria",
				},
				searchParams: {
					optimized_keywords: [
						...args.searchParams.primary_keywords,
						...args.searchParams.secondary_keywords,
						...args.searchParams.search_terms,
					],
					target_job_titles: args.searchParams.job_title_keywords,
					target_companies: [],
					salary_range: {
						min: 0,
						max: 100000,
						currency: "USD",
					},
					preferred_job_types: ["full_time"],
					locations: args.cvProfile.preferred_locations,
					search_strategy: "AI-optimized keyword matching based on CV analysis",
				},
			} as JobSearchResults;
		}

		console.log("Calling AI ranking model for job analysis...");

		// Update workflow status to indicate AI analysis started
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "ai_analysis",
			percentage: 77,
			userId: args.userId,
		});

		const response = await generateObject({
			model: openai.chat("gpt-4o-mini", {
				structuredOutputs: true,
			}),
			schemaName: "Job_Ranking_and_Insights",
			messages: [
				{
					role: "system",
					content: `Rank jobs by relevance to candidate profile. Remove duplicates/spam. Calculate match scores, provide match reasons and concerns. Generate market insights.`,
				},
				{
					role: "user",
					content: `
CANDIDATE: ${args.cvProfile.experience_level} (${args.cvProfile.years_of_experience}y) | Skills: ${args.cvProfile.skills.slice(0, 10).join(", ")} | Locations: ${args.cvProfile.preferred_locations.join(", ")}

SEARCH PARAMS: ${args.searchParams.primary_keywords.slice(0, 5).join(", ")} | Job Titles: ${args.searchParams.job_title_keywords.slice(0, 3).join(", ")}

JOBS (${args.jobResults.jobs.length}): ${args.jobResults.jobs.slice(0, 10).map((job: any) => `${job.jobListingId}: Score ${job.experienceMatchScore}`).join(", ")}${args.jobResults.jobs.length > 10 ? "..." : ""}

Rank and analyze for insights.
					`,
				},
			],
			schema: z.object({
				ranked_jobs: z.array(
					z.object({
						id: z.string(),
						match_reasons: z.array(z.string()),
						concerns: z.array(z.string()), // Made required instead of optional
					}),
				),
				insights: z.object({
					total_relevant: z.number(),
					avg_match_score: z.number(),
					top_skills_in_demand: z.array(z.string()),
					salary_insights: z.string(),
					market_observations: z.string(),
				}),
			}),
		});

		console.log("AI Job Ranking - Token usage:", {
			promptTokens: response.usage?.promptTokens || 0,
			completionTokens: response.usage?.completionTokens || 0,
			totalTokens: response.usage?.totalTokens || 0
		});

		console.log(
			"AI ranking completed:",
			`${response.object.ranked_jobs.length} ranked jobs,`,
			`${response.object.insights.total_relevant} relevant,`,
			`avg score: ${response.object.insights.avg_match_score}`
		);

		console.log(
			"Top skills in demand:",
			response.object.insights.top_skills_in_demand.slice(0, 3).join(", ") + "..."
		);

		// Update workflow status to indicate data extraction started
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "extracting_data",
			percentage: 79,
			userId: args.userId,
		});

		const originalJobs = args.jobResults.jobs;
		console.log("Processing original job results...");

		// Use pre-extracted data instead of making additional AI calls
		console.log("Using pre-extracted data from searchJobs.ts (no additional AI calls needed)");

		const extractedData = {
			salaries: [] as Array<{min: number; max: number; currency: string}>,
			companies: [] as string[],
			jobTypes: [] as string[],
		};

		// Process pre-extracted data from each job
		for (const job of originalJobs) {
			const jobResult = job as JobResult;
			if (jobResult.extractedData) {
				const { salary, company, jobType } = jobResult.extractedData;
				
				// Collect salary data
				if (salary.is_salary_mentioned && salary.min !== null && salary.max !== null) {
					extractedData.salaries.push({
						min: salary.min,
						max: salary.max,
						currency: salary.currency || "USD"
					});
				}
				
				// Collect company data
				if (company.is_company_mentioned && company.name) {
					extractedData.companies.push(company.name);
				}
				
				// Collect job type data
				if (jobType.type) {
					extractedData.jobTypes.push(jobType.type);
				}
			}
		}

		// Update workflow status to indicate final processing
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "extracting_data",
			percentage: 81,
			userId: args.userId,
		});

		// Process extracted data to get final values
		console.log("Processing extracted data for final results...");
		
		// Calculate salary range
		let finalSalaryRange = {
			min: 0,
			max: 100000,
			currency: "USD"
		};

		if (extractedData.salaries.length > 0) {
			const validSalaries = extractedData.salaries.filter(s => s.min > 0 && s.max > 0);
			if (validSalaries.length > 0) {
				finalSalaryRange = {
					min: Math.min(...validSalaries.map(s => s.min)),
					max: Math.max(...validSalaries.map(s => s.max)),
					currency: validSalaries[0].currency // Use first currency found
				};
			}
		}

		// Get unique companies
		const uniqueCompanies = [...new Set(extractedData.companies)].slice(0, 10); // Limit to top 10

		// Get job type distribution
		const jobTypeCount = extractedData.jobTypes.reduce((acc, type) => {
			acc[type] = (acc[type] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Get preferred job types (most common ones)
		const preferredJobTypes = Object.entries(jobTypeCount)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 3)
			.map(([type]) => type);

		console.log("Extraction results:", {
			salaryRange: finalSalaryRange,
			companies: uniqueCompanies.length,
			jobTypes: preferredJobTypes.length
		});

		// Generate final jobs with recommendation based on match score
		const finalJobs = originalJobs
			.map((job: JobResult) => {
				// Generate recommendation based on match score
				let recommendation: "highly_recommended" | "recommended" | "consider" | "not_recommended";
				const matchScore = job.experienceMatchScore;
				
				if (matchScore >= 0.8) {
					recommendation = "highly_recommended";
				} else if (matchScore >= 0.6) {
					recommendation = "recommended";
				} else if (matchScore >= 0.4) {
					recommendation = "consider";
				} else {
					recommendation = "not_recommended";
				}

				return {
					...job,
					matchScore: job.experienceMatchScore,
					aiMatchReasons: job.experienceMatchReasons || [],
					aiConcerns: job.missingSkills || [],
					aiRecommendation: recommendation,
					// Ensure all required fields are included
					experienceMatchScore: job.experienceMatchScore,
					experienceMatchReasons: job.experienceMatchReasons || [],
					locationMatchScore: job.locationMatchScore || 0,
					locationMatchReasons: job.locationMatchReasons || [],
				};
			})
			.sort((a, b) => b.matchScore - a.matchScore);

		console.log(
			"Final processing complete:",
			`${finalJobs.length} jobs,`,
			`top score: ${finalJobs[0]?.matchScore || 0}`,
			`lowest score: ${finalJobs[finalJobs.length - 1]?.matchScore || 0}`
		);

		// Update workflow status to indicate job ranking completed
		await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
			workflowId: args.workflowTrackingId,
			stage: "jobs_ranked",
			percentage: 82,
			userId: args.userId,
		});

		return {
			jobs: finalJobs,
			totalFound: finalJobs.length,
			insights: response.object.insights,
			searchParams: {
				optimized_keywords: [
					...args.searchParams.primary_keywords,
					...args.searchParams.secondary_keywords,
					...args.searchParams.search_terms,
				],
				target_job_titles: args.searchParams.job_title_keywords,
				target_companies: uniqueCompanies,
				salary_range: finalSalaryRange,
				preferred_job_types: preferredJobTypes.length > 0 ? preferredJobTypes : ["full_time"],
				locations: args.cvProfile.preferred_locations,
				search_strategy: "AI-optimized keyword matching based on CV analysis",
			},
		} as JobSearchResults;
	},
});
