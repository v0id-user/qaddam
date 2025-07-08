import { ApifyDriver } from "@/driver/apify";

export class Actor {
    private readonly actor_id: string;
    private readonly apifyDriver: ApifyDriver;
    private readonly actorClient: any;

    constructor(actor_id: string, apifyDriver: ApifyDriver) {
        this.actor_id = actor_id;
        this.apifyDriver = apifyDriver;
        this.actorClient = this.apifyDriver.getClient().actor(actor_id);
    }

    getId(): string {
        return this.actor_id;
    }

    getActor(): any {
        return this.actorClient;
    }

    async call(input?: any, options?: any) {
        return await this.actorClient.call(input, options);
    }

    async start(input?: any, options?: any) {
        return await this.actorClient.start(input, options);
    }
}