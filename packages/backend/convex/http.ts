import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { polar } from "./polar";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const http = httpRouter();

auth.addHttpRoutes(http);
polar.registerRoutes(http, {
	onSubscriptionUpdated: async (ctx, event) => {
		// Handle subscription updates, like cancellations.
		// Note that a cancelled subscription will not be deleted from the database,
		// so this information remains available without a hook, eg., via
		// `getCurrentSubscription()`.
		if (event.data.customerCancellationReason) {
			console.log("Customer cancelled:", {
				customerCancellationReason: event.data.customerCancellationReason,
			});
			// Update usage dates
			const startedAt =
				event.data.startedAt instanceof Date
					? event.data.startedAt.getTime()
					: typeof event.data.startedAt === "number"
						? event.data.startedAt
						: null;
			if (startedAt !== null) {
				await ctx.runMutation(internal.user_usage.initUsage, {
					userId: event.data.customerId as Id<"users">,
					startDate: startedAt,
				});
			} else {
				throw new Error("Started at is null");
			}
		}
	},
	onSubscriptionCreated: async (ctx, event) => {
		// Update usage dates
		const startedAt =
			event.data?.startedAt instanceof Date
				? event.data.startedAt.getTime()
				: typeof event.data?.startedAt === "number"
					? event.data.startedAt
					: null;
		if (startedAt !== null) {
			await ctx.runMutation(internal.user_usage.initUsage, {
				userId: event.data.customerId as Id<"users">,
				startDate: startedAt,
			});
		} else {
			throw new Error("Started at is null");
		}
	},
});

export default http;
