"use node"; // Actions only can use nodejs

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import JobSearchEngine from "../driver/jobs/driver";
import { LinkedInJobsActor } from "../driver/jobs/actors/linkedin_jobs";

export const addNewJobsListingAction = internalAction({
	handler: async (ctx) => {
        // TODO: This is bad, not much personalized, find another way for it 
        const keywords = ['software engineer']
        const countries = ['United States', 'Saudi Arabia']

		// Run search
		const jobSearch = new JobSearchEngine(LinkedInJobsActor);
		const searchUrl = new URL("https://www.linkedin.com/jobs/search/");
        
        keywords.forEach(word => {
            searchUrl.searchParams.set("keywords", word);
        });
        countries.forEach(country => {
            searchUrl.searchParams.set("location", country);
        })
		searchUrl.searchParams.set("geoId", "90009590"); // > ????????
		searchUrl.searchParams.set(
			"trk",
			"public_jobs_jobs-search-bar_search-submit",
		);// > ??????????

		searchUrl.searchParams.set("position", "1");
		searchUrl.searchParams.set("pageNum", "0");

		const jobSearchResults = await jobSearch.runAndGetResults({
			urls: [searchUrl.toString()],
			countryCode: 1,
			scrapeCompany: true,
			count: 100, // At least 100 which they cost around ~ $0.10
		});

		// Pass results to mutation and return inserted IDs
		await ctx.runMutation(internal.listings.mutation.addNewJobsListing, {
			jobSearchResults,
		});
	},
});
