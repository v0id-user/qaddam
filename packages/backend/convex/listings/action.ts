"use node"; // Actions only can use nodejs

import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import JobSearchEngine from "../driver/jobs/driver";
import type { MinimalLinkedInJob, MinimalIndeedJob } from "../types/job_types";
import { LinkedInJobsActor, type LinkedInJobsInput } from "../driver/jobs/actors/linkedin_jobs";
import { IndeedJobsActor, type IndeedJobsInput } from "../driver/jobs/actors/indeed_jobs";
import { v } from "convex/values";

// Generic crawler factory
async function runCrawler<TInput, TResult>(
	ActorClass: new (apifyDriver: any) => any,
	input: TInput,
	cost: string
): Promise<TResult[]> {
	const jobSearch = new JobSearchEngine(ActorClass);
	return await jobSearch.runAndGetResults(input);
}

// LinkedIn crawler configuration
const createLinkedInInput = (keywords: string[], countries: string[]): LinkedInJobsInput => {
	const searchUrl = new URL("https://www.linkedin.com/jobs/search/");
	keywords.forEach((word) => {
		searchUrl.searchParams.set("keywords", word);
	});
	countries.forEach((country) => {
		searchUrl.searchParams.set("location", country);
	});
	searchUrl.searchParams.set("trk", "public_jobs_jobs-search-bar_search-submit");
	searchUrl.searchParams.set("position", "1");
	searchUrl.searchParams.set("pageNum", "0");
	
	return {
		urls: [searchUrl.toString()],
		countryCode: 10,
		scrapeCompany: true,
		count: 100, // Cost: ~$0.10 for 100 jobs
	};
};

// Indeed crawler configuration
const createIndeedInput = (): IndeedJobsInput => ({
	country: "US",
	followApplyRedirects: false,
	location: "San Francisco",
	maxItems: 50, // Cost: ~$0.25 for 50 jobs (100 jobs = ~$0.50)
	parseCompanyDetails: true,
	position: "software engineer", // TODO: Make this dynamic based on keywords from user survey
	saveOnlyUniqueItems: true,
});

// --- LinkedIn Crawler ---
async function runLinkedInCrawler(keywords: string[], countries: string[]) {
	const input = createLinkedInInput(keywords, countries);
	return await runCrawler(LinkedInJobsActor, input, "~$0.10 for 100 jobs");
}

// --- Indeed Crawler ---
async function runIndeedCrawler() {
	const input = createIndeedInput();
	return await runCrawler(IndeedJobsActor, input, "~$0.25 for 50 jobs");
}

export const addNewJobsListingAction = internalAction({
	args: {
		userId: v.optional(v.id("users")),
	},
	handler: async (ctx, args) => {
		let keywords: string[] = [];
		let countries: string[] = [];

		if (args.userId) {
			// TODO: this must be fine tuned to something better, or using AI to fine tune search keywords, but keep it simple for now
			const survey = await ctx.runQuery(api.surveys.getUserSurvey, {
				userId: args.userId,
			});

			if (!survey) {
				throw new Error("User survey not found");
			}

			survey.jobTitles.forEach((keyword) => {
				keywords.push(keyword + " " + survey.workType);
			});

			survey.skills.forEach((skill) => {
				keywords.push(skill + " " + survey.workType);
			});

			survey.locations.forEach((location) => {
				countries.push(location);
			});
		} else {
			keywords = [
				"software engineer",
				"frontend developer",
				"backend developer",
				"full stack developer",
				"data scientist",
				"machine learning engineer",
				"devops engineer",
				"product manager",
				"project manager",
				"QA engineer",
				"mobile developer",
				"cloud engineer",
			];
			countries = [
				"United States",
				"Saudi Arabia",
				"Canada",
				"United Kingdom",
				"Germany",
				"France",
				"United Arab Emirates",
				"India",
				"Australia",
				"Netherlands",
			];
		}

		// --- Run all crawlers in parallel ---
		const [linkedInJobSearchResults, indeedJobSearchResults] = await Promise.all([
			runLinkedInCrawler(keywords, countries),
			runIndeedCrawler(),
		]);

		// --------------------
		// Normalize crawler outputs into a discriminated-union payload so the mutation
		// doesn't have to spend time guessing what each item is.
		// --------------------

		// console.log("LinkedIn raw results:", JSON.stringify(linkedInJobSearchResults, null, 2));

		const linkedInJobs: MinimalLinkedInJob[] = (linkedInJobSearchResults as any[]).flatMap(
			(r) => {
				console.log("Processing LinkedIn result item:", {
					hasLinkedInJobs: "linkedInJobs" in r,
					isArray: "linkedInJobs" in r ? Array.isArray(r.linkedInJobs) : false,
					length: "linkedInJobs" in r && Array.isArray(r.linkedInJobs) ? r.linkedInJobs.length : 0,
					keys: Object.keys(r || {})
				});
				
				if ("linkedInJobs" in r && Array.isArray(r.linkedInJobs)) {
					// The crawler returns LinkedInJob objects which now match MinimalLinkedInJob structure
					return r.linkedInJobs as MinimalLinkedInJob[];
				}
				return [];
			},
		);

		console.log(`Found ${linkedInJobs.length} LinkedIn jobs`);

		const indeedJobs: MinimalIndeedJob[] = (indeedJobSearchResults as any[]).flatMap((r) => {
			if ("indeedJobs" in r && Array.isArray(r.indeedJobs)) {
				// The crawler returns IndeedJob objects which now match MinimalIndeedJob structure
				return r.indeedJobs as MinimalIndeedJob[];
			}
			return [];
		});

		console.log(`Found ${indeedJobs.length} Indeed jobs`);

		const combinedResults = [
			{ source: "linkedIn" as const, jobs: linkedInJobs },
			{ source: "indeed" as const, jobs: indeedJobs },
		];

		// Send discriminated payload to mutation
		await ctx.runMutation(internal.listings.mutation.addNewJobsListing, {
			jobSearchResults: combinedResults,
		});
	},
});
