"use node";

import { ApifyDriver } from "../../apify";
import type { ActorRun } from "apify-client";
import type { JobSource } from "../types/job_source";
import type { JobSearchInput } from "../driver";
import { BaseJobSearchActor } from "./index";

/*
 * Indeed Jobs Actor
 *
 * Inputs:
 * - country: string (e.g., "US")
 * - followApplyRedirects: boolean
 * - location: string (e.g., "San Francisco")
 * - maxItems: number
 * - parseCompanyDetails: boolean
 * - position: string (e.g., "web developer")
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

/**
 * Indeed Job
 *
 * This is the type of the job object that is returned by the Indeed Jobs Actor.
 */
export interface IndeedJob {
	positionName: string;
	salary: string | null;
	jobType: string[];
	company: string;
	location: string;
	rating: number;
	reviewsCount: number;
	url: string;
	companyInfo?: {
		indeedUrl: string;
		url: string;
		companyDescription: string | null;
		rating: number;
		reviewCount: number;
		companyLogo: string;
		companySize: {
			min: number | null;
			max: number | null;
		} | null;
	};
}

export interface IndeedJobsResult {
	indeedJobs: IndeedJob[];
}

export class IndeedJobsActor extends BaseJobSearchActor<IndeedJobsInput, IndeedJobsResult> {
	protected readonly actorId = "hMvNSpz3JnHgl5jkh";
	protected readonly jobSource: JobSource = {
		source: "indeed",
		searchUrl: "https://www.indeed.com/jobs?q={query}",
	};

	constructor(apifyDriver: ApifyDriver) {
		super(apifyDriver, "hMvNSpz3JnHgl5jkh");
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
}
