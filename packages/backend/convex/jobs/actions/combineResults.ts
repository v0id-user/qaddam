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
	},
	handler: async (ctx, args): Promise<JobSearchResults> => {
		console.log(
			"Starting job ranking:",
			`${args.jobResults.jobs.length} jobs,`,
			`${args.searchParams.primary_keywords.length} primary keywords,`,
			`${args.cvProfile.skills.length} skills`
		);

		// If no jobs found, return empty results with default insights
		if (!args.jobResults.jobs || args.jobResults.jobs.length === 0) {
			console.log("No jobs found, returning empty results");
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

		const originalJobs = args.jobResults.jobs;
		console.log("Processing original job results...");

		// Extract additional information from job results using AI
		console.log("Extracting salary, company, and job type information...");
		
		// Batch AI requests in chunks to avoid overwhelming the API
		const BATCH_SIZE = 10;
		const jobChunks = [];
		for (let i = 0; i < originalJobs.length; i += BATCH_SIZE) {
			jobChunks.push(originalJobs.slice(i, i + BATCH_SIZE));
		}

		console.log(`Processing ${originalJobs.length} jobs in ${jobChunks.length} batches for data extraction`);

		const extractedData = {
			salaries: [] as Array<{min: number; max: number; currency: string}>,
			companies: [] as string[],
			jobTypes: [] as string[],
		};

		// Process each chunk
		for (const [chunkIndex, chunk] of jobChunks.entries()) {
			console.log(`Processing extraction batch ${chunkIndex + 1}/${jobChunks.length} (${chunk.length} jobs)...`);

			const batchPromises = chunk.map(async (job: JobResult) => {
				// Get job listing details - we need to query the database for the actual job data
				const jobListing = await ctx.runQuery(
					internal.jobs.actions.combineResults.getJobListing,
					{ jobListingId: job.jobListingId }
				);
				if (!jobListing) return null;

				// Extract salary, company, and job type information
				const extractionResult = await generateObject({
					model: openai.chat("gpt-4o-mini", {
						structuredOutputs: true,
					}),
					schemaName: "Job_Data_Extraction",
					messages: [
						{
							role: "system",
							content: `
<agent>
  <name>JobDataExtractionAgent</name>
  <description>
    An AI agent that extracts structured data from job listings including salary, company names, and job types.
  </description>

  <goals>
    <goal>Extract salary information when mentioned in job descriptions</goal>
    <goal>Identify company names from job listings</goal>
    <goal>Determine job types (full_time, part_time, contract, remote)</goal>
    <goal>Handle missing information gracefully</goal>
  </goals>

  <rules>
    <rule>Only extract salary information explicitly mentioned in the job description</rule>
    <rule>Convert salary ranges to standardized format</rule>
    <rule>Identify company names from job source or description</rule>
    <rule>Classify job types based on description and requirements</rule>
    <rule>Use null/empty values for missing information</rule>
    <rule>Be conservative - don't hallucinate information not present</rule>
  </rules>
</agent>
							`,
						},
						{
							role: "user",
							content: `
Extract salary, company, and job type information from this job listing:

Job Title: ${jobListing.name}
Job Description: ${jobListing.description}
Source: ${jobListing.sourceName || "Unknown"}
Company: ${jobListing.sourceName || "Not specified"}
Location: ${jobListing.location || "Not specified"}

Extract only information that is explicitly mentioned. Do not infer or estimate values.
							`,
						},
					],
					schema: z.object({
						salary: z.object({
							min: z.number().nullable().describe("Minimum salary mentioned, null if not specified"),
							max: z.number().nullable().describe("Maximum salary mentioned, null if not specified"),
							currency: z.string().nullable().describe("Currency mentioned, null if not specified"),
							is_salary_mentioned: z.boolean().describe("Whether any salary information was found")
						}),
						company: z.object({
							name: z.string().nullable().describe("Company name if mentioned, null if not found"),
							is_company_mentioned: z.boolean().describe("Whether company name was found")
						}),
						job_type: z.object({
							type: z.enum(["full_time", "part_time", "contract", "remote"]).nullable().describe("Primary job type, null if cannot be determined"),
							is_remote: z.boolean().describe("Whether job mentions remote work"),
							work_arrangement: z.string().nullable().describe("Work arrangement details if mentioned, null if not specified")
						})
					})
				});

				console.log(`AI Data Extraction [Job ${job.jobListingId}] - Token usage:`, {
					promptTokens: extractionResult.usage?.promptTokens || 0,
					completionTokens: extractionResult.usage?.completionTokens || 0,
					totalTokens: extractionResult.usage?.totalTokens || 0
				});

				return {
					jobId: job.jobListingId,
					extraction: extractionResult.object
				};
			});

			// Wait for all jobs in this batch to complete
			const batchResults = await Promise.all(batchPromises);
			
			// Collect the extracted data
			for (const result of batchResults) {
				if (result?.extraction) {
					const { salary, company, job_type } = result.extraction;
					
					if (salary.is_salary_mentioned && salary.min !== null && salary.max !== null) {
						extractedData.salaries.push({
							min: salary.min,
							max: salary.max,
							currency: salary.currency || "USD"
						});
					}
					
					if (company.is_company_mentioned && company.name) {
						extractedData.companies.push(company.name);
					}
					
					if (job_type.type) {
						extractedData.jobTypes.push(job_type.type);
					}
				}
			}
			
			console.log(`Extraction batch ${chunkIndex + 1} completed.`);
		}

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

		// TODO: This is made with an AI model for now, later make it manually with accuracy or keep it as is
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
