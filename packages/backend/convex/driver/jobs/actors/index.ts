"use node";

import { ApifyDriver } from "../../apify";
import { Actor } from "../../apify/actors";
import type { ActorRun } from "apify-client";
import type { JobSource } from "../types/job_source";
import type { JobSearchActor, JobSearchInput } from "../driver";

// Base class for all job search actors
export abstract class BaseJobSearchActor<TInput extends JobSearchInput, TResult>
	extends Actor
	implements JobSearchActor<TInput, TResult>
{
	protected abstract readonly actorId: string;
	protected abstract readonly jobSource: JobSource;

	constructor(apifyDriver: ApifyDriver, actorId: string) {
		super(actorId, apifyDriver);
	}

	abstract search(input: TInput): Promise<ActorRun>;

	async getResults(run: ActorRun): Promise<TResult[]> {
		const client = this.getClient();
		const { items } = await client.dataset(run.defaultDatasetId).listItems();
		return items as unknown as TResult[];
	}

	async searchAndGetResults(input: TInput): Promise<TResult[]> {
		const run = await this.search(input);
		return await this.getResults(run);
	}

	getJobSource(): JobSource {
		return this.jobSource;
	}
}

export * from "./google_jobs";
export * from "./indeed_jobs";
export * from "./linkedin_jobs";
