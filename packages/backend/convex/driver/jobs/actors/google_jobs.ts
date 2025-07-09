"use node";

import { ApifyDriver } from "@/driver/apify";
import { Actor } from "@/driver/apify/actors";
import { ActorRun } from "apify-client";
import { JobSource } from "../types/job_source";
import { JobSearchInput, JobSearchActor } from "../driver";

/*
 * Google Jobs Actor
 *
 * Inputs:
 * - queries: string (newline separated queries)
 * - maxPagesPerQuery: number (default: 1)
 * - csvFriendlyOutput: boolean (default: false)
 * - languageCode: string (default: '')
 * - saveHtml: boolean (default: false)
 * - remoteOnly: boolean (default: false)
 */
export interface GoogleJobsInput extends JobSearchInput {
	queries: string;
	maxPagesPerQuery?: number;
	csvFriendlyOutput?: boolean;
	languageCode?: string;
	saveHtml?: boolean;
	remoteOnly?: boolean;
}

export interface JobHighlight {
	title: string;
	items: string[];
}

export interface ApplyOption {
	title: string;
	link: string;
}

export interface JobMetadata {
	postedAt?: string;
	scheduleType?: string;
}

export interface GoogleJob {
	title: string;
	companyName: string;
	location: string;
	via: string;
	shareLink: string;
	thumbnail?: string;
	extras?: string[];
	metadata?: JobMetadata;
	description: string;
	jobHighlights?: JobHighlight[];
	applyOptions?: ApplyOption[];
}

export interface CategoryOption {
	name: string;
	parameters: {
		uds: string;
		q: string;
	};
	link: string;
}

export interface Category {
	name: string;
	parameters?: {
		uds: string;
		q: string;
	};
	link?: string;
	options?: CategoryOption[];
}

export interface GoogleJobsResult {
	googleJobs: GoogleJob[];
	categories: Category[];
	pageNumber: number;
}

/**
 * @deprecated This actor is no longer functional. We need to either:
 * 1. Find a new working Apify actor for Google Jobs
 * 2. Build our own scraping solution
 * Please do not use this class until a replacement is implemented.
 */
export class GoogleJobsActor
	extends Actor
	implements JobSearchActor<GoogleJobsInput, GoogleJobsResult>
{
	private static readonly ACTOR_ID: string = "SpK8RxKhIgV6BWOz9";

	constructor(apifyDriver: ApifyDriver) {
		super(GoogleJobsActor.ACTOR_ID, apifyDriver);
	}

	async search(input: GoogleJobsInput): Promise<ActorRun> {
		const jobInput = {
			queries: input.queries,
			maxPagesPerQuery: input.maxPagesPerQuery ?? 1,
			csvFriendlyOutput: input.csvFriendlyOutput ?? false,
			languageCode: input.languageCode ?? "",
			saveHtml: input.saveHtml ?? false,
		};

		return await this.call(jobInput);
	}

	async getResults(run: ActorRun): Promise<GoogleJobsResult[]> {
		const client = this.getClient();
		const { items } = await client.dataset(run.defaultDatasetId).listItems();
		return items as unknown as GoogleJobsResult[];
	}

	async searchAndGetResults(
		input: GoogleJobsInput,
	): Promise<GoogleJobsResult[]> {
		const run = await this.search(input);
		return await this.getResults(run);
	}

	getJobSource(): JobSource {
		return {
			source: "google",
			searchUrl: "https://www.google.com/search?q={query}&ibp=htl;jobs",
		};
	}
}
