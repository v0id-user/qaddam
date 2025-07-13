"use node";

import { ApifyDriver } from "../../driver/apify";
import type { ActorRun } from "apify-client";
import type { JobSource } from "./types/job_source";

/**
 * Interface for job search actors that handle searching and retrieving results
 * from different job board sources
 */
export interface JobSearchActor<TInput, TResult> {
	search(input: TInput): Promise<ActorRun>;
	getResults(run: ActorRun): Promise<TResult[]>;
	searchAndGetResults(input: TInput): Promise<TResult[]>;
	getJobSource(): JobSource;
}

/**
 * Base input interface that all job search inputs must implement
 */
export interface JobSearchInput {
	// Don't use or remove this field
	__EMPTY_INPUT?: boolean;
}

/**
 * Helper types to extract input/result types from JobSearchActor implementations
 */
export type ActorInput<T extends JobSearchActor<unknown, unknown>> =
	T extends JobSearchActor<infer I, infer _> ? I : never;
export type ActorResult<T extends JobSearchActor<unknown, unknown>> =
	T extends JobSearchActor<infer _, infer R> ? R : never;

/**
 * Constructor type for creating job search actor instances
 */
export interface JobSearchActorConstructor<
	TActor extends JobSearchActor<unknown, unknown>,
> {
	new (apifyDriver: ApifyDriver): TActor;
}

/**
 * Main job search class that manages actor initialization and execution
 */
export default class JobSearchEngine<
	TActor extends JobSearchActor<unknown, unknown>,
> {
	private actor: TActor | null = null;

	constructor(private readonly ActorClass: JobSearchActorConstructor<TActor>) {}

	/**
	 * Configures the ApifyDriver for this job search instance
	 */
	withApifyDriver(apifyDriver: ApifyDriver): this {
		this.actor = new this.ActorClass(apifyDriver);
		return this;
	}

	/**
	 * Ensures actor is initialized, creates with default driver if needed
	 */
	#ensureInitialized(): TActor {
		if (!this.actor) {
			const defaultDriver = new ApifyDriver();
			this.actor = new this.ActorClass(defaultDriver);
		}
		return this.actor;
	}

	/**
	 * Executes a job search with the given input
	 */
	async run(input: ActorInput<TActor>): Promise<ActorRun> {
		return await this.#ensureInitialized().search(input);
	}

	/**
	 * Alias for run() method
	 */
	async search(input: ActorInput<TActor>): Promise<ActorRun> {
		return await this.run(input);
	}

	/**
	 * Retrieves results from a completed job search run
	 */
	async getResults(
		run: ActorRun,
	): Promise<Awaited<ReturnType<TActor["getResults"]>>> {
		return (await this.#ensureInitialized().getResults(run)) as Awaited<
			ReturnType<TActor["getResults"]>
		>;
	}

	/**
	 * Convenience method to run search and get results in one call
	 */
	async runAndGetResults(
		input: ActorInput<TActor>,
	): Promise<Awaited<ReturnType<TActor["searchAndGetResults"]>>> {
		return (await this.#ensureInitialized().searchAndGetResults(
			input,
		)) as Awaited<ReturnType<TActor["searchAndGetResults"]>>;
	}

	/**
	 * Returns metadata about the job source being searched
	 */
	getJobSource(): JobSource {
		return this.#ensureInitialized().getJobSource();
	}

	/**
	 * Returns the underlying actor instance
	 */
	getActor(): TActor {
		return this.#ensureInitialized();
	}
}
