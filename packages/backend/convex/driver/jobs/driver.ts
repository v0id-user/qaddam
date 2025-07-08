import { ApifyDriver } from "@/driver/apify";
import { ActorRun } from 'apify-client';
import { JobSource } from "./types/job-source";

// Generic interface that all job search actors should implement
export interface JobSearchActor<TInput, TResult> {
    search(input: TInput): Promise<ActorRun>;
    getResults(run: ActorRun): Promise<TResult[]>;
    searchAndGetResults(input: TInput): Promise<TResult[]>;
    getJobSource(): JobSource;
}

// Generic input interface for job search
export interface JobSearchInput {
    queries: string;
}

// Actor constructor type
export interface JobSearchActorConstructor<TActor extends JobSearchActor<TInput, TResult>, TInput extends JobSearchInput, TResult> {
    new(apifyDriver: ApifyDriver): TActor;
}

export default class JobSearch<TActor extends JobSearchActor<TInput, TResult>, TInput extends JobSearchInput, TResult> {
    private actor: TActor | null = null;
    
    constructor(private readonly ActorClass: JobSearchActorConstructor<TActor, TInput, TResult>) {}

    /**
     * Set the ApifyDriver to use
     */
    withApifyDriver(apifyDriver: ApifyDriver): this {
        this.actor = new this.ActorClass(apifyDriver);
        return this;
    }

    /**
     * Get the actor instance (throws if not initialized)
     */
    #ensureInitialized(): TActor {
        if (!this.actor) {
            throw new Error('JobSearch not initialized. Call withApifyDriver() first.');
        }
        return this.actor;
    }

    /**
     * Run a job search with the provided input
     */
    async run(input: TInput): Promise<ActorRun> {
        return await this.#ensureInitialized().search(input);
    }

    /**
     * Get results from a completed job search run
     */
    async getResults(run: ActorRun): Promise<TResult[]> {
        return await this.#ensureInitialized().getResults(run);
    }

    /**
     * Run a job search and get results in one call
     */
    async runAndGetResults(input: TInput): Promise<TResult[]> {
        return await this.#ensureInitialized().searchAndGetResults(input);
    }

    /**
     * Get the job source information from the actor
     */
    getJobSource(): JobSource {
        return this.#ensureInitialized().getJobSource();
    }

    /**
     * Get the underlying actor instance
     */
    getActor(): TActor {
        return this.#ensureInitialized();
    }
}