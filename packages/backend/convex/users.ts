import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(userId);
  },
});