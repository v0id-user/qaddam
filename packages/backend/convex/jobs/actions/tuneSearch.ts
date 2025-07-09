"use node";

import { internalAction } from "@/_generated/server";
import { v } from "convex/values";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// Step 2: Extract keywords from CV for database job searching
export const aiTuneJobSearch = internalAction({
	args: {
		cvProfile: v.string(), // CV content/profile from step 1
	},
	handler: async (ctx, args): Promise<any> => {
		const response = await generateObject({
			model: openai.chat("gpt-4o-mini", {
				structuredOutputs: true,
			}),
			schemaName: "CV Keywords Extraction",
			prompt: `
Analyze the following CV profile and extract search keywords for finding relevant job listings in our database:

${args.cvProfile}

Extract specific keywords that would be found in job titles and job descriptions. Focus on:
1. Core technical skills (programming languages, frameworks, tools)
2. Job titles and role names that would appear in job postings
3. Industry terms commonly used in job descriptions
4. Experience level indicators (junior, senior, lead, manager, etc.)
5. Domain expertise that appears in job requirements

Provide keywords that are likely to appear in actual job postings and descriptions.
Important: Extract only concrete, searchable terms - avoid soft skills or abstract concepts.
            `.trim(),
			messages: [
				{
					role: "system",
					content: `
<agent>
  <name>CVKeywordExtractionAgent</name>
  <description>
    An AI agent that extracts relevant keywords from CV profiles for job database searching.
  </description>

  <goals>
    <goal>Extract specific, searchable keywords from CV content</goal>
    <goal>Identify technical skills, technologies, and tools mentioned</goal>
    <goal>Determine appropriate job titles and role keywords</goal>
    <goal>Classify experience level and seniority indicators</goal>
    <goal>Extract industry and domain-specific terminology</goal>
    <goal>Provide keywords that match common job listing vocabulary</goal>
  </goals>

  <rules>
    <rule>Extract only keywords that are explicitly mentioned or clearly implied in the CV</rule>
    <rule>Prioritize technical skills and technologies over soft skills</rule>
    <rule>Use standard industry terminology and job market vocabulary</rule>
    <rule>Include both specific technologies and broader categories (e.g., "React" and "Frontend")</rule>
    <rule>Consider synonyms and alternative terms for the same skills</rule>
    <rule>Group related keywords logically for database querying</rule>
    <rule>Maintain language consistency with the CV input</rule>
    <rule>Avoid hallucinating skills not present in the CV</rule>
  </rules>
</agent>
                    `,
				},
			],
			schema: z.object({
				primary_keywords: z
					.array(z.string())
					.describe("Most important keywords for job searching - technical skills, job titles, core expertise"),
				secondary_keywords: z
					.array(z.string())
					.describe("Additional relevant keywords - related skills, industry terms, experience levels"),
				search_terms: z
					.array(z.string())
					.describe("Combined optimized search terms for database queries"),
				job_title_keywords: z
					.array(z.string())
					.describe("Specific job titles and role names to search for"),
				technical_skills: z
					.array(z.string())
					.describe("Technical skills, programming languages, frameworks, and tools"),
			}),
		});

		return response.object;
	},
});
