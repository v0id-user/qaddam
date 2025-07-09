"use node";

import { internalAction } from "@/_generated/server";
import { v } from "convex/values";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

// Step 2: Extract keywords from CV for database job searching
export const aiTuneJobSearch = internalAction({
	args: {
		cvProfile: v.object({
			skills: v.array(v.string()),
			experience_level: v.string(),
			job_titles: v.array(v.string()),
			industries: v.array(v.string()),
			keywords: v.array(v.string()),
			education: v.string(),
			years_of_experience: v.number(),
			preferred_locations: v.array(v.string()),
		}), // CV profile object from step 1
	},
	handler: async (
		ctx,
		args,
	): Promise<{
		primary_keywords: string[];
		secondary_keywords: string[];
		search_terms: string[];
		job_title_keywords: string[];
		technical_skills: string[];
	}> => {
		try {
			console.log("Starting keyword extraction for CV profile:", args.cvProfile);

			const response = await generateObject({
				model: openai.chat("gpt-4o-mini", {
					structuredOutputs: true,
				}),
				schemaName: "CV_Keywords_Extraction",
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
    <rule>Always provide at least one keyword in each category</rule>
    <rule>Ensure all arrays are non-empty</rule>
  </rules>
</agent>
                        `,
					},
					{
						role: "user",
						content: `
Analyze the following structured CV profile and extract search keywords for finding relevant job listings in our database:

Skills: ${args.cvProfile.skills.join(", ")}
Experience Level: ${args.cvProfile.experience_level}
Previous Job Titles: ${args.cvProfile.job_titles.join(", ")}
Industries: ${args.cvProfile.industries.join(", ")}
Existing Keywords: ${args.cvProfile.keywords.join(", ")}
Education: ${args.cvProfile.education}
Years of Experience: ${args.cvProfile.years_of_experience}
Preferred Locations: ${args.cvProfile.preferred_locations.join(", ")}

Extract specific keywords that would be found in job titles and job descriptions. Focus on:
1. Core technical skills from the skills list
2. Job titles and role names that would appear in job postings
3. Industry terms commonly used in job descriptions
4. Experience level indicators based on years of experience
5. Domain expertise that appears in job requirements

Provide keywords that are likely to appear in actual job postings and descriptions.
Important: Extract only concrete, searchable terms - avoid soft skills or abstract concepts.
Make sure each array has at least one relevant keyword.
						`,
					},
				],
				schema: z.object({
					primary_keywords: z
						.array(z.string())
						.min(1)
						.describe(
							"Most important keywords for job searching - technical skills, job titles, core expertise",
						),
					secondary_keywords: z
						.array(z.string())
						.min(1)
						.describe(
							"Additional relevant keywords - related skills, industry terms, experience levels",
						),
					search_terms: z
						.array(z.string())
						.min(1)
						.describe("Combined optimized search terms for database queries"),
					job_title_keywords: z
						.array(z.string())
						.min(1)
						.describe("Specific job titles and role names to search for"),
					technical_skills: z
						.array(z.string())
						.min(1)
						.describe(
							"Technical skills, programming languages, frameworks, and tools",
						),
				}),
			});

			const result = response.object;
			console.log("Keyword extraction completed successfully:", result);

			// Validate that all arrays are non-empty
			if (
				result.primary_keywords.length === 0 ||
				result.secondary_keywords.length === 0 ||
				result.search_terms.length === 0 ||
				result.job_title_keywords.length === 0 ||
				result.technical_skills.length === 0
			) {
				console.warn("Some keyword arrays are empty, providing fallbacks");
				
				// Provide fallback keywords based on CV profile
				const fallbackKeywords = {
					primary_keywords: result.primary_keywords.length > 0 ? result.primary_keywords : args.cvProfile.skills.slice(0, 5),
					secondary_keywords: result.secondary_keywords.length > 0 ? result.secondary_keywords : args.cvProfile.industries,
					search_terms: result.search_terms.length > 0 ? result.search_terms : args.cvProfile.job_titles,
					job_title_keywords: result.job_title_keywords.length > 0 ? result.job_title_keywords : args.cvProfile.job_titles,
					technical_skills: result.technical_skills.length > 0 ? result.technical_skills : args.cvProfile.skills,
				};
				
				return fallbackKeywords;
			}

			return result;
		} catch (error) {
			console.error("Error in keyword extraction:", error);
			
			// Provide fallback based on CV profile data
			const fallbackResult = {
				primary_keywords: args.cvProfile.skills.slice(0, 5),
				secondary_keywords: args.cvProfile.industries,
				search_terms: args.cvProfile.job_titles,
				job_title_keywords: args.cvProfile.job_titles,
				technical_skills: args.cvProfile.skills,
			};
			
			console.log("Using fallback keywords:", fallbackResult);
			return fallbackResult;
		}
	},
});
