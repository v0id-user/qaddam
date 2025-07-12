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

// Step 3: Search with the AI keywords
export const aiSearchJobs = internalAction({
	args: {
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
		
		for (const [index, job] of uniqueResults.entries()) {
			if (index % 5 === 0) {
				console.log(`Processing job ${index + 1}/${uniqueResults.length}...`);
			}

			// Calculate match score based on keyword presence
			const jobText =
				`${job.name} ${job.description} ${job.sourceName || ""}`.toLowerCase();
			const matchedSkills = searchParams.technical_skills.filter((skill) =>
				jobText.includes(skill.toLowerCase()),
			);

			console.log(`  Job ${index + 1}: "${job.name.slice(0, 30)}..." - ${matchedSkills.length} skills matched`);

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

			// Check location match
			let locationMatch = "no_location_provided";
			if (args.cvProfile.preferred_locations.length > 0) {
				const jobLocation = (job.location || "").toLowerCase();
				const matchingLocation = args.cvProfile.preferred_locations.some(
					location => jobLocation.includes(location.toLowerCase())
				);
				locationMatch = matchingLocation ? "location_match" : "location_mismatch";
			}

			console.log(`  → Match: ${experienceMatchResult.object.match_level} (${experienceMatchResult.object.match_score}), Location: ${locationMatch}`);

			jobResults.push({
				jobListingId: job._id,
				benefits: [], // Could be extracted from description
				matchedSkills,
				missingSkills: searchParams.technical_skills.filter(
					(skill) => !matchedSkills.includes(skill),
				),
				experienceMatch: experienceMatchResult.object.match_level,
				experienceMatchScore: experienceMatchResult.object.match_score,
				experienceMatchReasons: experienceMatchResult.object.match_reasons,

				// TODO: Fill and fix this from the survey
				locationMatchScore: 0,
				locationMatchReasons: [],
				locationMatch
			});
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
