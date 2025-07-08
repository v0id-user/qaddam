import { ApifyDriver } from "@/driver/apify";
import { Actor } from "@/driver/apify/actors";

export interface GoogleJobsInput {
    queries: string;
    maxPagesPerQuery?: number;
    csvFriendlyOutput?: boolean;
    languageCode?: string;
    saveHtml?: boolean;
}

export class GoogleJobsActor extends Actor {
    private static readonly ACTOR_ID: string = 'SpK8RxKhIgV6BWOz9';
    
    constructor(apifyDriver: ApifyDriver) {
        super(GoogleJobsActor.ACTOR_ID, apifyDriver);
    }

    async search(input: GoogleJobsInput) {
        const jobInput = {
            queries: input.queries,
            maxPagesPerQuery: input.maxPagesPerQuery ?? 1,
            csvFriendlyOutput: input.csvFriendlyOutput ?? false,
            languageCode: input.languageCode ?? "",
            saveHtml: input.saveHtml ?? false
        };

        return await this.call(jobInput);
    }

    async getResults(run: any) {
        const client = this.getClient();
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        return items;
    }

    async searchAndGetResults(input: GoogleJobsInput) {
        const run = await this.search(input);
        return await this.getResults(run);
    }
}