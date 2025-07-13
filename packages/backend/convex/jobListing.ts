"use node";

import JobSearchEngine from "./driver/jobs/driver";
import { LinkedInJobsActor } from "./driver/jobs/actors/linkedin_jobs";
import { internalMutation } from "./_generated/server";

export const addNewJobsListing = internalMutation({
	args: {},
	handler: async (ctx) => {
		const jobSearch = new JobSearchEngine(LinkedInJobsActor);
		const jobSearchResults = await jobSearch.runAndGetResults({
			urls: [
				"https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=United%20States&geoId=90009590&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0",
			],
			countryCode: 1,
			scrapeCompany: true,
			count: 10,
		});
		console.log(jobSearchResults);
	},
});
