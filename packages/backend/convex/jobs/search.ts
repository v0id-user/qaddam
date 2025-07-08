import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal, api } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { JobResult, JobSearchResults } from "../types/jobs";
import { generateObject } from "ai";


export const workflow = new WorkflowManager(components.workflow);

// Step 1: Parse CV and extract user profile
export const aiParseCV = internalAction({
	args: {
		cv_storage_id: v.id("_storage"),
		userId: v.optional(v.id("users")),
	},
	handler: async (ctx, args): Promise<any> => {
		const { cv_storage_id } = args;
		const cv = await ctx.storage.getUrl(cv_storage_id);

		if (!cv) {
			throw new Error("CV file not found in storage");
		}

		const response = await generateObject({
			model: openai.chat("gpt-4o-mini", {
				structuredOutputs: true,
			}),
			schemaName: "Job Search keywords From CV",
			prompt: `
<agent>
  <name>JobSearchProfileAgent</name>
  <description>
    An AI agent that parses CVs and extracts structured job search profiles for automated job discovery.
  </description>

  <goals>
    <goal>Extract key information from CV: skills, experience, education, job titles, industries</goal>
    <goal>Infer job search preferences and suitable job types based on CV content</goal>
    <goal>Generate structured profile data for job search algorithms</goal>
    <goal>Support multilingual CVs (English + Arabic)</goal>
  </goals>

  <rules>
    <rule>Extract concrete skills, technologies, and experience levels from CV text</rule>
    <rule>Infer suitable job titles and industries based on background</rule>
    <rule>Determine experience level: entry-level, mid-level, senior, executive</rule>
    <rule>Identify location preferences if mentioned</rule>
    <rule>Generate relevant keywords for job searching</rule>
    <rule>Output structured JSON data that can be consumed by search algorithms</rule>
  </rules>
</agent>
            `.trim(),
			schema: z.object({
				skills: z.array(z.string()),
				experience_level: z.enum(["entry", "mid", "senior", "executive"]),
				job_titles: z.array(z.string()),
				industries: z.array(z.string()),
				keywords: z.array(z.string()),
				education: z.string(),
				years_of_experience: z.number(),
				preferred_locations: z.array(z.string()),
			}),
			messages: [
				{
					role: "user",
					content: "",
					experimental_attachments: [
						{
							name: "cv.pdf",
							contentType: "application/pdf",
							url: cv,
						},
					],
				},
			],
		});

		return response.object;
	},
});

// Step 2: Job search tuning based on user preferences and CV
// See jobSearchNode.ts for the actual implementation

// Step 3: Search for jobs using optimized parameters
export const aiSearchJobs = internalAction({
	args: {
		searchParams: v.any(), // Tuned parameters from step 2
		cvProfile: v.any(), // Original profile from step 1
	},
	handler: async (ctx, args): Promise<any> => {
		// This would integrate with actual job boards APIs
		// For now, returning mock data that matches the expected structure

		const mockJobs: JobResult[] = [
			{
				id: "job-1",
				title: "Senior Frontend Developer",
				company: "TechCorp",
				location: "Riyadh, Saudi Arabia",
				description:
					"We are looking for a skilled Frontend Developer to join our team...",
				requirements: ["React", "TypeScript", "CSS", "JavaScript"],
				salary: "15000-25000 SAR",
				type: "full_time",
				remote: true,
				url: "https://techcorp.com/jobs/frontend-dev",
				postedDate: new Date().toISOString(),
				matchScore: 95,
				benefits: [
					"Health Insurance",
					"Remote Work",
					"Professional Development",
				],
				matchedSkills: ["React", "TypeScript", "JavaScript"],
				missingSkills: ["Next.js", "TailwindCSS"],
				experienceMatch: "Perfect match - 5+ years required",
				locationMatch: "Same city preferred",
			},
			{
				id: "job-2",
				title: "Full Stack Engineer",
				company: "StartupXYZ",
				location: "Dubai, UAE",
				description:
					"Join our fast-growing startup as a Full Stack Engineer...",
				requirements: ["Node.js", "React", "MongoDB", "AWS"],
				salary: "12000-20000 AED",
				type: "full_time",
				remote: false,
				url: "https://startupxyz.com/careers/fullstack",
				postedDate: new Date().toISOString(),
				matchScore: 87,
				benefits: ["Flexible Hours", "Stock Options", "Learning Budget"],
				matchedSkills: ["Node.js", "React", "MongoDB"],
				missingSkills: ["AWS", "GraphQL"],
				experienceMatch: "Good match - 3+ years required",
				locationMatch: "Different country - visa support available",
			},
			{
				id: "job-3",
				title: "Backend Developer",
				company: "Enterprise Solutions",
				location: "Jeddah, Saudi Arabia",
				description: "Looking for an experienced Backend Developer...",
				requirements: ["Python", "Django", "PostgreSQL", "Docker"],
				salary: "18000-28000 SAR",
				type: "full_time",
				remote: true,
				url: "https://enterprise.com/jobs/backend",
				postedDate: new Date().toISOString(),
				matchScore: 82,
				benefits: ["Health Insurance", "Annual Bonus", "Training Programs"],
				matchedSkills: ["Python", "PostgreSQL"],
				missingSkills: ["Django", "Docker", "Redis"],
				experienceMatch: "Good match - 3+ years required",
				locationMatch: "Different city - relocation possible",
			},
		];

		// TODO: Implement actual job board scraping/API calls
		// - LinkedIn Jobs API
		// - Indeed API
		// - Local job boards (Bayt, GulfTalent, etc.)
		// - Company career pages

		return {
			jobs: mockJobs,
			totalFound: mockJobs.length,
			searchParams: args.searchParams,
		};
	},
});

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

// Main workflow that orchestrates all steps
export const jobSearchWorkflow = workflow.define({
	args: {
		cv_storage_id: v.id("_storage"),
		userId: v.optional(v.id("users")),
	},
	handler: async (step, args): Promise<JobSearchResults> => {
		// Step 1: Parse CV and extract profile
		const cvProfile = await step.runAction(internal.jobs.search.aiParseCV, {
			cv_storage_id: args.cv_storage_id,
			userId: args.userId,
		});

		// Step 2: Tune job search parameters
		const searchParams = await step.runAction(
			internal.jobs.searchNode.aiTuneJobSearch,
			{
				cvProfile,
				userId: args.userId,
			},
		);

		// Step 3: Search for jobs
		const jobResults = await step.runAction(internal.jobs.search.aiSearchJobs, {
			searchParams,
			cvProfile,
		});

		// Step 4: Combine and rank results
		const finalResults = await step.runAction(
			internal.jobs.search.aiCombineJobResults,
			{
				jobResults,
				cvProfile,
				searchParams,
			},
		);

		return finalResults;
	},
});
