"use node"; // Actions only can use nodejs

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import JobSearchEngine from "../driver/jobs/driver";
import { LinkedInJobsActor } from "../driver/jobs/actors/linkedin_jobs";


export const addNewJobsListingAction = internalAction({
    handler: async (ctx) => {
        
        // Run search
        const jobSearch = new JobSearchEngine(LinkedInJobsActor);
        const searchUrl = new URL("https://www.linkedin.com/jobs/search/");
        searchUrl.searchParams.set("keywords", "software engineer"); // TODO: make this dynamic
        searchUrl.searchParams.set("location", "United States"); // TODO: make this dynamic
        searchUrl.searchParams.set("geoId", "90009590");
        searchUrl.searchParams.set("trk", "public_jobs_jobs-search-bar_search-submit");
        searchUrl.searchParams.set("position", "1");
        searchUrl.searchParams.set("pageNum", "0");

        const jobSearchResults = await jobSearch.runAndGetResults({
            urls: [searchUrl.toString()],
            countryCode: 1,
            scrapeCompany: true,
            count: 10,
        });
        
        // Pass results to mutation and return inserted IDs
        await ctx.runMutation(
            internal.listings.mutation.addNewJobsListing,
            {
                jobSearchResults,
            },
        );

    },
});


