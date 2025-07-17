"use node";

import { ApifyDriver } from "../../apify";
import { Actor } from "../../apify/actors";
import type { ActorRun } from "apify-client";
import type { JobSource } from "../types/job_source";
import type { JobSearchActor, JobSearchInput } from "../driver";

/*
 * Indeed Jobs Actor
 *
 * Inputs:
 * - country: string
 * - followApplyRedirects: boolean
 * - location: string
 * - maxItems: number
 * - parseCompanyDetails: boolean
 * - position: string
 * - saveOnlyUniqueItems: boolean
 **/

export interface IndeedJobsInput extends JobSearchInput {
	country: string;
	followApplyRedirects: boolean;
	location: string;
	maxItems: number;
	parseCompanyDetails: boolean;
	position: string;
	saveOnlyUniqueItems: boolean;
}

export interface IndeedCompanySize {
	min: number | null;
	max: number | null;
}

export interface IndeedCompanyInfo {
	indeedUrl: string;
	url: string | null;
	companyDescription: string | null;
	rating: number | null;
	reviewCount: number | null;
	companyLogo: string | null;
	companySize: IndeedCompanySize | null;
}

export interface IndeedJob {
	positionName: string;
	salary: string | null;
	jobType: string[];
	company: string;
	location: string;
	rating: number | null;
	reviewsCount: number | null;
	url: string;
	companyInfo?: IndeedCompanyInfo;
}

export interface IndeedJobsResult {
	indeedJobs: IndeedJob[];
}

export class IndeedJobsActor
	extends Actor
	implements JobSearchActor<IndeedJobsInput, IndeedJobsResult>
{
	private static readonly ACTOR_ID: string = "hMvNSpz3JnHgl5jkh";

	constructor(apifyDriver: ApifyDriver) {
		super(IndeedJobsActor.ACTOR_ID, apifyDriver);
	}

	async search(input: IndeedJobsInput): Promise<ActorRun> {
		const jobInput = {
			country: input.country,
			followApplyRedirects: input.followApplyRedirects,
			location: input.location,
			maxItems: input.maxItems,
			parseCompanyDetails: input.parseCompanyDetails,
			position: input.position,
			saveOnlyUniqueItems: input.saveOnlyUniqueItems,
		};

		return await this.call(jobInput);
	}

	async getResults(run: ActorRun): Promise<IndeedJobsResult[]> {
		const client = this.getClient();
		const { items } = await client.dataset(run.defaultDatasetId).listItems();
		// The actor returns an array of job objects, so we wrap it in the expected result shape
		return [
			{
				indeedJobs: items as unknown as IndeedJob[],
			},
		];
	}

	async searchAndGetResults(
		input: IndeedJobsInput,
	): Promise<IndeedJobsResult[]> {
		const run = await this.search(input);
		return await this.getResults(run);
	}

	getJobSource(): JobSource {
		return {
			source: "indeed",
			searchUrl: "https://www.indeed.com/jobs?q={query}&l={location}",
		};
	}
}
