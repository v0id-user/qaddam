"use node";

import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { internal } from "@/_generated/api";
import schema from "@/schema";
import { modules } from "@/test.setup";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
const ENV_PATH = path.resolve(__dirname, "../.env.local");
console.log(ENV_PATH);
dotenv.config({ path:  ENV_PATH});
test("job search ai search", {
	timeout: 120000
} , async () => {
	const t = convexTest(schema, modules);
	const result = await t.action(internal.jobs.actions.tuneSearch.aiTuneJobSearch, {
		cvProfile: JSON.stringify({
			name: "Test User", 
			title: "Senior Frontend Developer",
			skills: ["React", "TypeScript", "CSS", "JavaScript"],
			experience: "6 years",
			location: "Riyadh, Saudi Arabia",
			preferredLocations: ["Riyadh", "Dubai"],
			remotePreference: true,
		}),
	});

	console.log(result);

	expect(result).toBeDefined();
});
