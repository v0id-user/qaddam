import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(userId);
  },
});

export const getUserSurvey = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const survey = await ctx.db
      .query("userSurveys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return survey;
  },
});

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
    languages: v.array(v.object({
      language: v.string(),
      proficiency: v.string(),
    })),
    companyTypes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    // Check if user already has a survey
    const existingSurvey = await ctx.db
      .query("userSurveys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingSurvey) {
      // Update existing survey
      await ctx.db.patch(existingSurvey._id, {
        ...args,
        completedAt: Date.now(),
      });
    } else {
      // Create new survey
      await ctx.db.insert("userSurveys", {
        userId,
        ...args,
        completedAt: Date.now(),
      });
    }

    return { success: true };
  },
});