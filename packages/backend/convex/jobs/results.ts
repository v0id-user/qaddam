import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getJobSearchResults = internalQuery({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("jobSearchJobResults")
			.withIndex("by_user", (q) => q.eq("userId", args.userId))
			.collect();
	},
});
