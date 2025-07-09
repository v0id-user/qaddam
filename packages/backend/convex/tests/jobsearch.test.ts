"use node";

import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { internal } from "@/_generated/api";
import schema from "@/schema";

test("job search ai search", async () => {
	const t = convexTest(schema);
	const result = await t.action(internal.jobs.actions.searchJobs.aiSearchJobs, {
		searchParams: {
			jobTitle: "Frontend Developer",
			location: "Riyadh",
			skills: ["React", "TypeScript", "JavaScript"],
			experience: "5+ years",
			remote: true,
		},
		cvProfile: {
			name: "Test User",
			title: "Senior Frontend Developer",
			skills: ["React", "TypeScript", "CSS", "JavaScript"],
			experience: "6 years",
			location: "Riyadh, Saudi Arabia",
			preferredLocations: ["Riyadh", "Dubai"],
			remotePreference: true,
		},
	});

	expect(result).toBeDefined();
});
