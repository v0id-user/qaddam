import { internalAction, internalQuery } from "@/_generated/server";
import { internal } from "@/_generated/api";
import { v } from "convex/values";
import type { JobResult } from "@/types/jobs";
import type { Doc } from "@/_generated/dataModel";

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
		console.log(`Searching for: "${args.searchQuery}"`);

		// Search in job descriptions - following Convex docs exactly
		const descriptionResults = await ctx.db
			.query("jobListings")
			.withSearchIndex("search_description", (q) =>
				q.search("description", args.searchQuery),
			)
			.take(50);

		console.log(`Description search found: ${descriptionResults.length} results`);

		// Search in job names/titles - following Convex docs exactly
		const nameResults = await ctx.db
			.query("jobListings")
			.withSearchIndex("search_name", (q) => 
				q.search("name", args.searchQuery)
			)
			.take(50);

		console.log(`Name search found: ${nameResults.length} results`);

		// Combine and deduplicate results
		const allResults = [...descriptionResults, ...nameResults];
		const uniqueResults = allResults.filter(
			(job, index, self) => index === self.findIndex((j) => j._id === job._id),
		);

		console.log(`Total unique results: ${uniqueResults.length}`);

		// If no results from search indexes, try simple text matching
		if (uniqueResults.length === 0) {
			console.log("No search results found, trying simple text matching...");
			const allJobs = await ctx.db.query("jobListings").take(100);
			console.log(`Found ${allJobs.length} total jobs in database`);
			
			// Filter jobs that contain any of the search terms (case insensitive)
			const searchTerms = args.searchQuery.toLowerCase().split(' ').filter(term => term.length > 2);
			const filteredJobs = allJobs.filter((job) => {
				const jobText = `${job.name} ${job.description} ${job.sourceName || ''} ${job.location || ''}`.toLowerCase();
				return searchTerms.some(term => jobText.includes(term));
			});
			
			console.log(`Filtered jobs: ${filteredJobs.length}`);
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
		console.log("Starting job search...");

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

		console.log("Search strategies:", searchStrategies);

		const allResults: Doc<"jobListings">[] = [];
		
		// Try each search term individually (better for Convex search)
		for (const searchTerm of searchStrategies) {
			if (searchTerm && searchTerm.trim().length > 2) {
				console.log(`Searching for individual term: "${searchTerm}"`);
				const results = await ctx.runQuery(
					internal.jobs.actions.searchJobs.searchJobListings,
					{ searchQuery: searchTerm.trim() }
				);
				allResults.push(...results);
			}
		}

		// Remove duplicates
		const uniqueResults = allResults.filter(
			(job, index, self) => index === self.findIndex((j) => j._id === job._id)
		);

		console.log(`Found ${uniqueResults.length} unique job results`);

		// Convert database results to JobResult format
		const jobs: JobResult[] = uniqueResults.map(
			(job: Doc<"jobListings">, index: number) => {
				// Calculate match score based on keyword presence
				const jobText = `${job.name} ${job.description} ${job.sourceName || ''}`.toLowerCase();
				const matchedSkills = searchParams.technical_skills.filter((skill) =>
					jobText.includes(skill.toLowerCase()),
				);
				const matchedTitles = searchParams.job_title_keywords.filter((title) =>
					jobText.includes(title.toLowerCase()),
				);
				const matchedKeywords = searchParams.primary_keywords.filter((keyword) =>
					jobText.includes(keyword.toLowerCase()),
				);

				// Enhanced match score calculation
				const skillMatchRatio = matchedSkills.length / Math.max(searchParams.technical_skills.length, 1);
				const titleMatchRatio = matchedTitles.length / Math.max(searchParams.job_title_keywords.length, 1);
				const keywordMatchRatio = matchedKeywords.length / Math.max(searchParams.primary_keywords.length, 1);
				
				const matchScore = Math.round(
					(skillMatchRatio * 40 + titleMatchRatio * 30 + keywordMatchRatio * 30) * 100
				);

				return {
					id: job._id,
					title: job.name,
					company: job.sourceName || "Unknown Company",
					location: job.location || job.sourceLocation || "Remote",
					description: job.description,
					requirements: [], // Extract from description if needed
					salary: job.salary
						? `${job.salary} ${job.currency || "USD"}`
						: "Salary not specified",
					type: "full_time", // Default, could be extracted from description
					remote: job.location?.toLowerCase().includes("remote") || false,
					url: job.sourceUrl || "",
					postedDate: job.datePosted
						? new Date(job.datePosted).toISOString()
						: new Date().toISOString(),
					matchScore: Math.max(matchScore, 30), // Minimum 30% match
					benefits: [], // Could be extracted from description
					matchedSkills,
					missingSkills: searchParams.technical_skills.filter(
						(skill) => !matchedSkills.includes(skill),
					),
					experienceMatch: "Experience match analysis needed",
					locationMatch: "Location analysis needed",
				};
			},
		);

		// Sort by match score (descending)
		jobs.sort((a, b) => b.matchScore - a.matchScore);

		console.log(`Returning ${jobs.length} processed jobs`);

		return {
			jobs: jobs.slice(0, 20), // Limit to top 20 results
			totalFound: jobs.length,
			searchParams: args.searchParams,
		};
	},
});
