"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import JobSearchEngine from "./driver/jobs/driver";
import { GoogleJobsActor } from "./driver/jobs/actors";
import { XMLBuilder } from "fast-xml-parser";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export const aiTuneJobSearch = internalAction({
	args: {
		cvProfile: v.string(), // Profile from step 1
		userId: v.optional(v.id("users")),
	},
	handler: async (ctx, args): Promise<any> => {
		const jobSearch = new JobSearchEngine(GoogleJobsActor);
		const searchRun = await jobSearch.search({
			queries: "software engineer",
			maxPagesPerQuery: 1,
			csvFriendlyOutput: false,
			languageCode: "en",
		});
		const results = await jobSearch.getResults(searchRun);

		// Convert results to XML string
		const xmlResults = new XMLBuilder().build(results);

		const response = await generateObject({
			model: openai.chat("gpt-4o-mini", {
				structuredOutputs: true,
			}),
			schemaName: "Job Search Optimization Parameters",
			prompt: `
Based on the following CV profile, generate optimized job search parameters:
${args.cvProfile}

Current Job Search Results:
${xmlResults}
            `.trim(),
			messages: [
				{
					role: "system",
					content: `
                    <agent>
  <name>JobSearchTuningAgent</name>
  <description>
    An AI agent that optimizes job search parameters based on user profile and market conditions.
  </description>

  <goals>
    <goal>Interpret survey-style input from users to infer a concise job search profile.</goal>
    <goal>Support multilingual input (English + Arabic) and output accordingly.</goal>
    <goal>Generate highly relevant search signals for backend scraping processes.</goal>
    <goal>Detect implied user preferences and fill missing gaps (e.g., job type, experience level).</goal>
    <goal>Provide consistent structured insight that downstream agents or services can consume.</goal>
  </goals>

  <rules>
    <rule>Never hallucinate job content — your role is inference, not fabrication.</rule>
    <rule>Respond using the language the user used in their input, unless context suggests otherwise.</rule>
    <rule>Adjust for regional expectations (e.g., "remote" in the Gulf may imply hybrid or flexible schedules).</rule>
    <rule>Always prefer semantic matches over literal ones (e.g., "خريج جديد" maps to "entry level").</rule>
    <rule>If user answers are partial or vague, apply neutral or commonly safe defaults (e.g., default to "tech" if domain is unclear but skills are software-related).</rule>
    <rule>Derive job titles, industries, and search keywords from explicit and implicit user intent.</rule>
    <rule>Structure insights in a clean, compact way that backend services can easily parse.</rule>
    <rule>Maintain a helpful and context-aware tone, even though you do not directly speak to the user.</rule>
    <rule>Gracefully handle edge cases like missing language tags, mixed inputs, or contradictory answers.</rule>
  </rules>
</agent>
                    `,
				},
			],
			schema: z.object({
				optimized_keywords: z
					.array(z.string())
					.describe("Enhanced search keywords"),
				target_job_titles: z
					.array(z.string())
					.describe("Specific job titles to search for"),
				target_companies: z
					.array(z.string())
					.describe("Recommended companies to target"),
				salary_range: z
					.object({
						min: z.number(),
						max: z.number(),
						currency: z.string(),
					})
					.describe("Suggested salary range"),
				preferred_job_types: z.array(
					z.enum(["full-time", "part-time", "contract", "internship"]),
				),
				locations: z
					.array(z.string())
					.describe("Target locations including remote"),
				search_strategy: z.string().describe("Personalized search approach"),
			}),
		});

		return response.object;
	},
});
