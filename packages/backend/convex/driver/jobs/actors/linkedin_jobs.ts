"use node";

import { ApifyDriver } from "../../apify";
import type { ActorRun } from "apify-client";
import type { JobSource } from "../types/job_source";
import type { JobSearchInput } from "../driver";
import { BaseJobSearchActor } from "./index";

/*
 * LinkedIn Jobs Actor
 *
 * Inputs:
 * - urls: string[]
 * - countryCode: number
 * - scrapeCompany: boolean
 * - count: number
 **/

export interface LinkedInJobsInput extends JobSearchInput {
	urls: string[];
	countryCode: number;
	scrapeCompany: boolean;
	count: number;
}

/**
 * LinkedIn Job
 *
 * This is the type of the job object that is returned by the LinkedIn Jobs Actor.
 **/
export interface LinkedInJob {
	id: string;
	link: string;
	title: string;
	companyName: string;
	companyLinkedinUrl: string;
	companyLogo?: string;
	location: string;
	salaryInfo?: string[];
	postedAt?: string;
	benefits?: string[];
	descriptionHtml: string;
	descriptionText: string;
	applicantsCount?: string;
	applyUrl?: string;
	jobPosterName?: string;
	jobPosterTitle?: string;
	jobPosterPhoto?: string;
	jobPosterProfileUrl?: string;
	seniorityLevel?: string;
	employmentType?: string;
	jobFunction?: string;
	industries?: string;
	companyDescription?: string;
	companyWebsite?: string;
	companyEmployeesCount?: number;
	// Additional fields that may appear in the data
	companyAddress?: {
		addressCountry?: string;
		addressLocality?: string;
		addressRegion?: string;
		postalCode?: string;
		streetAddress?: string;
		type?: string;
	};
	companySlogan?: string;
	inputUrl?: string;
	refId?: string;
	trackingId?: string;
}

export interface LinkedInJobsResult {
	linkedInJobs: LinkedInJob[];
}

export class LinkedInJobsActor extends BaseJobSearchActor<LinkedInJobsInput, LinkedInJobsResult> {
	protected readonly actorId = "hKByXkMQaC5Qt9UMN";
	protected readonly jobSource: JobSource = {
		source: "linked-in",
		searchUrl: "https://www.linkedin.com/jobs/search/?keywords={query}",
	};

	constructor(apifyDriver: ApifyDriver) {
		super(apifyDriver, "hKByXkMQaC5Qt9UMN");
	}

	async search(input: LinkedInJobsInput): Promise<ActorRun> {
		const jobInput = {
			urls: input.urls,
			countryCode: input.countryCode,
			scrapeCompany: input.scrapeCompany,
			count: input.count,
		};

		return await this.call(jobInput);
	}

	async getResults(run: ActorRun): Promise<LinkedInJobsResult[]> {
		const client = this.getClient();
		const { items } = await client.dataset(run.defaultDatasetId).listItems();
		// The actor returns an array of job objects, so we wrap it in the expected result shape
		return [
			{
				linkedInJobs: items as unknown as LinkedInJob[],
			},
		];
	}
}
