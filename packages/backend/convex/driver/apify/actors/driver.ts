"use node";

import { ApifyDriver } from "../../../driver/apify";
import type {
	ActorClient,
	ApifyClient,
	ActorRun,
	ActorStartOptions,
	ActorCallOptions,
} from "apify-client";

export class Actor {
	private readonly actor_id: string;
	private readonly apifyDriver: ApifyDriver;
	private readonly actorClient: ActorClient;

	constructor(actor_id: string, apifyDriver: ApifyDriver) {
		this.actor_id = actor_id;
		this.apifyDriver = apifyDriver;
		this.actorClient = this.apifyDriver.getClient().actor(actor_id);
	}

	getId(): string {
		return this.actor_id;
	}

	getActor(): ActorClient {
		return this.actorClient;
	}

	protected getClient(): ApifyClient {
		return this.apifyDriver.getClient();
	}

	async call(
		input?: Record<string, unknown>,
		options?: ActorCallOptions,
	): Promise<ActorRun> {
		return await this.actorClient.call(input, options);
	}

	async start(
		input?: Record<string, unknown>,
		options?: ActorStartOptions,
	): Promise<ActorRun> {
		return await this.actorClient.start(input, options);
	}
}
