import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

export const changeMyRole = mutation({
	handler: async (ctx, { role }: { role: "tester" | "user" }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("User not found");
		}

		// Check if a userConfig already exists for this user
		const existingConfig = await ctx.db
			.query("userConfig")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.first();

		if (existingConfig) {
			// Update the existing userConfig document
			await ctx.db.patch(existingConfig._id, { role });
		} else {
			// Insert a new userConfig document
			await ctx.db.insert("userConfig", {
				userId,
				role,
			});
		}

		return {
			role,
		};
	},
});

export const getMyRole = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error("User not found");
		}

		const userConfig = await ctx.db
			.query("userConfig")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.first();

		if (!userConfig) {
			return "user";
		}

		return userConfig.role;
	},
});