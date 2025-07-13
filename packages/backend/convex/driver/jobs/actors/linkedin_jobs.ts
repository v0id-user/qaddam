"use node";

import { ApifyDriver } from "../../apify";
import { Actor } from "../../apify/actors";
import type { ActorRun } from "apify-client";
import type { JobSource } from "../types/job_source";
import type { JobSearchActor, JobSearchInput } from "../driver";

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

export class LinkedInJobsActor
	extends Actor
	implements JobSearchActor<LinkedInJobsInput, LinkedInJobsResult>
{
	private static readonly ACTOR_ID: string = "hKByXkMQaC5Qt9UMN";

	constructor(apifyDriver: ApifyDriver) {
		super(LinkedInJobsActor.ACTOR_ID, apifyDriver);
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
		return items as unknown as LinkedInJobsResult[];
	}

	async searchAndGetResults(
		input: LinkedInJobsInput,
	): Promise<LinkedInJobsResult[]> {
		const run = await this.search(input);
		return await this.getResults(run);
	}

	getJobSource(): JobSource {
		return {
			source: "linked-in",
			searchUrl: "https://www.linkedin.com/jobs/search/?keywords={query}",
		};
	}
}
