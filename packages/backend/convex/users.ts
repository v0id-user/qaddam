import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
import { polar } from "./polar";

export const getMe = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;

		const subscription = await polar.getCurrentSubscription(ctx, {
			userId: userId,
		});


		const productKey = subscription?.productKey;

		const isPro = productKey === 'premiumMonthly';

		const user = await ctx.db.get(userId);
		return {
			...user,
			isPro,
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