import { internalAction, internalQuery } from "@/_generated/server";
import { internal } from "@/_generated/api";
import { v } from "convex/values";
import type { JobResult } from "@/types/jobs";
import type { Doc } from "@/_generated/dataModel";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

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
		console.log(`DB search: ${allJobsInDb.length} total jobs, query="${args.searchQuery.slice(0, 30)}..."`);

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
			
			console.log(`Text matching with ${searchTerms.length} terms: ${searchTerms.slice(0, 3).join(", ")}...`);
			
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
		return await ctx.db.query("userSurveys").withIndex("by_user", (q) => q.eq("userId", args.userId)).take(1);
	},
});

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
	},
	handler: async (
		ctx,
		args,
	): Promise<{
		jobs: JobResult[];
		totalFound: number;
		searchParams: typeof args.searchParams;
	}> => {
		console.log(
			"Starting job search:",
			`${args.searchParams.technical_skills.length} tech skills,`,
			`${args.searchParams.job_title_keywords.length} job titles,`,
			`${args.cvProfile.years_of_experience}y exp`
		);

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

		console.log(
			"Search strategies:",
			`${searchStrategies.length} terms:`,
			searchStrategies.slice(0, 3).join(", ") + "..."
		);

		const allResults: Doc<"jobListings">[] = [];
		let searchCount = 0;

		// Try each search term individually (better for Convex search)
		for (const searchTerm of searchStrategies) {
			if (searchTerm && searchTerm.trim().length > 2) {
				searchCount++;
				console.log(`[${searchCount}/${searchStrategies.length}] Searching: "${searchTerm.slice(0, 20)}..."`);
				
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
			`Search complete: ${uniqueResults.length} unique jobs from ${allResults.length} total results`
		);

		// Convert database results to JobResult format
		const jobResults: JobResult[] = [];
		console.log("Processing jobs for AI analysis...");
		
		// Prepare job data for batched processing
		const jobsToProcess = uniqueResults.map((job, index) => {
			const jobText = `${job.name} ${job.description} ${job.sourceName || ""}`.toLowerCase();
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

		// Batch AI requests in chunks to avoid overwhelming the API
		const BATCH_SIZE = 10;
		const chunks = [];
		for (let i = 0; i < jobsToProcess.length; i += BATCH_SIZE) {
			chunks.push(jobsToProcess.slice(i, i + BATCH_SIZE));
		}

		console.log(`Processing ${jobsToProcess.length} jobs in ${chunks.length} batches of ${BATCH_SIZE}`);

		// Process each chunk in parallel
		for (const [chunkIndex, chunk] of chunks.entries()) {
			console.log(`Processing batch ${chunkIndex + 1}/${chunks.length} (${chunk.length} jobs)...`);

			// Create promises for all jobs in this chunk
			const batchPromises = chunk.map(async ({ job, index, jobText, matchedSkills, missingSkills }) => {
				const experienceMatchResult = await generateObject({
					model: openai.chat("gpt-4o-mini", {
						structuredOutputs: true,
					}),
					schemaName: "Experience_Match_Analysis",
					messages: [
						{
							role: "system",
							content: `
<agent>
  <name>ExperienceMatchAgent</name>
  <description>
    An AI agent that analyzes job requirements and candidate experience to determine compatibility.
  </description>

  <goals>
    <goal>Evaluate experience level match between job and candidate</goal>
    <goal>Identify any experience gaps or mismatches</goal>
    <goal>Provide specific reasons for the match assessment</goal>
  </goals>

  <rules>
    <rule>Compare years of experience requirements objectively</rule>
    <rule>Consider both direct and transferable experience</rule>
    <rule>Evaluate seniority level compatibility</rule>
    <rule>Provide clear match/mismatch reasoning</rule>
    <rule>Be specific about any experience gaps</rule>
  </rules>
</agent>
								`,
						},
						{
							role: "user",
							content: `
Analyze the experience match between this job listing and candidate profile:

Job Description: ${jobText}

Candidate Profile:
- Years of Experience: ${args.cvProfile.years_of_experience}
- Experience Level: ${args.cvProfile.experience_level}
- Previous Roles: ${args.cvProfile.job_titles.join(", ")}
- Skills: ${args.cvProfile.skills.join(", ")}

Determine if the candidate's experience level matches the job requirements.
								`,
						}
					],
					schema: z.object({
						match_level: z.enum([
							"excellent_match",
							"good_match", 
							"partial_match",
							"mismatch"
						]),
						match_score: z.number().min(0).max(1),
						match_reasons: z.array(z.string()).min(1),
						experience_gaps: z.array(z.string()),
						recommendation: z.string()
					})
				});

				console.log(`AI Experience Match [Job ${index + 1}] - Token usage:`, {
					promptTokens: experienceMatchResult.usage?.promptTokens || 0,
					completionTokens: experienceMatchResult.usage?.completionTokens || 0,
					totalTokens: experienceMatchResult.usage?.totalTokens || 0
				});

				// Check location match
				let locationMatch = "no_location_provided";
				if (args.cvProfile.preferred_locations.length > 0) {
					const jobLocation = (job.location || "").toLowerCase();
					const matchingLocation = args.cvProfile.preferred_locations.some(
						location => jobLocation.includes(location.toLowerCase())
					);
					locationMatch = matchingLocation ? "location_match" : "location_mismatch";
				}

				console.log(`  Job ${index + 1}: "${job.name.slice(0, 30)}..." - ${matchedSkills.length} skills matched, Match: ${experienceMatchResult.object.match_level} (${experienceMatchResult.object.match_score})`);


				// Get survey results
				const surveyResults = await ctx.runQuery(
					internal.jobs.actions.searchJobs.getSurveyResults,
					{ userId: args.userId },
				);

				console.log(`  Survey results: ${surveyResults.length} results`);
				// Extract location match score from survey results using AI
				const locationMatchResult = await generateObject({
					model: openai.chat("gpt-4o-mini", {
						structuredOutputs: true,
					}),
					messages: [
						{
							role: "system",
							content: `
<agent>
  <name>LocationMatchAgent</name>
  <description>
    An AI agent that analyzes location compatibility between job postings and candidate preferences.
  </description>

  <goals>
    <goal>Evaluate location match between job and candidate preferences</goal>
    <goal>Consider remote/hybrid/onsite work type preferences</goal>
    <goal>Calculate accurate location match scores</goal>
    <goal>Provide detailed reasoning for match decisions</goal>
  </goals>

  <rules>
    <rule>Compare job location against candidate's preferred locations</rule>
    <rule>Factor in work type preferences (remote/hybrid/onsite)</rule>
    <rule>Consider commute distance and accessibility</rule>
    <rule>Handle cases with missing location data</rule>
    <rule>Provide specific reasons for match scores</rule>
    <rule>Use standardized location terminology</rule>
  </rules>
</agent>`
						},
						{
							role: "user", 
							content: `
Job Location: ${job.location || "Not specified"}

Candidate Preferences:
- Preferred Locations: ${surveyResults[0]?.locations?.join(", ") || "None specified"}
- Work Type: ${surveyResults[0]?.workType || "Not specified"}
							`
						}
					],
					schema: z.object({
						match_score: z.number().min(0).max(1),
						match_reasons: z.array(z.string()).min(1).describe("Specific reasons for the location match score"),
						work_type_match: z.boolean().describe("Whether the work type (remote/hybrid/onsite) matches preferences")
					})
				});

				console.log(`AI Location Match [Job ${index + 1}] - Token usage:`, {
					promptTokens: locationMatchResult.usage?.promptTokens || 0,
					completionTokens: locationMatchResult.usage?.completionTokens || 0,
					totalTokens: locationMatchResult.usage?.totalTokens || 0
				});

				// Extract benefits from job description using AI
				const benefitsResult = await generateObject({
					model: openai.chat("gpt-4o-mini", {
						structuredOutputs: true,
					}),
					messages: [
						{
							role: "system",
							content: `
<agent>
  <name>BenefitsExtractionAgent</name>
  <description>
    An AI agent that extracts and categorizes employee benefits from job descriptions.
  </description>

  <goals>
    <goal>Identify all mentioned benefits in job descriptions</goal>
    <goal>Categorize benefits into standardized types</goal>
    <goal>Extract specific benefit details when available</goal>
    <goal>Avoid hallucinating benefits not mentioned in the text</goal>
  </goals>

  <rules>
    <rule>Only extract benefits explicitly mentioned in the job description</rule>
    <rule>Use standardized benefit categories</rule>
    <rule>Include specific details like amounts or percentages when mentioned</rule>
    <rule>Group similar benefits together</rule>
    <rule>Return empty array if no benefits are mentioned</rule>
  </rules>
</agent>`
						},
						{
							role: "user",
							content: `
Extract all employee benefits mentioned in this job description:

Job Title: ${job.name}
Job Description: ${job.description}

Extract only the benefits that are explicitly mentioned. Do not infer or add benefits not stated in the text.
							`
						}
					],
					schema: z.object({
						benefits: z.array(z.object({
							category: z.enum([
								"health_insurance",
								"retirement_savings",
								"paid_time_off",
								"flexible_work",
								"professional_development",
								"wellness",
								"financial_perks",
								"transportation",
								"family_support",
								"other"
							]),
							description: z.string().describe("The specific benefit as mentioned in the job description"),
							details: z.string().nullable().describe("Additional details like amounts, percentages, or specifics if mentioned - null if not available")
						})),
						total_benefits_count: z.number().describe("Total number of benefits extracted")
					})
				});

				console.log(`AI Benefits Extraction [Job ${index + 1}] - Token usage:`, {
					promptTokens: benefitsResult.usage?.promptTokens || 0,
					completionTokens: benefitsResult.usage?.completionTokens || 0,
					totalTokens: benefitsResult.usage?.totalTokens || 0
				});

				// Extract job requirements using AI
				const requirementsResult = await generateObject({
					model: openai.chat("gpt-4o-mini", {
						structuredOutputs: true,
					}),
					messages: [
						{
							role: "system",
							content: `
<agent>
  <name>RequirementsExtractionAgent</name>
  <description>
    An AI agent that extracts and standardizes job requirements from job descriptions.
  </description>

  <goals>
    <goal>Identify all explicit job requirements mentioned in job descriptions</goal>
    <goal>Categorize requirements into skills, experience, education, and qualifications</goal>
    <goal>Extract only requirements that are clearly stated, not implied</goal>
    <goal>Format requirements in a clear, readable manner</goal>
  </goals>

  <rules>
    <rule>Only extract requirements explicitly mentioned in the job description</rule>
    <rule>Include years of experience, specific skills, education levels, certifications</rule>
    <rule>Separate "required" from "preferred" qualifications when mentioned</rule>
    <rule>Use clear, concise language for each requirement</rule>
    <rule>Do not hallucinate or infer requirements not stated in the text</rule>
    <rule>Return empty array if no clear requirements are mentioned</rule>
  </rules>
</agent>`
						},
						{
							role: "user",
							content: `
Extract all job requirements mentioned in this job description:

Job Title: ${job.name}
Job Description: ${job.description}

Extract only the requirements that are explicitly mentioned. Focus on:
- Required skills and technologies
- Years of experience needed
- Education requirements
- Certifications or qualifications
- Any specific tools or software mentioned

Do not infer requirements that aren't clearly stated.
							`
						}
					],
					schema: z.object({
						requirements: z.array(z.object({
							type: z.enum([
								"technical_skill",
								"experience",
								"education",
								"certification",
								"soft_skill",
								"tool_software",
								"other"
							]),
							description: z.string().describe("The specific requirement as mentioned in the job description"),
							required: z.boolean().describe("Whether this is a required or preferred qualification"),
							details: z.string().nullable().describe("Additional details or context if mentioned")
						})),
						total_requirements_count: z.number().describe("Total number of requirements extracted")
					})
				});

				console.log(`AI Requirements Extraction [Job ${index + 1}] - Token usage:`, {
					promptTokens: requirementsResult.usage?.promptTokens || 0,
					completionTokens: requirementsResult.usage?.completionTokens || 0,
					totalTokens: requirementsResult.usage?.totalTokens || 0
				});

				return {
					jobListingId: job._id,
					benefits: benefitsResult.object.benefits.map(benefit => 
						benefit.details ? `${benefit.description} (${benefit.details})` : benefit.description
					),
					requirements: requirementsResult.object.requirements.map(req => 
						req.details ? `${req.description} (${req.details})` : req.description
					),
					matchedSkills,
					missingSkills,
					experienceMatch: experienceMatchResult.object.match_level,
					experienceMatchScore: experienceMatchResult.object.match_score,
					experienceMatchReasons: experienceMatchResult.object.match_reasons,
					locationMatchScore: locationMatchResult.object.match_score,
					locationMatchReasons: locationMatchResult.object.match_reasons,
					locationMatch,
					workTypeMatch: locationMatchResult.object.work_type_match
				};
			});

			// Wait for all jobs in this batch to complete
			const batchResults = await Promise.all(batchPromises);
			jobResults.push(...batchResults);
			
			console.log(`Batch ${chunkIndex + 1} completed. Total processed: ${jobResults.length}/${jobsToProcess.length}`);
		}

		const finalResults = jobResults.slice(0, 20);
		console.log(
			`Returning ${finalResults.length} jobs:`,
			`avg score: ${(finalResults.reduce((sum, job) => sum + job.experienceMatchScore, 0) / finalResults.length).toFixed(2)}`
		);

		return {
			jobs: finalResults,
			totalFound: jobResults.length,
			searchParams: args.searchParams,
		};
	},
});
