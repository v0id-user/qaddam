import { internalAction, internalQuery } from "@/_generated/server";
import { internal } from "@/_generated/api";
import { v } from "convex/values";
import type { JobResult } from "@/types/jobs";
import type { Doc } from "@/_generated/dataModel";

// Internal query to search the database
export const searchJobListings = internalQuery({
	args: {
		searchQuery: v.string(),
	},
	handler: async (ctx, args): Promise<Doc<"jobListings">[]> => {
		// Search in job descriptions
		const descriptionResults = await ctx.db
			.query("jobListings")
			.withSearchIndex("search_description", (q) =>
				q.search("description", args.searchQuery)
			)
			.take(50);

		// Search in job names/titles  
		const nameResults = await ctx.db
			.query("jobListings")
			.withSearchIndex("search_name", (q) =>
				q.search("name", args.searchQuery)
			)
			.take(50);

		// Combine and deduplicate results
		const allResults = [...descriptionResults, ...nameResults];
		const uniqueResults = allResults.filter((job, index, self) =>
			index === self.findIndex(j => j._id === job._id)
		);

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
		cvProfile: v.string(), // Original profile from step 1
	},
	handler: async (ctx, args): Promise<{
		jobs: JobResult[];
		totalFound: number;
		searchParams: typeof args.searchParams;
	}> => {
		const { searchParams } = args;
		const allSearchTerms = [
			...searchParams.primary_keywords,
			...searchParams.search_terms,
			...searchParams.job_title_keywords,
			...searchParams.technical_skills,
		];

		if (allSearchTerms.length === 0) {
			return {
				jobs: [],
				totalFound: 0,
				searchParams,
			};
		}

		// Create search query combining multiple terms
		const searchQuery = allSearchTerms.slice(0, 8).join(" "); // Limit to 8 terms for Convex

		// Call the internal query to search the database
		const uniqueResults = await ctx.runQuery(internal.jobs.actions.searchJobs.searchJobListings, {
			searchQuery,
		});

		// Convert database results to JobResult format and add matching logic
		const jobs: JobResult[] = uniqueResults.map((job: Doc<"jobListings">, index: number) => {
			// Calculate basic match score based on keyword presence
			const jobText = `${job.name} ${job.description}`.toLowerCase();
			const matchedSkills = searchParams.technical_skills.filter(skill =>
				jobText.includes(skill.toLowerCase())
			);
			const matchedTitles = searchParams.job_title_keywords.filter(title =>
				jobText.includes(title.toLowerCase())
			);
			
			// Calculate match score (0-100)
			const skillMatchRatio = matchedSkills.length / Math.max(searchParams.technical_skills.length, 1);
			const titleMatchRatio = matchedTitles.length / Math.max(searchParams.job_title_keywords.length, 1);
			const matchScore = Math.round((skillMatchRatio * 60 + titleMatchRatio * 40) * 100);

			return {
				id: job._id,
				title: job.name,
				company: job.sourceName || "Unknown Company",
				location: job.location || job.sourceLocation || "Remote",
				description: job.description,
				requirements: [], // Extract from description if needed
				salary: job.salary ? `${job.salary} ${job.currency || "USD"}` : "Salary not specified",
				type: "full_time", // Default, could be extracted from description
				remote: job.location?.toLowerCase().includes("remote") || false,
				url: job.sourceUrl || "",
				postedDate: job.datePosted ? new Date(job.datePosted).toISOString() : new Date().toISOString(),
				matchScore: Math.max(matchScore, 50 + (50 - index)), // Ensure relevance order
				benefits: [], // Could be extracted from description
				matchedSkills,
				missingSkills: searchParams.technical_skills.filter(skill => 
					!matchedSkills.includes(skill)
				),
				experienceMatch: "Experience match analysis needed",
				locationMatch: "Location analysis needed",
			};
		});

		// Sort by match score (descending)
		jobs.sort((a, b) => b.matchScore - a.matchScore);

		return {
			jobs: jobs.slice(0, 20), // Limit to top 20 results
			totalFound: jobs.length,
			searchParams,
		};
	},
});
