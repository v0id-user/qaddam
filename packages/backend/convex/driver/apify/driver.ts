"use node";

import { ApifyClient } from "apify-client";
import { Actor } from "./actors/driver";

export default class ApifyDriver {
	private readonly client: ApifyClient;

	constructor() {
		// Base client
		this.client = new ApifyClient({
			token: process.env.APIFY_API_KEY,
		});
	}

	getClient(): ApifyClient {
		return this.client;
	}

	setActor(actorId: string): Actor {
		return new Actor(actorId, this);
	}
}
