"use node";

import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { validateKeywordExtraction } from "../../lib/validators";
import { keyword_extraction_schema } from "../../lib/schemas/keyword_extraction";
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
		userId: v.id("users"),
		workflowTrackingId: v.string(),
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
			console.log("Starting keyword extraction:", {
				skills: args.cvProfile.skills.length,
				jobTitles: args.cvProfile.job_titles.length,
				yearsOfExperience: args.cvProfile.years_of_experience,
				experienceLevel: args.cvProfile.experience_level,
			});

			// Update workflow status to indicate AI processing started
			await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "extracting_keywords",
				percentage: 30,
				userId: args.userId,
			});

			const response = await generateObject({
				model: openai.chat("gpt-4o-mini", {
					structuredOutputs: true,
				}),
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
    <rule>Extract ALL keywords that are explicitly mentioned in the CV skills list</rule>
    <rule>Include every single technical skill, framework, language, database, and tool from the CV</rule>
    <rule>Prioritize technical skills and technologies over soft skills</rule>
    <rule>Use standard industry terminology and job market vocabulary</rule>
    <rule>Include both specific technologies and broader categories (e.g., "React" and "Frontend")</rule>
    <rule>Consider synonyms and alternative terms for the same skills</rule>
    <rule>Group related keywords logically for database querying</rule>
    <rule>Maintain language consistency with the CV input</rule>
    <rule>DO NOT filter out any skills from the CV - include them ALL</rule>
    <rule>Always provide at least one keyword in each category</rule>
    <rule>Ensure all arrays are non-empty</rule>
    <rule>Be comprehensive - every skill in the CV should appear in technical_skills</rule>
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
1. ALL technical skills from the skills list - include every single one (WebAssembly, Cloudflare Workers, PostgreSQL, FastAPI, etc.)
2. Job titles and role names that would appear in job postings
3. Industry terms commonly used in job descriptions
4. Experience level indicators based on years of experience
5. Domain expertise that appears in job requirements

CRITICAL: Include EVERY skill from the CV skills list in the technical_skills array. Do not filter out or omit any technologies.

Skills to specifically include: ${args.cvProfile.skills.join(", ")}

Provide keywords that are likely to appear in actual job postings and descriptions.
Important: Include ALL technical skills from the CV - don't leave any out.
Make sure each array has at least one relevant keyword.
						`,
					},
				],
				schema: keyword_extraction_schema,
			});

			console.log("AI Keyword Extraction - Token usage:", {
				promptTokens: response.usage?.promptTokens || 0,
				completionTokens: response.usage?.completionTokens || 0,
				totalTokens: response.usage?.totalTokens || 0,
			});

			const fullResult = validateKeywordExtraction(response.object as unknown);
			console.log("Keyword extraction completed:", {
				primary: fullResult.primary_keywords.length,
				secondary: fullResult.secondary_keywords.length,
				search: fullResult.search_terms.length,
				jobTitles: fullResult.job_title_keywords.length,
				technical: fullResult.technical_skills.length,
			});

			console.log("Sample keywords:", {
				primary: fullResult.primary_keywords.slice(0, 3).join(", ") + "...",
				secondary: fullResult.secondary_keywords.slice(0, 3).join(", ") + "...",
				search: fullResult.search_terms.slice(0, 3).join(", ") + "...",
			});

			// Update workflow status to indicate keyword extraction completed
			await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "keywords_extracted",
				percentage: 40,
				userId: args.userId,
			});

			// Extract only the required fields for the return type
			const result = {
				primary_keywords: fullResult.primary_keywords,
				secondary_keywords: fullResult.secondary_keywords,
				search_terms: fullResult.search_terms,
				job_title_keywords: fullResult.job_title_keywords,
				technical_skills: fullResult.technical_skills,
			};

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
					primary_keywords:
						result.primary_keywords.length > 0
							? result.primary_keywords
							: args.cvProfile.skills.slice(0, 5),
					secondary_keywords:
						result.secondary_keywords.length > 0
							? result.secondary_keywords
							: args.cvProfile.industries,
					search_terms:
						result.search_terms.length > 0
							? result.search_terms
							: args.cvProfile.job_titles,
					job_title_keywords:
						result.job_title_keywords.length > 0
							? result.job_title_keywords
							: args.cvProfile.job_titles,
					technical_skills:
						result.technical_skills.length > 0
							? result.technical_skills
							: args.cvProfile.skills,
				};

				console.log("Using fallback keywords:", {
					primary: fallbackKeywords.primary_keywords.length,
					secondary: fallbackKeywords.secondary_keywords.length,
				});
				return fallbackKeywords;
			}

			return result;
		} catch (error) {
			console.error("Error in keyword extraction:", { error });

			// Update workflow status to indicate error
			await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "keyword_extraction_error",
				percentage: 40,
				userId: args.userId,
			});

			// Provide fallback based on CV profile data
			const fallbackResult = {
				primary_keywords: args.cvProfile.skills.slice(0, 5),
				secondary_keywords: args.cvProfile.industries,
				search_terms: args.cvProfile.job_titles,
				job_title_keywords: args.cvProfile.job_titles,
				technical_skills: args.cvProfile.skills,
			};

			console.log("Using fallback keywords:", {
				primary: fallbackResult.primary_keywords.length,
				secondary: fallbackResult.secondary_keywords.length,
				search: fallbackResult.search_terms.length,
			});
			return fallbackResult;
		}
	},
});
