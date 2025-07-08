import { internalAction } from "@/_generated/server";
import { v } from "convex/values";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { JobResult, JobSearchResults } from "../../types/jobs";
import { generateObject } from "ai";

// Step 4: Combine and rank all job results
export const aiCombineJobResults = internalAction({
	args: {
		jobResults: v.any(), // Results from step 3
		cvProfile: v.any(), // Original profile for matching
		searchParams: v.any(), // Search parameters used
	},
	handler: async (ctx, args): Promise<JobSearchResults> => {
		const response = await generateObject({
			model: openai.chat("gpt-4o-mini", {
				structuredOutputs: true,
			}),
			schemaName: "Job Ranking and Insights",
			prompt: `
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
  </rules>
</agent>

Based on the following data, rank and analyze job results:

CV Profile: ${JSON.stringify(args.cvProfile, null, 2)}
Search Parameters: ${JSON.stringify(args.searchParams, null, 2)}
Job Results: ${JSON.stringify(args.jobResults, null, 2)}
            `.trim(),
			schema: z.object({
				ranked_jobs: z.array(
					z.object({
						id: z.string(),
						match_score: z.number().min(0).max(1),
						match_reasons: z.array(z.string()),
						concerns: z.array(z.string()).optional(),
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
				optimized_keywords: args.searchParams?.optimized_keywords || [],
				target_job_titles: args.searchParams?.target_job_titles || [],
				target_companies: args.searchParams?.target_companies || [],
				salary_range: args.searchParams?.salary_range || {
					min: 0,
					max: 100000,
					currency: "USD",
				},
				preferred_job_types: args.searchParams?.preferred_job_types || [],
				locations: args.searchParams?.locations || [],
				search_strategy:
					args.searchParams?.search_strategy || "Default search strategy",
			},
		} as JobSearchResults;
	},
});
