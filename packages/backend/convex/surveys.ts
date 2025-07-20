import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
// Get user's survey data
export const getUserSurvey = query({
	args: {
		userId: v.optional(v.id("users")),
	},
	handler: async (ctx, args) => {
		const userId = args.userId || (await getAuthUserId(ctx));
		if (!userId) return null;

		const survey = await ctx.db
			.query("userSurveys")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();

		return survey;
	},
});

// Check if user has completed the survey (boolean helper)
export const hasSurveyCompleted = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return false;

		const survey = await ctx.db
			.query("userSurveys")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();

		return !!survey;
	},
});

// Save user survey
export const saveSurvey = mutation({
	args: {
		profession: v.string(),
		experience: v.string(),
		careerLevel: v.string(),
		jobTitles: v.array(v.string()),
		industries: v.array(v.string()),
		workType: v.string(),
		locations: v.array(v.string()),
		skills: v.array(v.string()),
		languages: v.array(
			v.object({
				language: v.string(),
				proficiency: v.string(),
			}),
		),
		companyTypes: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("User not authenticated");
		}

		// DRY validation
		const requiredStringFields: Array<{ value: string; name: string }> = [
			{ value: args.profession.trim(), name: "Profession" },
			{ value: args.experience, name: "Experience" },
			{ value: args.careerLevel, name: "Career level" },
			{ value: args.workType, name: "Work type" },
		];

		for (const field of requiredStringFields) {
			if (!field.value) {
				throw new Error(`${field.name} is required`);
			}
		}

		const requiredArrayFields: Array<{
			value: unknown[];
			name: string;
			message: string;
		}> = [
			{
				value: args.jobTitles,
				name: "Job titles",
				message: "At least one job title is required",
			},
			{
				value: args.skills,
				name: "Skills",
				message: "At least one skill is required",
			},
			{
				value: args.locations,
				name: "Locations",
				message: "At least one location is required",
			},
		];

		for (const field of requiredArrayFields) {
			if (field.value.length === 0) {
				throw new Error(field.message);
			}
		}

		// Set default industries to Technology if empty (since we're tech-focused)
		const industries =
			args.industries.length > 0 ? args.industries : ["Technology"];

		// Prepare survey data
		const surveyData = {
			...args,
			industries,
			completedAt: Date.now(),
			version: 1, // For future schema migrations
		};

		console.log("💾 Saving survey for user and data:", { userId, surveyData });

		try {
			// Check if user already has a survey
			const existingSurvey = await ctx.db
				.query("userSurveys")
				.withIndex("by_user", (q) => q.eq("userId", userId))
				.first();

			if (existingSurvey) {
				console.log("🔄 Updating existing survey for user:", { userId });
				// Update existing survey
				await ctx.db.patch(existingSurvey._id, surveyData);
			} else {
				console.log("✨ Creating new survey for user:", { userId });
				// Create new survey
				await ctx.db.insert("userSurveys", {
					userId,
					...surveyData,
				});
			}

			console.log("✅ Survey saved successfully for user:", { userId });
			return {
				success: true,
				message: "Survey saved successfully",
				timestamp: Date.now(),
			};
		} catch (error) {
			console.log("❌ Error saving survey:", { error });
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			throw new Error(`Failed to save survey: ${errorMessage}`);
		}
	},
});

// Delete user survey (for testing or user requests)
export const deleteSurvey = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("User not authenticated");
		}

		const existingSurvey = await ctx.db
			.query("userSurveys")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();

		if (existingSurvey) {
			await ctx.db.delete(existingSurvey._id);
			console.log("🗑️ Survey deleted for user:", { userId });
			return { success: true, message: "Survey deleted successfully" };
		} else {
			return { success: false, message: "No survey found to delete" };
		}
	},
});

// Get survey statistics (for admin/debugging)
export const getSurveyStats = query({
	args: {},
	handler: async (ctx) => {
		const surveys = await ctx.db.query("userSurveys").collect();

		const stats: {
			totalSurveys: number;
			professions: Record<string, number>;
			experienceLevels: Record<string, number>;
			careerLevels: Record<string, number>;
			workTypes: Record<string, number>;
			mostPopularSkills: Record<string, number>;
			mostPopularLocations: Record<string, number>;
		} = {
			totalSurveys: surveys.length,
			professions: {},
			experienceLevels: {},
			careerLevels: {},
			workTypes: {},
			mostPopularSkills: {},
			mostPopularLocations: {},
		};

		surveys.forEach((survey) => {
			// Count professions
			stats.professions[survey.profession] =
				(stats.professions[survey.profession] || 0) + 1;

			// Count experience levels
			stats.experienceLevels[survey.experience] =
				(stats.experienceLevels[survey.experience] || 0) + 1;

			// Count career levels
			stats.careerLevels[survey.careerLevel] =
				(stats.careerLevels[survey.careerLevel] || 0) + 1;

			// Count work types
			stats.workTypes[survey.workType] =
				(stats.workTypes[survey.workType] || 0) + 1;

			// Count skills
			survey.skills.forEach((skill) => {
				stats.mostPopularSkills[skill] =
					(stats.mostPopularSkills[skill] || 0) + 1;
			});

			// Count locations
			survey.locations.forEach((location) => {
				stats.mostPopularLocations[location] =
					(stats.mostPopularLocations[location] || 0) + 1;
			});
		});

		return stats;
	},
});

// Internal query to get survey results
export const getSurveyResults = internalQuery({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args): Promise<Doc<"userSurveys">[]> => {
		return await ctx.db
			.query("userSurveys")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.take(1);
	},
});
