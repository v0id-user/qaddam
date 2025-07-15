import { Polar } from "@convex-dev/polar";
import { api, components } from "./_generated/api";

export const polar = new Polar(components.polar, {
	products: {
		premiumMonthly: "b97a0870-765f-4e94-8cee-f8099a7e1edb",
	},
	getUserInfo: async (ctx): Promise<{ userId: string; email: string }> => {
		const user = await ctx.runQuery(api.users.getMe);
		if (!user || !user._id || typeof user.email !== "string") {
			throw new Error("User not found or missing email");
		}
		return {
			userId: user._id,
			email: user.email,
		};
	},
});
