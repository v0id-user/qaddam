import { query } from './_generated/server';

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error('Unauthorized');
    }
    return user;
  },
});