"use node"; // Actions only can use nodejs

import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import JobSearchEngine from "../driver/jobs/driver";
import { LinkedInJobsActor } from "../driver/jobs/actors/linkedin_jobs";
import { v } from "convex/values";

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

		// Run search
		const jobSearch = new JobSearchEngine(LinkedInJobsActor);
		const searchUrl = new URL("https://www.linkedin.com/jobs/search/");

		keywords.forEach((word) => {
			searchUrl.searchParams.set("keywords", word);
		});
		countries.forEach((country) => {
			searchUrl.searchParams.set("location", country);
		});
		searchUrl.searchParams.set(
			"trk",
			"public_jobs_jobs-search-bar_search-submit",
		); // > ??????????

		searchUrl.searchParams.set("position", "1");
		searchUrl.searchParams.set("pageNum", "0");

		const jobSearchResults = await jobSearch.runAndGetResults({
			urls: [searchUrl.toString()],
			countryCode: 10,
			scrapeCompany: true,
			count: 100, // At least 100 which they cost around ~ $0.10
		});

		// Pass results to mutation and return inserted IDs
		await ctx.runMutation(internal.listings.mutation.addNewJobsListing, {
			jobSearchResults,
		});
	},
});
