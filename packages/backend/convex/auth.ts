import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Google],
	callbacks: {
		// `args` are the same the as for `createOrUpdateUser` but include `userId`
		async afterUserCreatedOrUpdated(ctx: MutationCtx, { userId }) {
			await ctx.runMutation(internal.user_usage.initUsage, {
				userId,
				startDate: Date.now(),
			});
		},
	},
});
