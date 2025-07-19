import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { polar } from "./polar";
import { api } from "./_generated/api";

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
		const userConfig = await ctx.db.query("userConfig").withIndex("by_userId", (q) => q.eq("userId", userId)).first();

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
