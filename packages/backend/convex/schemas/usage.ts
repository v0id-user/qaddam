import { defineTable } from "convex/server";
import { v } from "convex/values";

export const usageSchemas = {
	usage: defineTable({
		userId: v.id("users"),
		jobSearchCount: v.number(),
		startDate: v.number(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_userId", ["userId"])
		.index("by_userId_startDate", ["userId", "startDate"]),
};
