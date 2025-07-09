import { internalAction } from "@/_generated/server";
import { v } from "convex/values";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { JobResult, JobSearchResults } from "../../types/jobs";
import { generateObject } from "ai";

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
	},
	handler: async (ctx, args): Promise<JobSearchResults> => {
		// If no jobs found, return empty results with default insights
		if (!args.jobResults.jobs || args.jobResults.jobs.length === 0) {
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

		const response = await generateObject({
			model: openai.chat("gpt-4o-mini", {
				structuredOutputs: true,
			}),
			schemaName: "Job_Ranking_and_Insights",
			messages: [
				{
					role: "system",
					content: `
<agent>
  <name>JobRankingAgent</name>
  <description>
    An AI agent that intelligently ranks and filters job results based on user profile and preferences.
  </description>

  <goals>
    <goal>Rank jobs by relevance to user's profile and career goals</goal>
    <goal>Remove duplicate or low-quality job postings</goal>
    <goal>Calculate accurate match scores based on skills, experience, and preferences</goal>
    <goal>Provide personalized insights about each job opportunity</goal>
  </goals>

  <rules>
    <rule>Prioritize jobs that match user's skills and experience level</rule>
    <rule>Consider location preferences and remote work options</rule>
    <rule>Factor in salary expectations and career progression</rule>
    <rule>Remove obvious duplicates and spam postings</rule>
    <rule>Provide reasoning for job rankings and match scores</rule>
    <rule>Always provide concerns array, even if empty</rule>
  </rules>
</agent>
					`,
				},
				{
					role: "user",
					content: `
Based on the following data, rank and analyze job results:

CV Profile: ${JSON.stringify(args.cvProfile, null, 2)}
Search Parameters: ${JSON.stringify(args.searchParams, null, 2)}
Job Results: ${JSON.stringify(args.jobResults, null, 2)}
					`,
				},
			],
			schema: z.object({
				ranked_jobs: z.array(
					z.object({
						id: z.string(),
						match_score: z.number().min(0).max(1),
						match_reasons: z.array(z.string()),
						concerns: z.array(z.string()), // Made required instead of optional
						recommendation: z.enum([
							"highly_recommended",
							"recommended",
							"consider",
							"not_recommended",
						]),
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

		// Merge AI rankings with original job data
		const rankedJobsData = response.object.ranked_jobs;
		const originalJobs = args.jobResults.jobs;

		const finalJobs = originalJobs
			.map((job: JobResult) => {
				const ranking = rankedJobsData.find((r) => r.id === job.id);
				return {
					...job,
					matchScore: ranking ? ranking.match_score * 100 : job.matchScore, // Convert to percentage
					aiMatchReasons: ranking?.match_reasons || [],
					aiConcerns: ranking?.concerns || [],
					aiRecommendation: ranking?.recommendation || "consider",
				};
			})
			.sort((a: any, b: any) => b.matchScore - a.matchScore);

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
				target_companies: [], // Not available in new structure
				salary_range: {
					min: 0,
					max: 100000,
					currency: "USD",
				}, // Default values since not available
				preferred_job_types: ["full_time"], // Default since not available
				locations: args.cvProfile.preferred_locations,
				search_strategy: "AI-optimized keyword matching based on CV analysis",
			},
		} as JobSearchResults;
	},
});
