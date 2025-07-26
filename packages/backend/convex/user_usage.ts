import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

function getTimestamp(): number {
	return Date.now();
}

// New helper for this new model
async function getMonthlyUsageRow(
	ctx: QueryCtx | MutationCtx,
	userId: Id<"users">,
	startDate: number,
): Promise<Doc<"usage"> | null> {
	return await ctx.db
		.query("usage")
		.withIndex("by_userId_startDate", (q) =>
			q.eq("userId", userId).eq("startDate", startDate),
		)
		.first();
}

// -------- Mutations -------- //

export const initUsage = internalMutation({
	args: { userId: v.id("users"), startDate: v.number() },
	handler: async (ctx, { userId, startDate }) => {
		const existing = await getMonthlyUsageRow(ctx, userId, startDate);
		if (existing) return;

		const now = getTimestamp();

		await ctx.db.insert("usage", {
			userId,
			jobSearchCount: 0,
			startDate,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const incrementJobSearchCount = internalMutation({
	args: { userId: v.id("users"), startDate: v.number() },
	handler: async (ctx, { userId, startDate }) => {
		const now = getTimestamp();
		const usage = await getMonthlyUsageRow(ctx, userId, startDate);

		if (!usage) {
			await ctx.db.insert("usage", {
				userId,
				jobSearchCount: 1,
				startDate,
				createdAt: now,
				updatedAt: now,
			});
			return;
		}

		await ctx.db.patch(usage._id, {
			jobSearchCount: usage.jobSearchCount + 1,
			updatedAt: now,
		});
	},
});

// -------- Query -------- //

export const getUsage = internalQuery({
	args: { userId: v.id("users"), startDate: v.number() },
	handler: async (ctx, { userId, startDate }) => {
		return await getMonthlyUsageRow(ctx, userId, startDate);
	},
});
