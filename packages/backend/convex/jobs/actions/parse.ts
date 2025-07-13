import { internalAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { generateObject } from "ai";

// Step 1: Parse CV and extract user profile
export const aiParseCV = internalAction({
	args: {
		cv_storage_id: v.id("_storage"),
		userId: v.optional(v.id("users")),
		workflowTrackingId: v.optional(v.string()),
	},
	handler: async (ctx, args): Promise<any> => {
		try {
			const { cv_storage_id } = args;
			const cv = await ctx.storage.getUrl(cv_storage_id);

			if (!cv) {
				throw new Error("CV file not found in storage");
			}

			console.log(
				"Starting CV parsing:",
				`storage ID: ${cv_storage_id.slice(0, 8)}...`,
				`user: ${args.userId ? args.userId.slice(0, 8) + "..." : "anon"}`,
			);

			// Update workflow status to indicate CV parsing started
			if (args.workflowTrackingId && args.userId) {
				await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
					workflowId: args.workflowTrackingId,
					stage: "parsing_cv",
					percentage: 5,
					userId: args.userId,
				});
			}

			console.log("Calling AI model for CV analysis...");

			// Update workflow status to indicate AI processing started
			if (args.workflowTrackingId && args.userId) {
				await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
					workflowId: args.workflowTrackingId,
					stage: "parsing_cv",
					percentage: 15,
					userId: args.userId,
				});
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
    <rule>Always provide at least one item in each array field</rule>
    <rule>Ensure all required fields are populated with meaningful data</rule>
  </rules>
</agent>
						`,
					},
					{
						role: "user",
						content:
							"Please analyze this CV and extract the structured profile information. Make sure to provide at least one item in each array field.",
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
					skills: z.array(z.string()).min(1),
					experience_level: z.enum(["entry", "mid", "senior", "executive"]),
					job_titles: z.array(z.string()).min(1),
					industries: z.array(z.string()).min(1),
					keywords: z.array(z.string()).min(1),
					education: z.string().min(1),
					years_of_experience: z.number().min(0),
					preferred_locations: z.array(z.string()).min(1),
				}),
			});

			console.log("AI CV Parsing - Token usage:", {
				promptTokens: response.usage?.promptTokens || 0,
				completionTokens: response.usage?.completionTokens || 0,
				totalTokens: response.usage?.totalTokens || 0,
			});

			const result = response.object;
			console.log(
				"CV parsing completed:",
				`${result.skills.length} skills,`,
				`${result.job_titles.length} job titles,`,
				`${result.industries.length} industries,`,
				`${result.years_of_experience}y exp,`,
				`level: ${result.experience_level}`,
			);

			console.log("Sample extracted data:", {
				skills: result.skills.slice(0, 3).join(", ") + "...",
				titles: result.job_titles.slice(0, 2).join(", ") + "...",
				industries: result.industries.slice(0, 2).join(", ") + "...",
				locations: result.preferred_locations.slice(0, 2).join(", ") + "...",
			});

			// Update workflow status to indicate CV parsing completed
			if (args.workflowTrackingId && args.userId) {
				await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
					workflowId: args.workflowTrackingId,
					stage: "cv_parsed",
					percentage: 20,
					userId: args.userId,
				});
			}

			// Validate that all required arrays are non-empty
			if (
				result.skills.length === 0 ||
				result.job_titles.length === 0 ||
				result.industries.length === 0 ||
				result.keywords.length === 0 ||
				result.preferred_locations.length === 0
			) {
				console.warn("Some required arrays are empty, providing fallbacks");

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

				console.log(
					"Using fallback data:",
					`${fallbackResult.skills.length} skills,`,
					`${fallbackResult.job_titles.length} job titles`,
				);
				return fallbackResult;
			}

			return result;
		} catch (error) {
			console.error("Error in CV parsing:", error);

			// Update workflow status to indicate error
			if (args.workflowTrackingId && args.userId) {
				await ctx.runMutation(internal.workflow_status.updateWorkflowStage, {
					workflowId: args.workflowTrackingId,
					stage: "cv_parsing_error",
					percentage: 20,
					userId: args.userId,
				});
			}

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

			console.log(
				"Using fallback profile:",
				`${fallbackProfile.skills.length} skills,`,
				`${fallbackProfile.job_titles.length} job titles,`,
				`level: ${fallbackProfile.experience_level}`,
			);
			return fallbackProfile;
		}
	},
});
