import { ApifyDriver } from "@/driver/apify";
import { Actor } from "@/driver/apify/actors";
import { ActorRun } from 'apify-client';

export interface GoogleJobsInput {
    queries: string;
    maxPagesPerQuery?: number;
    csvFriendlyOutput?: boolean;
    languageCode?: string;
    saveHtml?: boolean;
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

export class GoogleJobsActor extends Actor {
    private static readonly ACTOR_ID: string = 'SpK8RxKhIgV6BWOz9';
    
    constructor(apifyDriver: ApifyDriver) {
        super(GoogleJobsActor.ACTOR_ID, apifyDriver);
    }

    async search(input: GoogleJobsInput): Promise<ActorRun> {
        const jobInput = {
            queries: input.queries,
            maxPagesPerQuery: input.maxPagesPerQuery ?? 1,
            csvFriendlyOutput: input.csvFriendlyOutput ?? false,
            languageCode: input.languageCode ?? "",
            saveHtml: input.saveHtml ?? false
        };

        return await this.call(jobInput);
    }

    async getResults(run: ActorRun): Promise<GoogleJobsResult[]> {
        const client = this.getClient();
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        return items as unknown as GoogleJobsResult[];
    }

    async searchAndGetResults(input: GoogleJobsInput): Promise<GoogleJobsResult[]> {
        const run = await this.search(input);
        return await this.getResults(run);
    }
}