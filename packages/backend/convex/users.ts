import { getAuthUserId } from "@convex-dev/auth/server";
import { internalQuery, query } from "./_generated/server";
import { polar } from "./polar";
import { v } from "convex/values";

export const getMe = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		const subscription = await polar.getCurrentSubscription(ctx, {
			userId: userId,
		});

		const productKey = subscription?.productKey;

		const isPro = productKey === "premiumMonthly";

		const user = await ctx.db.get(userId);
		const userConfig = await ctx.db
			.query("userConfig")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.first();

		return {
			...user,
			isPro,
			role: userConfig?.role,
		};
	},
});

export const getUser = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		const user = await ctx.db.get(userId);
		return user;
	},
});

export const getUserById = internalQuery({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId);
		if (!user) return null;

		// Get subscription data
		const subscription = await polar.getCurrentSubscription(ctx, {
			userId: args.userId,
		});
		const productKey = subscription?.productKey;
		const isPro = productKey === "premiumMonthly";

		// Get user config (for role, if needed elsewhere)
		const userConfig = await ctx.db
			.query("userConfig")
			.withIndex("by_userId", (q) => q.eq("userId", args.userId))
			.first();

		return {
			...user,
			isPro,
			role: userConfig?.role,
		};
	},
});
