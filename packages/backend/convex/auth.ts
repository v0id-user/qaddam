import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Google],
	callbacks: {
		// `args` are the same the as for `createOrUpdateUser` but include `userId`
		async afterUserCreatedOrUpdated(ctx: MutationCtx, { userId }) {
			const user = await ctx.db.get(userId);
			if (!user) {
				throw new Error("User not found");
			}
			await ctx.runMutation(internal.user_usage.initUsage, {
				userId,
				startDate: user._creationTime,
			});
		},
	},
});
