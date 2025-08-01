import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { validateCVProfile } from "../../lib/validators";
import { cv_profile_schema } from "../../lib/schemas/cv_profile";

// Step 1: Parse CV and extract user profile
export const aiParseCV = internalAction({
	args: {
		cv_storage_id: v.id("_storage"),
		userId: v.id("users"),
		workflowTrackingId: v.string(),
	},
	handler: async (ctx, args): Promise<any> => {
		try {
			const { cv_storage_id } = args;
			const cv = await ctx.storage.getUrl(cv_storage_id);

			if (!cv) {
				throw new Error("CV file not found in storage");
			}

			console.log("Starting CV parsing:", {
				storageId: cv_storage_id,
				userId: args.userId,
				workflowTrackingId: args.workflowTrackingId,
			});

			console.log("Calling AI model for CV analysis...");

			// Update workflow status to indicate AI processing started
			await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "parsing_cv",
				percentage: 15,
				userId: args.userId,
			});

			const response = await (generateObject as any)({
				model: openai.chat("gpt-4o-mini", {
					structuredOutputs: true,
				}),
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
    <rule>Extract ALL skills, technologies, frameworks, languages, databases, and tools mentioned in CV text</rule>
    <rule>Include programming languages, databases, cloud services, frameworks, libraries</rule>
    <rule>Extract skills from project descriptions, tech stacks, and mentioned technologies</rule>
    <rule>Include both specific technologies (React.js, PostgreSQL) and general categories (Frontend, Backend)</rule>
    <rule>Look for skills in project tech stacks like "Tech: Python / PostgreSQL / FastAPI"</rule>
    <rule>Infer suitable job titles and industries based on background</rule>
    <rule>Determine experience level: entry-level, mid-level, senior, executive</rule>
    <rule>Identify location preferences if mentioned</rule>
    <rule>Generate relevant keywords for job searching</rule>
    <rule>Output structured JSON data that can be consumed by search algorithms</rule>
    <rule>Always provide at least one item in each array field</rule>
    <rule>Ensure all required fields are populated with meaningful data</rule>
    <rule>Be comprehensive - don't miss any mentioned technologies or skills</rule>
  </rules>
</agent>
						`,
					},
					{
						role: "user",
						content: `Please analyze this CV and extract the structured profile information. 

CRITICAL INSTRUCTIONS:
1. Extract ALL technologies, programming languages, frameworks, databases, cloud services mentioned anywhere in the CV
2. Look carefully at project descriptions and tech stacks (e.g., "Tech: Rust / TypeScript / WebAssembly / Cloudflare Workers")
3. Include both specific technologies (PostgreSQL, FastAPI, WebAssembly) and general categories
4. Don't miss any skills mentioned in project descriptions or technology lists
5. Be comprehensive and thorough in skill extraction
6. Make sure to provide at least one item in each array field

Extract every single technology, tool, framework, language, and skill mentioned in the document.`,
						experimental_attachments: [
							{
								name: "cv.pdf",
								contentType: "application/pdf",
								url: cv,
							},
						],
					},
				],
				schema: cv_profile_schema,
			});

			console.log("AI CV Parsing - Token usage:", {
				promptTokens: response.usage?.promptTokens || 0,
				completionTokens: response.usage?.completionTokens || 0,
				totalTokens: response.usage?.totalTokens || 0,
			});

			const result = validateCVProfile(response.object as unknown);
			console.log("CV parsing completed:", {
				skills: result.skills.length,
				jobTitles: result.job_titles.length,
				industries: result.industries.length,
				yearsOfExperience: result.years_of_experience,
				experienceLevel: result.experience_level,
			});

			console.log("Sample extracted data:", {
				skills: result.skills.slice(0, 3),
				titles: result.job_titles.slice(0, 2),
				industries: result.industries.slice(0, 2),
				locations: result.preferred_locations.slice(0, 2),
			});

			// Update workflow status to indicate CV parsing completed
			await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "cv_parsed",
				percentage: 20,
				userId: args.userId,
			});

			// Validate that all required arrays are non-empty
			if (
				result.skills.length === 0 ||
				result.job_titles.length === 0 ||
				result.industries.length === 0 ||
				result.keywords.length === 0 ||
				result.preferred_locations.length === 0
			) {
				console.log("Some required arrays are empty, providing fallbacks");

				// Provide fallback data
				const fallbackResult = {
					...result,
					skills: result.skills.length > 0 ? result.skills : ["General Skills"],
					job_titles:
						result.job_titles.length > 0 ? result.job_titles : ["Professional"],
					industries:
						result.industries.length > 0 ? result.industries : ["General"],
					keywords:
						result.keywords.length > 0
							? result.keywords
							: ["experience", "professional"],
					preferred_locations:
						result.preferred_locations.length > 0
							? result.preferred_locations
							: ["Any Location"],
				};

				console.log("Using fallback data:", {
					skills: fallbackResult.skills.length,
					jobTitles: fallbackResult.job_titles,
				});
				return fallbackResult;
			}

			return result;
		} catch (error) {
			console.log("Error in CV parsing:", { error });

			// Update workflow status to indicate error
			await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
				workflowId: args.workflowTrackingId,
				stage: "cv_parsing_error",
				percentage: 20,
				userId: args.userId,
			});

			// Provide fallback profile data
			const fallbackProfile = {
				skills: ["General Skills"],
				experience_level: "mid" as const,
				job_titles: ["Professional"],
				industries: ["General"],
				keywords: ["experience", "professional"],
				education: "Not specified",
				years_of_experience: 0,
				preferred_locations: ["Any Location"],
			};

			console.log("Using fallback profile:", {
				skills: fallbackProfile.skills.length,
				jobTitles: fallbackProfile.job_titles,
				experienceLevel: fallbackProfile.experience_level,
			});
			return fallbackProfile;
		}
	},
});
