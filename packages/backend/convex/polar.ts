import { Polar } from "@convex-dev/polar";
import { api, components } from "./_generated/api";
import { action } from "./_generated/server";

export const polar = new Polar(components.polar, {
	products: {
		premiumMonthly: "b97a0870-765f-4e94-8cee-f8099a7e1edb",
	},
	getUserInfo: async (ctx): Promise<{ userId: string; email: string }> => {
		const user = await ctx.runQuery(api.users.getUser);
		if (!user || typeof user.email !== "string") {
			throw new Error("User not found or email is invalid");
		}
		return {
			userId: user._id,
			email: user.email,
		};
	},
});

export const syncProducts = action({
	args: {},
	handler: async (ctx) => {
		await polar.syncProducts(ctx);
	},
});

export const {
	// If you configure your products by key in the Polar constructor,
	// this query provides a keyed object of the products.
	getConfiguredProducts,

	// Lists all non-archived products, useful if you don't configure products by key.
	listAllProducts,

	// Generates a checkout link for the given product IDs.
	generateCheckoutLink,

	// Generates a customer portal URL for the current user.
	generateCustomerPortalUrl,

	// Changes the current subscription to the given product ID.
	changeCurrentSubscription,

	// Cancels the current subscription.
	cancelCurrentSubscription,
} = polar.api();
