import { internalAction } from "@/_generated/server";
import { v } from "convex/values";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { generateObject } from "ai";

// Step 1: Parse CV and extract user profile
export const aiParseCV = internalAction({
	args: {
		cv_storage_id: v.id("_storage"),
		userId: v.optional(v.id("users")),
	},
	handler: async (ctx, args): Promise<any> => {
		const { cv_storage_id } = args;
		const cv = await ctx.storage.getUrl(cv_storage_id);

		if (!cv) {
			throw new Error("CV file not found in storage");
		}

		const response = await generateObject({
			model: openai.chat("gpt-4o-mini", {
				structuredOutputs: true,
			}),
			schemaName: "Job_Search_Keywords_From_CV",
			messages: [
				{
					role: "system",
					content: `
<agent>
  <name>JobSearchProfileAgent</name>
  <description>
    An AI agent that parses CVs and extracts structured job search profiles for automated job discovery.
  </description>

  <goals>
    <goal>Extract key information from CV: skills, experience, education, job titles, industries</goal>
    <goal>Infer job search preferences and suitable job types based on CV content</goal>
    <goal>Generate structured profile data for job search algorithms</goal>
    <goal>Support multilingual CVs (English + Arabic)</goal>
  </goals>

  <rules>
    <rule>Extract concrete skills, technologies, and experience levels from CV text</rule>
    <rule>Infer suitable job titles and industries based on background</rule>
    <rule>Determine experience level: entry-level, mid-level, senior, executive</rule>
    <rule>Identify location preferences if mentioned</rule>
    <rule>Generate relevant keywords for job searching</rule>
    <rule>Output structured JSON data that can be consumed by search algorithms</rule>
  </rules>
</agent>
					`,
				},
				{
					role: "user",
					content:
						"Please analyze this CV and extract the structured profile information.",
					experimental_attachments: [
						{
							name: "cv.pdf",
							contentType: "application/pdf",
							url: cv,
						},
					],
				},
			],
			schema: z.object({
				skills: z.array(z.string()),
				experience_level: z.enum(["entry", "mid", "senior", "executive"]),
				job_titles: z.array(z.string()),
				industries: z.array(z.string()),
				keywords: z.array(z.string()),
				education: z.string(),
				years_of_experience: z.number(),
				preferred_locations: z.array(z.string()),
			}),
		});

		return response.object;
	},
});
