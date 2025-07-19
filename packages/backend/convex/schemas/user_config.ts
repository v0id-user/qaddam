import { defineTable } from "convex/server";
import { v } from "convex/values";

export const userConfigSchemas = {
	userConfig: defineTable({
		userId: v.id("users"),
		role: v.union(v.literal("tester"), v.literal("user")),
	}).index("by_userId", ["userId"]),
};